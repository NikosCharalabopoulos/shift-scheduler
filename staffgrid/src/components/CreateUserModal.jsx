import { useState } from "react";
import { api, getErrorMessage } from "../lib/api";

export default function CreateUserModal({ open, onClose, onCreated }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const reset = () => {
    setFullName("");
    setEmail("");
    setRole("EMPLOYEE");
    setPassword("");
    setError("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/users", { fullName, email, role, password });
      reset();
      onCreated?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>New User</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <label>
            <div>Full name</div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={styles.input}
            />
          </label>
          <label>
            <div>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </label>
          <label>
            <div>Password (min 6)</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />
          </label>
          <label>
            <div>Role</div>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
              <option value="OWNER">OWNER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
            </select>
          </label>

          {error && <div style={{ color: "#ef4444" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <button type="button" onClick={onClose} style={styles.secondaryBtn} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" style={styles.primaryBtn} disabled={submitting}>
              {submitting ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "grid",
    placeItems: "center",
    zIndex: 50
  },
  modal: {
    width: 420,
    background: "white",
    color: "#0f172a",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    marginTop: 4
  },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: 0,
    background: "#22c55e",
    color: "black",
    fontWeight: 600,
    cursor: "pointer"
  },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer"
  }
};
