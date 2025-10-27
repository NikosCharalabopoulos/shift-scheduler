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

// MUI
import {
  Box,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  CircularProgress,
} from "@mui/material";

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
    <Box p={2}>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" gap={1}>
        <Typography variant="h5" fontWeight={700}>My Schedule</Typography>

        <ToggleButtonGroup
          size="small"
          color="primary"
          value={view}
          exclusive
          onChange={(_, val) => { if (val) setView(val); }}
        >
          <ToggleButton value="WEEK">Week</ToggleButton>
          <ToggleButton value="MONTH">Month</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {view === "WEEK" ? (
        <>
          <Box mt={2}>
            <WeekNav
              label={week.label}
              onPrev={() => setAnchor((d) => addDays(d, -7))}
              onToday={() => setAnchor(new Date())}
              onNext={() => setAnchor((d) => addDays(d, +7))}
            />
          </Box>

          {loading && (
            <Stack direction="row" alignItems="center" gap={1.5} mt={2}>
              <CircularProgress size={20} />
              <Typography>Loading…</Typography>
            </Stack>
          )}
          {err && <Typography color="error" mt={2}>{err}</Typography>}

          {!loading && !err && (
            <Paper variant="outlined" sx={{ mt: 2, p: { xs: 1, sm: 1.5 } }}>
              <MyScheduleGrid days={week.days} assignments={data} />
            </Paper>
          )}
        </>
      ) : (
        <>
          <Box mt={2}>
            <MonthNav
              label={month.label}
              onPrev={() => setAnchor((d) => addMonths(d, -1))}
              onToday={() => setAnchor(new Date())}
              onNext={() => setAnchor((d) => addMonths(d, +1))}
            />
          </Box>

          {loading && (
            <Stack direction="row" alignItems="center" gap={1.5} mt={2}>
              <CircularProgress size={20} />
              <Typography>Loading…</Typography>
            </Stack>
          )}
          {err && <Typography color="error" mt={2}>{err}</Typography>}

          {!loading && !err && (
            <Paper variant="outlined" sx={{ mt: 2, p: { xs: 1, sm: 1.5 } }}>
              <MyMonthGrid
                matrix={month.matrix}
                month={anchor.getMonth()}
                assignments={data}
              />
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
