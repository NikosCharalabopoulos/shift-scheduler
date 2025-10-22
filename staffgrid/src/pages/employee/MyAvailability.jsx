// staffgrid/src/pages/employee/MyAvailability.jsx
import React, { useMemo, useState } from "react";
import useMyAvailability from "../../hooks/useMyAvailability";
import AvailabilityFormModal from "../../components/AvailabilityFormModal";
import { startOfWeek, addDays, formatYMDLocal } from "../../utils/date";

const WEEKDAY_LABEL = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

// Δίνει το offset (μέρες) από Monday-start για ένα weekday (0..6, Sunday=0)
function weekdayOffsetFromMonday(weekday) {
  // Monday=1 → 0, Tuesday=2 → 1, ..., Sunday=0 → 6
  return weekday === 0 ? 6 : weekday - 1;
}

export default function MyAvailability() {
  const { rows, loading, err, createItem, createMany, updateItem, deleteItem } = useMyAvailability();

  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState("");

  // ✅ ΝΕΟ: Reference week (για να προβάλλουμε ακριβείς ημερομηνίες)
  const [refYMD, setRefYMD] = useState(() => formatYMDLocal(new Date()));
  const mondayOfRefWeek = useMemo(() => startOfWeek(new Date(refYMD)), [refYMD]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const wd = WEEKDAY_LABEL[r.weekday] || String(r.weekday);
      const dateForRow = (() => {
        const offset = weekdayOffsetFromMonday(r.weekday);
        const d = addDays(mondayOfRefWeek, offset);
        return formatYMDLocal(d);
      })();
      return (
        wd.toLowerCase().includes(q) ||
        (r.startTime || "").includes(q) ||
        (r.endTime || "").includes(q) ||
        dateForRow.includes(q)
      );
    });
  }, [rows, query, mondayOfRefWeek]);

  async function onCreateOrUpdate(payload, id) {
    if (id) {
      await updateItem(id, payload);
    } else {
      await createItem(payload);
    }
  }

  async function onCreateMany(payloads) {
    await createMany(payloads);
  }

  async function onDelete(id) {
    setBusyId(id);
    try {
      await deleteItem(id);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>My Availability</h1>

      {/* Controls row: search + reference week */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <input
          placeholder="Search weekday/time/date…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 280 }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 14, color: "#475569" }}>Reference week:</label>
          <input
            type="date"
            value={refYMD}
            onChange={(e) => setRefYMD(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
            title="Pick any date — θα χρησιμοποιηθεί η εβδομάδα (Δευτέρα–Κυριακή) που την περιέχει"
          />
          <button
            style={primaryBtn}
            onClick={() => { setEditing(null); setOpenForm(true); }}
          >
            New Availability
          </button>
        </div>
      </div>

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
      {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div style={{ marginTop: 16, color: "#64748b" }}>No availability entries.</div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ width: 140 }}>Weekday</th>
                {/* ✅ ΝΕΟ: ακριβής ημερομηνία αυτής της μέρας μέσα στην επιλεγμένη εβδομάδα */}
                <th style={{ width: 180 }}>Date (in selected week)</th>
                <th style={{ width: 160 }}>Start</th>
                <th style={{ width: 160 }}>End</th>
                <th style={{ width: 200 }}>Created</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const offset = weekdayOffsetFromMonday(r.weekday);
                const dateObj = addDays(mondayOfRefWeek, offset);
                const dateLabel = formatYMDLocal(dateObj);

                return (
                  <tr key={r._id}>
                    <td>{WEEKDAY_LABEL[r.weekday] || r.weekday}</td>
                    <td>{dateLabel}</td>
                    <td>{r.startTime}</td>
                    <td>{r.endTime}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          style={secondaryBtn}
                          onClick={() => { setEditing(r); setOpenForm(true); }}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            ...dangerBtn,
                            opacity: busyId === r._id ? 0.6 : 1,
                            cursor: busyId === r._id ? "wait" : "pointer"
                          }}
                          disabled={busyId === r._id}
                          onClick={() => {
                            const ok = confirm(`Delete ${WEEKDAY_LABEL[r.weekday] || r.weekday} ${r.startTime}-${r.endTime}?`);
                            if (ok) onDelete(r._id);
                          }}
                        >
                          {busyId === r._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AvailabilityFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={onCreateOrUpdate}
        onSaveMany={onCreateMany}
        initial={editing}
      />
    </div>
  );
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid #e2e8f0"
};

const primaryBtn = {
  padding: "8px 10px",
  borderRadius: 8,
  border: 0,
  background: "#22c55e",
  color: "black",
  fontWeight: 600,
  cursor: "pointer"
};

const secondaryBtn = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer"
};

const dangerBtn = {
  padding: "8px 10px",
  borderRadius: 8,
  border: 0,
  background: "#ef4444",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};
