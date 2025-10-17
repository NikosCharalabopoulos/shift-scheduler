import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("pass1234");

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.ok) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      display: "grid",
      placeItems: "center",
      background: "#0f172a",
      color: "white"
    }}>
      <form onSubmit={onSubmit} style={{
        width: 360,
        display: "grid",
        gap: 12,
        background: "rgba(255,255,255,0.06)",
        padding: 24,
        borderRadius: 12
      }}>
        <h1 style={{ margin: 0 }}>StaffGrid — Login</h1>
        <label>
          <div>Email</div>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #334155" }}
          />
        </label>
        <label>
          <div>Password</div>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #334155" }}
          />
        </label>
        {error && <div style={{ color: "#fca5a5" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: 0,
            background: loading ? "#64748b" : "#22c55e",
            color: "black",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
