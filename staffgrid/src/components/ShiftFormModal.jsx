import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

export default function ShiftFormModal({ open, onClose, onSaved, initial, departmentId, date }) {
  const isEdit = Boolean(initial?._id);
  const [departments, setDepartments] = useState([]);
  const [dep, setDep] = useState(departmentId || initial?.department?._id || "");
  const [shiftDate, setShiftDate] = useState(initial?.date?.slice(0, 10) || date || "");
  const [startTime, setStartTime] = useState(initial?.startTime || "09:00");
  const [endTime, setEndTime] = useState(initial?.endTime || "17:00");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDep(departmentId || initial?.department?._id || "");
      setShiftDate(initial?.date?.slice(0, 10) || date || "");
      setStartTime(initial?.startTime || "09:00");
      setEndTime(initial?.endTime || "17:00");
      setNotes(initial?.notes || "");
      setError("");
      api.get("/departments").then(r => setDepartments(r.data || [])).catch(()=>{});
    }
  }, [open, initial, departmentId, date]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      if (isEdit) {
        await api.patch(`/shifts/${initial._id}`, {
          department: dep, date: shiftDate, startTime, endTime, notes
        });
      } else {
        await api.post("/shifts", {
          department: dep, date: shiftDate, startTime, endTime, notes
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
      <div style={styles.modal} onClick={(e)=>e.stopPropagation()}>
        <h3 style={{marginTop:0}}>{isEdit ? "Edit Shift" : "New Shift"}</h3>
        <form onSubmit={submit} style={{ display:"grid", gap:10 }}>
          <label>
            <div>Department</div>
            <select value={dep} onChange={e=>setDep(e.target.value)} required style={styles.input}>
              <option value="" disabled>Select department…</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </label>
          <label>
            <div>Date</div>
            <input type="date" value={shiftDate} onChange={e=>setShiftDate(e.target.value)} required style={styles.input}/>
          </label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <label>
              <div>Start</div>
              <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} required style={styles.input}/>
            </label>
            <label>
              <div>End</div>
              <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} required style={styles.input}/>
            </label>
          </div>
          <label>
            <div>Notes</div>
            <input value={notes} onChange={e=>setNotes(e.target.value)} style={styles.input} placeholder="Optional"/>
          </label>

          {error && <div style={{ color:"#ef4444" }}>{error}</div>}

          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button type="button" onClick={onClose} style={styles.secondaryBtn} disabled={submitting}>Cancel</button>
            <button type="submit" style={styles.primaryBtn} disabled={submitting}>{submitting ? "Saving..." : (isEdit ? "Save" : "Create")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop:{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)", display:"grid", placeItems:"center", zIndex:50 },
  modal:{ width:480, background:"white", color:"#0f172a", borderRadius:12, padding:20, boxShadow:"0 10px 30px rgba(0,0,0,0.2)" },
  input:{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #cbd5e1", marginTop:4 },
  primaryBtn:{ padding:"10px 12px", borderRadius:8, border:0, background:"#22c55e", color:"black", fontWeight:600, cursor:"pointer" },
  secondaryBtn:{ padding:"10px 12px", borderRadius:8, border:"1px solid #cbd5e1", background:"white", cursor:"pointer" }
};
