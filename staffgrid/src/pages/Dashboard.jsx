import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>
        Welcome, <b>{user?.fullName}</b> — role: <code>{user?.role}</code>
      </p>
      <button onClick={logout}>Logout</button>

      <div style={{ marginTop: 16 }}>
        {/* Links για OWNER & MANAGER */}
        {(user?.role === "OWNER" || user?.role === "MANAGER") && (
          <>
            <a href="/users">Users</a> ·{" "}
            <a href="/departments">Departments</a> ·{" "}
            <a href="/employees">Employees</a> ·{" "}
            <a href="/schedule">Schedule</a> ·{" "}
            <a href="/timeoff-admin">Time Off Requests</a> {/* ✅ ΝΕΟ link */}
          </>
        )}

        {/* Links για EMPLOYEE */}
        {user?.role === "EMPLOYEE" && (
          <>
            <a href="/my-schedule">My Schedule</a> ·{" "}
            <a href="/my-timeoff">My Time Off</a> ·{" "}
            <a href="/my-availability">My Availability</a>
          </>
        )}
      </div>
    </div>
  );
}
