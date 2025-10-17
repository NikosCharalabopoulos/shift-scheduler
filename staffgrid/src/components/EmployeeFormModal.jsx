import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

export default function EmployeeFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial?._id);

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [userId, setUserId] = useState(initial?.user?._id || "");
  const [departmentId, setDepartmentId] = useState(initial?.department?._id || "");
  const [position, setPosition] = useState(initial?.position || "");
  const [contractHours, setContractHours] = useState(initial?.contractHours ?? 40);

  const [loadingRefs, setLoadingRefs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoadingRefs(true);
    Promise.all([api.get("/users"), api.get("/departments")])
      .then(([u, d]) => {
        setUsers(u.data || []);
        setDepartments(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingRefs(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      setUserId(initial?.user?._id || "");
      setDepartmentId(initial?.department?._id || "");
      setPosition(initial?.position || "");
      setContractHours(initial?.contractHours ?? 40);
      setError("");
    }
  }, [open, initial]);

  const employeeUsers = useMemo(
    () => users.filter(u => u.role === "EMPLOYEE"),
    [users]
  );

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.patch(`/employees/${initial._id}`, {
          department: departmentId,
          position,
          contractHours: Number(contractHours)
        });
      } else {
        await api.post("/employees", {
          user: userId,
          department: departmentId,
          position,
          contractHours: Number(contractHours)
        });
      }
      onSaved?.();
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
        <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit Employee" : "New Employee"}</h3>

        {loadingRefs ? (
          <div>Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
            {!isEdit && (
              <label>
                <div>User (EMPLOYEE)</div>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  style={styles.input}
                >
                  <option value="" disabled>Select user…</option>
                  {employeeUsers.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} — {u.email}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              <div>Department</div>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                style={styles.input}
              >
                <option value="" disabled>Select department…</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </label>

            <label>
              <div>Position</div>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Agent"
                style={styles.input}
              />
            </label>

            <label>
              <div>Contract hours (per week)</div>
              <input
                type="number"
                min={0}
                value={contractHours}
                onChange={(e) => setContractHours(e.target.value)}
                style={styles.input}
              />
            </label>

            {error && <div style={{ color: "#ef4444" }}>{error}</div>}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={onClose} style={styles.secondaryBtn} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save changes" : "Create")}
              </button>
            </div>
          </form>
        )}
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
    width: 520,
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
