import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import { startOfWeek, addDays, formatYMDLocal, formatShort } from "../utils/date";
import ShiftFormModal from "../components/ShiftFormModal";
import AssignModal from "../components/AssignModal";

export default function Schedule({ onAnyChange }) {
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [openShiftForm, setOpenShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [assignFor, setAssignFor] = useState(null);

  // per-shift busy for destructive actions (delete)
  const [busyShift, setBusyShift] = useState({});
  const isBusy = (id) => !!busyShift[id];
  const setBusy = (id, on) =>
    setBusyShift((b) => (on ? { ...b, [id]: true } : (b[id] && delete b[id], { ...b })));

  useEffect(() => {
    api
      .get("/departments")
      .then((r) => {
        setDepartments(r.data || []);
        if (r.data?.length && !departmentId) setDepartmentId(r.data[0]._id);
      })
      .catch(() => {});
  }, []);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  async function fetchShifts() {
    if (!departmentId) return;
    setLoading(true);
    setErr("");
    try {
      const from = formatYMDLocal(days[0]);
      const to = formatYMDLocal(addDays(days[6], 1)); // exclusive
      const { data } = await api.get("/shifts", { params: { department: departmentId, from, to } });
      setShifts(data || []);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, weekStart]);

  function nextWeek() { setWeekStart((prev) => addDays(prev, 7)); }
  function prevWeek() { setWeekStart((prev) => addDays(prev, -7)); }
  function todayWeek() { setWeekStart(startOfWeek(new Date())); }

  const shiftsByDate = useMemo(() => {
    const map = {};
    for (const s of shifts) {
      const key = s.date.slice(0, 10);
      (map[key] ||= []).push(s);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [shifts]);

  async function deleteShift(id) {
    if (isBusy(id)) return;
    const ok = confirm("Delete this shift?");
    if (!ok) return;
    setBusy(id, true);
    try {
      await api.delete(`/shifts/${id}`);
      await fetchShifts();
      onAnyChange?.(); // ενημέρωσε π.χ. Month
      alert("Shift deleted.");
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setBusy(id, false);
    }
  }

  // helper για modal saves (create/edit)
  async function handleShiftSaved() {
    setOpenShiftForm(false);
    await fetchShifts();
    onAnyChange?.();
  }

  // helper για AssignModal αλλαγές (assign/unassign)
  async function handleAssignChanged() {
    setAssignFor(null);
    await fetchShifts();
    onAnyChange?.();
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Schedule</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={prevWeek}>← Prev</button>
          <button onClick={todayWeek}>Today</button>
          <button onClick={nextWeek}>Next →</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
        <label>
          <span style={{ marginRight: 6 }}>Department</span>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => { setEditingShift(null); setOpenShiftForm(true); }}
          style={{ padding: "8px 10px", borderRadius: 8, border: 0, background: "#22c55e", color: "black", fontWeight: 600 }}
        >
          New Shift
        </button>
      </div>

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
      {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, marginTop: 16, alignItems: "start" }}
      >
        {days.map((d) => {
          const key = formatYMDLocal(d);
          const list = shiftsByDate[key] || [];
          return (
            <div key={key} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, minHeight: 140 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{formatShort(d)}</div>
              {list.length === 0 ? (
                <div style={{ color: "#94a3b8" }}>No shifts</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {list.map((s) => {
                    const rowBusy = isBusy(s._id);
                    return (
                      <div key={s._id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {s.startTime}–{s.endTime}
                            </div>
                            {s.notes && <div style={{ color: "#64748b", fontSize: 13 }}>{s.notes}</div>}
                            {rowBusy && <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Processing…</div>}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => { setEditingShift(s); setOpenShiftForm(true); }}
                              disabled={rowBusy}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteShift(s._id)}
                              disabled={rowBusy}
                              style={{ background: rowBusy ? "#fca5a5" : "#ef4444", color: "white", border: 0, borderRadius: 6, padding: "6px 8px" }}
                            >
                              {rowBusy ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </div>
                        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                          <button onClick={() => setAssignFor(s)} style={{ padding: "6px 8px", borderRadius: 6 }} disabled={rowBusy}>
                            Assign
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ShiftFormModal
        open={openShiftForm}
        onClose={() => setOpenShiftForm(false)}
        onSaved={handleShiftSaved}
        initial={editingShift}
        departmentId={departmentId}
        date={undefined}
      />

      <AssignModal
        open={Boolean(assignFor)}
        onClose={() => setAssignFor(null)}
        onChanged={handleAssignChanged}
        shift={assignFor}
      />
    </div>
  );
}
