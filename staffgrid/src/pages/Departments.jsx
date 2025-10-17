import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import DepartmentFormModal from "../components/DepartmentFormModal";

export default function Departments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  async function fetchDepartments() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/departments");
      setRows(data);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function onDelete(id) {
    setDeletingId(id);
    setDeleting(true);
    setDeleteErr("");
    try {
      await api.delete(`/departments/${id}`);
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      setDeleteErr(getErrorMessage(e));
    } finally {
      setDeleting(false);
      setDeletingId("");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Departments</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Search name/description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 260 }}
          />
          <button
            style={styles.primaryBtn}
            onClick={() => { setEditing(null); setOpenForm(true); }}
          >
            New Department
          </button>
        </div>
      </div>

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
      {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div style={{ marginTop: 16, color: "#64748b" }}>No departments found.</div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 240 }}>Name</th>
                <th>Description</th>
                <th style={{ width: 200 }}>Created</th>
                <th style={{ width: 140 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.description || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button
                        style={styles.secondaryBtn}
                        onClick={() => { setEditing(r); setOpenForm(true); }}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          ...styles.dangerBtn,
                          opacity: deletingId === r._id && deleting ? 0.6 : 1,
                          cursor: deletingId === r._id && deleting ? "wait" : "pointer"
                        }}
                        onClick={() => {
                          const ok = confirm(`Delete department "${r.name}"?`);
                          if (ok) onDelete(r._id);
                        }}
                        disabled={deleting && deletingId === r._id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deleteErr && <div style={{ marginTop: 12, color: "#ef4444" }}>{deleteErr}</div>}
        </div>
      )}

      <DepartmentFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={fetchDepartments}
        initial={editing}
      />
    </div>
  );
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #e2e8f0"
  },
  primaryBtn: {
    padding: "8px 10px",
    borderRadius: 8,
    border: 0,
    background: "#22c55e",
    color: "black",
    fontWeight: 600,
    cursor: "pointer"
  },
  secondaryBtn: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer"
  },
  dangerBtn: {
    padding: "8px 10px",
    borderRadius: 8,
    border: 0,
    background: "#ef4444",
    color: "white",
    fontWeight: 600,
    cursor: "pointer"
  }
};
