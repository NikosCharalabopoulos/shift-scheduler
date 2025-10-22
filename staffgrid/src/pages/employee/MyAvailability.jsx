// staffgrid/src/pages/employee/MyAvailability.jsx
import React, { useMemo, useState } from "react";
import useMyAvailability from "../../hooks/useMyAvailability";
import AvailabilityFormModal from "../../components/AvailabilityFormModal";

const WEEKDAY_LABEL = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export default function MyAvailability() {
  const { rows, loading, err, createItem, updateItem, deleteItem } = useMyAvailability();
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const wd = WEEKDAY_LABEL[r.weekday] || String(r.weekday);
      return (
        wd.toLowerCase().includes(q) ||
        (r.startTime || "").includes(q) ||
        (r.endTime || "").includes(q)
      );
    });
  }, [rows, query]);

  async function onCreateOrUpdate(payload, id) {
    if (id) {
      await updateItem(id, payload);
    } else {
      await createItem(payload);
    }
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

      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <input
          placeholder="Search weekday/time…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 280 }}
        />
        <button
          style={primaryBtn}
          onClick={() => { setEditing(null); setOpenForm(true); }}
        >
          New Availability
        </button>
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
                <th style={{ width: 160 }}>Start</th>
                <th style={{ width: 160 }}>End</th>
                <th style={{ width: 200 }}>Created</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>{WEEKDAY_LABEL[r.weekday] || r.weekday}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AvailabilityFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={onCreateOrUpdate}
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
