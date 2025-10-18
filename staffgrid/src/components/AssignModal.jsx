import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

export default function AssignModal({ open, onClose, onChanged, shift }) {
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    Promise.all([
      api.get("/employees"),
      api.get("/shift-assignments", { params: { shift: shift?._id } })
    ])
      .then(([emps, asg]) => {
        setEmployees(emps.data || []);
        setAssignments(asg.data || []);
      })
      .catch(()=>{});
  }, [open, shift?._id]);

  const assignedIds = useMemo(()=> new Set(assignments.map(a => a.employee?._id)), [assignments]);
  const availableEmployees = useMemo(()=> employees.filter(e => !assignedIds.has(e._id)), [employees, assignedIds]);

  if (!open || !shift) return null;

  async function assign() {
    if (!employeeId) return;
    setSubmitting(true); setError("");
    try {
      await api.post("/shift-assignments", {
        shift: shift._id,
        employee: employeeId,
        assignedBy: (window.__currentUserId || null) // optional if you store it; αλλιώς backend μπορεί να δεχτεί manager id που έχεις πρόχειρο
      });
      setEmployeeId("");
      onChanged?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function unassign(assignmentId) {
    setSubmitting(true); setError("");
    try {
      await api.delete(`/shift-assignments/${assignmentId}`);
      onChanged?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e=>e.stopPropagation()}>
        <h3 style={{marginTop:0}}>Assignments — {shift.startTime}–{shift.endTime}</h3>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Assigned</div>
          {assignments.length === 0 ? (
            <div style={{ color:"#64748b" }}>No one assigned yet.</div>
          ) : (
            <ul style={{ margin:0, paddingLeft: 18 }}>
              {assignments.map(a => (
                <li key={a._id} style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                  <span>{a.employee?.user?.fullName} <span style={{ color:"#94a3b8" }}>({a.employee?.user?.email})</span></span>
                  <button style={styles.dangerBtn} onClick={()=>unassign(a._id)} disabled={submitting}>Unassign</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ borderTop:"1px solid #e2e8f0", paddingTop:12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Assign someone</div>
          <div style={{ display:"flex", gap:8 }}>
            <select value={employeeId} onChange={e=>setEmployeeId(e.target.value)} style={styles.input}>
              <option value="">Select employee…</option>
              {availableEmployees.map(e => (
                <option key={e._id} value={e._id}>
                  {e.user?.fullName} — {e.user?.email}
                </option>
              ))}
            </select>
            <button style={styles.primaryBtn} onClick={assign} disabled={submitting || !employeeId}>
              Assign
            </button>
          </div>
        </div>

        {error && <div style={{ color:"#ef4444", marginTop:10 }}>{error}</div>}

        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:14 }}>
          <button style={styles.secondaryBtn} onClick={onClose} disabled={submitting}>Close</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop:{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", display:"grid", placeItems:"center", zIndex:50 },
  modal:{ width:560, background:"white", color:"#0f172a", borderRadius:12, padding:20, boxShadow:"0 10px 30px rgba(0,0,0,0.2)" },
  input:{ padding:"10px 12px", borderRadius:8, border:"1px solid #cbd5e1", minWidth:300 },
  primaryBtn:{ padding:"8px 10px", borderRadius:8, border:0, background:"#22c55e", color:"black", fontWeight:600, cursor:"pointer" },
  secondaryBtn:{ padding:"8px 10px", borderRadius:8, border:"1px solid #cbd5e1", background:"white", cursor:"pointer" },
  dangerBtn:{ padding:"4px 8px", borderRadius:6, border:0, background:"#ef4444", color:"white", cursor:"pointer" }
};
