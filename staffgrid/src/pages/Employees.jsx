import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import EmployeeFormModal from "../components/EmployeeFormModal";

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  async function fetchEmployees() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/employees");
      setRows(data);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const name = r.user?.fullName?.toLowerCase() || "";
      const email = r.user?.email?.toLowerCase() || "";
      const dep = r.department?.name?.toLowerCase() || "";
      const pos = r.position?.toLowerCase() || "";
      return (
        name.includes(q) || email.includes(q) || dep.includes(q) || pos.includes(q)
      );
    });
  }, [rows, query]);

  async function onDelete(id) {
    setDeletingId(id);
    setDeleting(true);
    setDeleteErr("");
    try {
      await api.delete(`/employees/${id}`);
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
        <h2 style={{ margin: 0 }}>Employees</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Search name/email/department/position…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 320 }}
          />
          <button
            style={styles.primaryBtn}
            onClick={() => { setEditing(null); setOpenForm(true); }}
          >
            New Employee
          </button>
        </div>
      </div>

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
      {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div style={{ marginTop: 16, color: "#64748b" }}>No employees found.</div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 240 }}>Name</th>
                <th style={{ width: 260 }}>Email</th>
                <th style={{ width: 200 }}>Department</th>
                <th style={{ width: 160 }}>Position</th>
                <th style={{ width: 140 }}>Contract Hours</th>
                <th style={{ width: 200 }}>Created</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>{r.user?.fullName}</td>
                  <td>{r.user?.email}</td>
                  <td>{r.department?.name}</td>
                  <td>{r.position || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                  <td>{r.contractHours ?? <span style={{ color: "#94a3b8" }}>—</span>}</td>
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
                          const ok = confirm(`Delete employee "${r.user?.fullName}"?`);
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

      <EmployeeFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={fetchEmployees}
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
