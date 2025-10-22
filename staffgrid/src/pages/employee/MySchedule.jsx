// staffgrid/src/pages/employee/MySchedule.jsx
import React, { useMemo, useState } from "react";
import { startOfWeek, addDays, formatYMDLocal } from "../../utils/date";
import useMyAssignments from "../../hooks/useMyAssignments";
import WeekNav from "../../components/WeekNav";
import MyScheduleGrid from "../../components/MyScheduleGrid";

function getWeekState(anchor) {
  // Monday-first start
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  // Ετικέτα εβδομάδας π.χ. "Oct 20–26, 2025"
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

  const { start, end, fromYMD, toYMD, days, label } = useMemo(
    () => getWeekState(anchor),
    [anchor]
  );

  const { data, loading, err } = useMyAssignments(fromYMD, toYMD);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>My Schedule</h1>

      <WeekNav
        label={label}
        onPrev={() => setAnchor((d) => addDays(d, -7))}
        onToday={() => setAnchor(new Date())}
        onNext={() => setAnchor((d) => addDays(d, +7))}
      />

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
      {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}

      {!loading && !err && (
        <MyScheduleGrid days={days} assignments={data} />
      )}
    </div>
  );
}
