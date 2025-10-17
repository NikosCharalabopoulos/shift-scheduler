import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Welcome, <b>{user?.fullName}</b> — role: <code>{user?.role}</code></p>
      <button onClick={logout}>Logout</button>
      <div style={{ marginTop: 16 }}>
        <a href="/users">Users</a> · <a href="/departments">Departments</a> · <a href="/employees">Employees</a>
      </div>
    </div>
  );
}
