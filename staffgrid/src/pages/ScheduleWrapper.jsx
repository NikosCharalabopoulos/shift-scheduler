// staffgrid/src/pages/ScheduleWrapper.jsx
import React, { useEffect, useMemo, useState } from "react";
import WeekSchedule from "./Schedule"; // <-- το υπάρχον admin weekly page, ΔΕΝ το αλλάζουμε
import MonthNav from "../components/MonthNav";
import MyMonthGrid from "../components/MyMonthGrid";
import {
  getMonthRange,
  addMonths,
} from "../utils/date";
import { api, getErrorMessage } from "../lib/api";
import useAssignmentsRange from "../hooks/useAssignmentsRange";

export default function ScheduleWrapper() {
  const [view, setView] = useState("WEEK"); // "WEEK" | "MONTH"

  // Departments for filter (Month view)
  const [departments, setDepartments] = useState([]);
  const [depId, setDepId] = useState(""); // "" = All
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

  // Month state (anchor)
  const [anchor, setAnchor] = useState(() => new Date());
  const month = useMemo(() => getMonthRange(anchor), [anchor]);

  // Fetch assignments for the whole month
  const { data, loading, err } = useAssignmentsRange(month.fromYMD, month.toYMD);

  // Client-side filter by department (shift.department populated)
  const filtered = useMemo(() => {
    if (!depId) return data;
    return (data || []).filter(a => a.shift?.department?._id === depId);
  }, [data, depId]);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Schedule</h1>

      {/* Toggle Week/Month */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setView("WEEK")}
          style={{
            ...toggleBtn,
            background: view === "WEEK" ? "#0ea5e9" : "white",
            color: view === "WEEK" ? "white" : "black",
          }}
        >
          Week
        </button>
        <button
          onClick={() => setView("MONTH")}
          style={{
            ...toggleBtn,
            background: view === "MONTH" ? "#0ea5e9" : "white",
            color: view === "MONTH" ? "white" : "black",
          }}
        >
          Month
        </button>
      </div>

      {view === "WEEK" ? (
        // ⬇️ Αφήνουμε το υπάρχον weekly admin UI όπως είναι
        <WeekSchedule />
      ) : (
        <>
          {/* Controls για Month view: Department select + MonthNav */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 14, color: "#475569" }}>Department:</label>
              <select
                value={depId}
                onChange={(e) => setDepId(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 220 }}
                title="Φίλτρο ανά τμήμα (All = όλα τα τμήματα)"
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
              assignments={filtered}
            />
          )}
        </>
      )}
    </div>
  );
}

const toggleBtn = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  cursor: "pointer",
};
