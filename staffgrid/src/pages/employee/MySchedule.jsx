// staffgrid/src/pages/employee/MySchedule.jsx
import React, { useMemo, useState } from "react";
import {
  startOfWeek,
  addDays,
  formatYMDLocal,
  getMonthRange,
  addMonths,
} from "../../utils/date";
import useMyAssignments from "../../hooks/useMyAssignments";
import WeekNav from "../../components/WeekNav";
import MonthNav from "../../components/MonthNav";
import MyScheduleGrid from "../../components/MyScheduleGrid";
import MyMonthGrid from "../../components/MyMonthGrid";

function getWeekState(anchor) {
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const sameMonth = start.getMonth() === end.getMonth();
  const label = sameMonth
    ? `${start.toLocaleDateString(undefined, { month: "short" })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`
    : `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${end.getFullYear()}`;
  return {
    start,
    end,
    fromYMD: formatYMDLocal(start),
    toYMD: formatYMDLocal(end),
    days,
    label,
  };
}

export default function MySchedule() {
  const [anchor, setAnchor] = useState(() => new Date());
  const [view, setView] = useState("WEEK"); // "WEEK" | "MONTH"

  // Week state
  const week = useMemo(() => getWeekState(anchor), [anchor]);

  // Month state
  const month = useMemo(() => getMonthRange(anchor), [anchor]);

  // Επιλογή range ανάλογα με την προβολή
  const fromYMD = view === "WEEK" ? week.fromYMD : month.fromYMD;
  const toYMD = view === "WEEK" ? week.toYMD : month.toYMD;

  const { data, loading, err } = useMyAssignments(fromYMD, toYMD);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>My Schedule</h1>

      {/* Toggle Week/Month */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
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
        <>
          <WeekNav
            label={week.label}
            onPrev={() => setAnchor((d) => addDays(d, -7))}
            onToday={() => setAnchor(new Date())}
            onNext={() => setAnchor((d) => addDays(d, +7))}
          />
          {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
          {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}
          {!loading && !err && <MyScheduleGrid days={week.days} assignments={data} />}
        </>
      ) : (
        <>
          <MonthNav
            label={month.label}
            onPrev={() => setAnchor((d) => addMonths(d, -1))}
            onToday={() => setAnchor(new Date())}
            onNext={() => setAnchor((d) => addMonths(d, +1))}
          />
          {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
          {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}
          {!loading && !err && (
            <MyMonthGrid
              matrix={month.matrix}
              month={anchor.getMonth()}
              assignments={data}
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
