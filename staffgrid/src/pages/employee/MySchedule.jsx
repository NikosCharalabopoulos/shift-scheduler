// staffgrid/src/pages/employee/MySchedule.jsx
import React, { useMemo, useState } from "react";
import {
  startOfWeek,
  addDays,
  addMonths,
  getMonthRange,
  formatYMDLocal,
  getWeekLabel,
} from "../../utils/date";
import useMyAssignments from "../../hooks/useMyAssignments";

// Components
import WeekNav from "../../components/WeekNav";
import MonthNav from "../../components/MonthNav";
import MyScheduleGrid from "../../components/MyScheduleGrid";
import MyMonthGrid from "../../components/MyMonthGrid";
import ViewToggle from "../../components/ViewToggle";

// MUI
import { Box, Stack, Typography } from "@mui/material";

export default function MySchedule() {
  const [anchor, setAnchor] = useState(() => new Date());
  const [view, setView] = useState("WEEK"); // "WEEK" | "MONTH"

  // Week state
  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekLabel = useMemo(() => getWeekLabel(anchor), [anchor]);

  // Month state
  const month = useMemo(() => getMonthRange(anchor), [anchor]);

  // Επιλογή range ανά προβολή
  const fromYMD = view === "WEEK" ? formatYMDLocal(weekDays[0]) : month.fromYMD;
  const toYMD   = view === "WEEK" ? formatYMDLocal(weekDays[6]) : month.toYMD;

  const { data, loading, err } = useMyAssignments(fromYMD, toYMD);

  return (
    <Box p={2}>
      {/* Header: Title · Week/Month Nav (center) · View toggle (right) */}
     {/* Header row: Title (left) + View toggle (right) */}
<Stack
  direction="row"
  alignItems="center"
  justifyContent="space-between"
  sx={{ mb: 1.5 }}
>
  <Typography variant="h5" fontWeight={700}>My Schedule</Typography>
  <ViewToggle value={view} onChange={setView} />
</Stack>

{/* Navigation row: Week/Month label + prev/today/next (centered, one line lower) */}
<Box
  sx={{
    mt: 2,              // μία “γραμμή” πιο κάτω
    mb: 2,              // λίγο κενό πριν το grid
    display: "flex",
    justifyContent: "center",
  }}
>
  {view === "WEEK" ? (
    <WeekNav
      label={weekLabel}
      onPrev={() => setAnchor((d) => addDays(d, -7))}
      onToday={() => setAnchor(new Date())}
      onNext={() => setAnchor((d) => addDays(d, +7))}
    />
  ) : (
    <MonthNav
      label={month.label}
      onPrev={() => setAnchor((d) => addMonths(d, -1))}
      onToday={() => setAnchor(new Date())}
      onNext={() => setAnchor((d) => addMonths(d, +1))}
    />
  )}
</Box>


      {/* Περιεχόμενο */}
      {loading && <Typography sx={{ mt: 2 }}>Loading…</Typography>}
      {err && <Typography color="error" sx={{ mt: 2 }}>{err}</Typography>}

      {!loading && !err && (
        view === "WEEK" ? (
          <MyScheduleGrid days={weekDays} assignments={data} />
        ) : (
          <MyMonthGrid
            matrix={month.matrix}
            month={anchor.getMonth()}
            // MyMonthGrid στο employee χρησιμοποιεί μόνο assignments
            assignments={data}
          />
        )
      )}
    </Box>
  );
}
