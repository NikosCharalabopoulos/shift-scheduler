// staffgrid/src/pages/ScheduleWrapper.jsx
import React, { useEffect, useMemo, useState } from "react";
import WeekSchedule from "./Schedule"; // weekly admin page
import MonthNav from "../components/MonthNav";
import MyMonthGrid from "../components/MyMonthGrid";
import ShiftFormModal from "../components/ShiftFormModal";
import { getMonthRange, addMonths } from "../utils/date";
import { api, getErrorMessage } from "../lib/api";
import useAssignmentsRange from "../hooks/useAssignmentsRange";
import useShiftsRange from "../hooks/useShiftsRange";
import ViewToggle from "../components/ViewToggle"; 

/* -------- QuickAssignModal (Assign/Unassign + Delete Shift) -------- */
function QuickAssignModal({ open, onClose, shift, departmentId, onDone }) {
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const [empsRes, asgRes] = await Promise.all([
        api.get("/employees", { params: departmentId ? { department: departmentId } : {} }),
        api.get("/shift-assignments", { params: { shift: shift?._id } }),
      ]);
      const emps = Array.isArray(empsRes.data) ? empsRes.data : [];
      const asgs = Array.isArray(asgRes.data) ? asgRes.data : [];
      setEmployees(emps);
      setAssignments(asgs);
      const assignedSet = new Set(asgs.map(a => a.employee?._id || a.employee));
      const firstFree = emps.find(e => !assignedSet.has(e._id));
      setEmployeeId(firstFree?._id || "");
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open || !shift?._id) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shift?._id, departmentId]);

  async function assign(e) {
    e.preventDefault();
    if (!employeeId) {
      setErr("Select an employee");
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      await api.post("/shift-assignments", { shift: shift._id, employee: employeeId });
      await loadAll();
      await onDone?.();
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function unassign(assignmentId) {
    if (!assignmentId) return;
    setSubmitting(true);
    setErr("");
    try {
      await api.delete(`/shift-assignments/${assignmentId}`);
      await loadAll();
      await onDone?.();
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteShift() {
    if (!shift?._id) return;
    const ok = confirm("Delete this shift and all its assignments?");
    if (!ok) return;
    setSubmitting(true);
    setErr("");
    try {
      await api.delete(`/shifts/${shift._id}`);
      onClose?.();
      await onDone?.(); // refetchBoth at parent
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const assignedIds = new Set(assignments.map(a => a.employee?._id || a.employee));
  const selectableEmployees = employees.filter(e => !assignedIds.has(e._id));

  const shiftTitle = shift
    ? `${shift.department?.name ? shift.department.name + " — " : ""}${shift.startTime || ""}–${shift.endTime || ""} (${shift.date?.slice(0,10) || ""})`
    : "Shift";

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Assign / Manage Shift</h3>
        <div style={{ marginBottom: 8, color: "#475569", fontSize: 14 }}>{shiftTitle}</div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>Currently assigned</div>
              <button onClick={deleteShift} style={dangerBtn} disabled={submitting} title="Delete this shift">
                {submitting ? "…" : "Delete Shift"}
              </button>
            </div>

            {assignments.length === 0 ? (
              <div style={mutedBox}>No one assigned yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                {assignments.map((a) => (
                  <div key={a._id} style={assignedRow}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.employee?.user?.fullName || "Employee"}</div>
                      {a.employee?.department?.name && (
                        <div style={{ fontSize: 12, color: "#64748b" }}>{a.employee.department.name}</div>
                      )}
                    </div>
                    <button style={outlineDangerBtn} disabled={submitting} onClick={() => unassign(a._id)}>
                      {submitting ? "…" : "Unassign"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={assign} style={{ display: "grid", gap: 10 }}>
              <label>
                <div>Assign another employee</div>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  style={input}
                  disabled={submitting || selectableEmployees.length === 0}
                >
                  {selectableEmployees.length === 0 ? (
                    <option value="">No available employees (already assigned)</option>
                  ) : (
                    <>
                      <option value="">Select employee…</option>
                      {selectableEmployees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.user?.fullName}{emp.department?.name ? ` — ${emp.department.name}` : ""}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </label>

              {err && <div style={{ color: "#ef4444" }}>{err}</div>}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" onClick={onClose} style={secondaryBtn} disabled={submitting}>Close</button>
                <button type="submit" style={primaryBtn} disabled={submitting || selectableEmployees.length === 0}>
                  {submitting ? "Assigning…" : "Assign"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const backdrop   = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "grid", placeItems: "center", zIndex: 50 };
const modal      = { width: 520, maxWidth: "95vw", background: "white", color: "#0f172a", borderRadius: 12, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" };
const input      = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 4 };
const primaryBtn = { padding: "10px 12px", borderRadius: 8, border: 0, background: "#22c55e", color: "black", fontWeight: 600, cursor: "pointer" };
const secondaryBtn = { padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" };
const dangerBtn  = { padding: "8px 12px", borderRadius: 8, border: 0, background: "#ef4444", color: "white", fontWeight: 700, cursor: "pointer" };
const outlineDangerBtn  = { padding: "6px 10px", borderRadius: 8, border: "1px solid #ef4444", background: "white", color: "#ef4444", fontWeight: 600, cursor: "pointer" };
const assignedRow = { display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px" };
const mutedBox   = { border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", color: "#64748b", fontStyle: "italic" };
/* ----------------------------------------------------------------- */

export default function ScheduleWrapper() {
  const [view, setView] = useState("WEEK");

  // Departments (month filter)
  const [departments, setDepartments] = useState([]);
  const [depId, setDepId] = useState("");
  const [depErr, setDepErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchDeps() {
      setDepErr("");
      try {
        const { data } = await api.get("/departments");
        if (mounted) setDepartments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setDepErr(getErrorMessage(e));
      }
    }
    fetchDeps();
    return () => { mounted = false; };
  }, []);

  // Month state & ranges
  const [anchor, setAnchor] = useState(() => new Date());
  const month = useMemo(() => getMonthRange(anchor), [anchor]);

  // Data hooks: SHIFTS & ASSIGNMENTS
  const {
    data: shifts,
    loading: shiftsLoading,
    err: shiftsErr,
    refetch: refetchShifts,
  } = useShiftsRange(month.fromYMD, month.toYMD, depId || undefined);

  const {
    data: assignments,
    loading: asgLoading,
    err: asgErr,
    refetch: refetchAssignments,
  } = useAssignmentsRange(month.fromYMD, month.toYMD);

  const loading = shiftsLoading || asgLoading;
  const err = shiftsErr || asgErr;

  // Create Shift (empty day click)
  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [clickedDateYMD, setClickedDateYMD] = useState("");

  function handleEmptyDayClick(_dateObj, ymd) {
    setClickedDateYMD(ymd);
    setOpenShiftModal(true);
  }

  // Assign/Unassign/Delete (shift pill click)
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  function handleShiftClick(shift) {
    setSelectedShift(shift);
    setOpenAssignModal(true);
  }

  async function refetchBoth() {
    await Promise.all([refetchShifts(), refetchAssignments()]);
  }

  return (
    <div style={{ padding: 16 }}>
   <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  }}
>
  <h1 style={{ margin: 0 }}>Schedule</h1>
  <ViewToggle value={view} onChange={setView} />
</div>


      {view === "WEEK" ? (
        <WeekSchedule onAnyChange={refetchBoth} />
      ) : (
        <>
          {/* Controls: Department filter + Month nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 14, color: "#475569" }}>Department:</label>
              <select
                value={depId}
                onChange={(e) => setDepId(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 220 }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <MonthNav
              label={month.label}
              onPrev={() => setAnchor((d) => addMonths(d, -1))}
              onToday={() => setAnchor(new Date())}
              onNext={() => setAnchor((d) => addMonths(d, +1))}
            />
          </div>

          {depErr && <div style={{ marginTop: 12, color: "#ef4444" }}>{depErr}</div>}
          {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
          {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}

          {!loading && !err && (
            <MyMonthGrid
              matrix={month.matrix}
              month={anchor.getMonth()}
              shifts={shifts}
              assignments={assignments}
              onEmptyDayClick={handleEmptyDayClick}
              onShiftClick={handleShiftClick}
            />
          )}

          {/* Create Shift modal */}
          {openShiftModal && (
            <ShiftFormModal
              open={openShiftModal}
              onClose={() => setOpenShiftModal(false)}
              onSaved={async () => {
                setOpenShiftModal(false);
                await refetchBoth(); // SHIFTS + ASSIGNMENTS
              }}
              initial={null}
              departmentId={depId || ""}
              date={clickedDateYMD}
            />
          )}

          {/* Assign/Unassign/Delete modal */}
          {openAssignModal && (
            <QuickAssignModal
              open={openAssignModal}
              onClose={() => setOpenAssignModal(false)}
              shift={selectedShift}
              departmentId={depId || ""}
              onDone={refetchBoth}
            />
          )}
        </>
      )}
    </div>
  );
}

const toggleBtn = { padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", cursor: "pointer" };
