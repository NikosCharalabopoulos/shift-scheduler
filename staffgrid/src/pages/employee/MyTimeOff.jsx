// staffgrid/src/pages/employee/MyTimeOff.jsx
import React, { useMemo, useState } from "react";
import useMyTimeOff from "../../hooks/useMyTimeOff";
import TimeOffFormModal from "../../components/TimeOffFormModal";

function StatusBadge({ status }) {
  const color =
    status === "APPROVED" ? "#16a34a" :
    status === "DECLINED" ? "#ef4444" :
    "#f59e0b"; // PENDING
  const bg =
    status === "APPROVED" ? "rgba(22,163,74,0.1)" :
    status === "DECLINED" ? "rgba(239,68,68,0.12)" :
    "rgba(245,158,11,0.12)";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      color,
      background: bg
    }}>
      {status}
    </span>
  );
}

export default function MyTimeOff() {
  const { rows, loading, err, createItem, updateItem, deleteItem } = useMyTimeOff();
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const type = (r.type || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      const status = (r.status || "").toLowerCase();
      return type.includes(q) || reason.includes(q) || status.includes(q);
    });
  }, [rows, query]);

  async function onCreateOrUpdate(payload, id) {
    if (id) {
      // edit επιτρέπεται μόνο για PENDING (UI ήδη περιορίζει)
      await updateItem(id, payload);
    } else {
      await createItem(payload);
    }
  }

  async function onDelete(id) {
    setBusyId(id);
    try {
      await deleteItem(id); // backend θα μπλοκάρει μη-PENDING
    } finally {
      setBusyId("");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>My Time Off</h1>

      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <input
          placeholder="Search type/reason/status…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 280 }}
        />
        <button
          style={primaryBtn}
          onClick={() => { setEditing(null); setOpenForm(true); }}
        >
          New Request
        </button>
      </div>

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
      {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div style={{ marginTop: 16, color: "#64748b" }}>No requests yet.</div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ width: 140 }}>Type</th>
                <th style={{ width: 220 }}>Dates</th>
                <th style={{ width: 140 }}>Status</th>
                <th style={{ width: 320 }}>Reason</th>
                <th style={{ width: 200 }}>Created</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const start = new Date(r.startDate).toLocaleDateString();
                const end = new Date(r.endDate).toLocaleDateString();
                const created = new Date(r.createdAt).toLocaleString();
                const isPending = r.status === "PENDING";
                return (
                  <tr key={r._id}>
                    <td>{r.type}</td>
                    <td>{start} — {end}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.reason || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                    <td>{created}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          style={{ ...secondaryBtn, opacity: isPending ? 1 : 0.5, cursor: isPending ? "pointer" : "not-allowed" }}
                          disabled={!isPending}
                          onClick={() => { setEditing(r); setOpenForm(true); }}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            ...dangerBtn,
                            opacity: isPending && busyId !== r._id ? 1 : 0.6,
                            cursor: isPending && busyId !== r._id ? "pointer" : "not-allowed"
                          }}
                          disabled={!isPending || busyId === r._id}
                          onClick={() => {
                            const ok = confirm(`Delete this ${r.type} request (${start} — ${end})?`);
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

      <TimeOffFormModal
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
