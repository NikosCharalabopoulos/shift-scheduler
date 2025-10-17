import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import CreateUserModal from "../components/CreateUserModal";

export default function Users() {
  const { user } = useAuth(); // already guarded by RoleGuard at routing
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/users");
      setRows(data);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.fullName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.role?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Users</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Search name/email/role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 220 }}
          />
          <button style={styles.primaryBtn} onClick={() => setOpenCreate(true)}>New User</button>
        </div>
      </div>

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
      {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div style={{ marginTop: 16, color: "#64748b" }}>No users found.</div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>{r.fullName}</td>
                  <td>{r.email}</td>
                  <td><code>{r.role}</code></td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={fetchUsers}
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
  }
};
