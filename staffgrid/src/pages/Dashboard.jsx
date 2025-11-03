import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../lib/api";

// MUI
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  Divider,
  Skeleton,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LogoutIcon from "@mui/icons-material/Logout";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WatchLaterIcon from "@mui/icons-material/WatchLater";

function formatYMDLocal(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const role = user?.role;

  const today = useMemo(() => new Date(), []);
  const todayYMD = useMemo(() => formatYMDLocal(today), [today]);
  const in7daysYMD = useMemo(() => formatYMDLocal(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)), [today]);

  // Manager/Owner KPIs
  const [pendingCount, setPendingCount] = useState(null);  // null => loading, number => ok
  const [kpiErr, setKpiErr] = useState("");

  // Employee widgets
  const [nextShift, setNextShift] = useState(null);
  const [empErr, setEmpErr] = useState("");

  useEffect(() => {
    let live = true;

    async function loadManagerKPIs() {
      setKpiErr("");
      try {
        // Count PENDING time-off (server returns array)
        const { data } = await api.get("/timeoff", { params: { status: "PENDING" } });
        if (!live) return;
        setPendingCount(Array.isArray(data) ? data.length : 0);
      } catch (e) {
        if (!live) return;
        setKpiErr(getErrorMessage(e));
        setPendingCount(0);
      }
    }

    async function loadEmployeeWidgets() {
      setEmpErr("");
      try {
        // next assignment in 7 days window
        const { data } = await api.get("/shift-assignments", {
          params: { from: todayYMD, to: in7daysYMD },
        });
        if (!live) return;
        const list = Array.isArray(data) ? data : [];
        // pick earliest by date + startTime
        const sorted = list
          .filter(a => a.shift?.date && a.shift?.startTime)
          .sort((a, b) => {
            const ad = a.shift.date.slice(0,10);
            const bd = b.shift.date.slice(0,10);
            if (ad !== bd) return ad.localeCompare(bd);
            return (a.shift.startTime || "").localeCompare(b.shift.startTime || "");
          });
        setNextShift(sorted[0] || null);
      } catch (e) {
        if (!live) return;
        setEmpErr(getErrorMessage(e));
        setNextShift(null);
      }
    }

    if (role === "OWNER" || role === "MANAGER") loadManagerKPIs();
    if (role === "EMPLOYEE") loadEmployeeWidgets();

    return () => { live = false; };
  }, [role, todayYMD, in7daysYMD]);

  return (
    <Box p={3}>
      {/* Header row */}
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome, <b>{user?.fullName}</b> — role: <code>{user?.role}</code>
          </Typography>
        </Stack>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
          Logout
        </Button>
      </Stack>

      {/* Quick actions */}
      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick actions</Typography>
        { (role === "OWNER" || role === "MANAGER") ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" component={RouterLink} to="/schedule" startIcon={<ViewWeekIcon />}>Schedule</Button>
            <Button variant="outlined" component={RouterLink} to="/timeoff-admin" startIcon={<EventAvailableIcon />}>Time Off Requests</Button>
            <Button variant="outlined" component={RouterLink} to="/employees" startIcon={<PeopleIcon />}>Employees</Button>
            <Button variant="outlined" component={RouterLink} to="/departments" startIcon={<ApartmentIcon />}>Departments</Button>
            <Button variant="outlined" component={RouterLink} to="/users" startIcon={<ManageAccountsIcon />}>Users</Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" component={RouterLink} to="/my-schedule" startIcon={<CalendarMonthIcon />}>My Schedule</Button>
            <Button variant="outlined" component={RouterLink} to="/my-timeoff" startIcon={<EventAvailableIcon />}>My Time Off</Button>
            <Button variant="outlined" component={RouterLink} to="/my-availability" startIcon={<WatchLaterIcon />}>My Availability</Button>
          </Stack>
        )}
      </Paper>

      {/* Role-specific widgets */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {(role === "OWNER" || role === "MANAGER") && (
          <>
            {/* Pending time-off KPI */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Pending time-off</Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  {pendingCount === null ? (
                    <Skeleton variant="rounded" width={56} height={32} />
                  ) : (
                    <Chip label={`${pendingCount}`} color={pendingCount > 0 ? "warning" : "success"} />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {kpiErr ? kpiErr : (pendingCount > 0 ? "review needed" : "all clear")}
                  </Typography>
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" component={RouterLink} to="/timeoff-admin">
                    Review requests
                  </Button>
                  <Button size="small" variant="outlined" component={RouterLink} to="/schedule">
                    Open schedule
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Today snapshot (optional lightweight) */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Today</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Use the Schedule to view or assign today’s shifts quickly.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" component={RouterLink} to="/schedule">Go to Schedule</Button>
                </Stack>
              </Paper>
            </Grid>
          </>
        )}

        {role === "EMPLOYEE" && (
          <>
            {/* Next shift card */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Your next shift</Typography>
                <Stack sx={{ mt: 1 }} spacing={0.5}>
                  {nextShift === null && !empErr && (
                    <Typography variant="body2" color="text.secondary">— No upcoming shift within 7 days —</Typography>
                  )}
                  {empErr && (
                    <Typography variant="body2" color="error">{empErr}</Typography>
                  )}
                  {nextShift && (
                    <>
                      <Typography fontWeight={600}>
                        {new Date(nextShift.shift.date).toLocaleDateString()} · {nextShift.shift.startTime}–{nextShift.shift.endTime}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {nextShift.shift.department?.name || "Department"}
                      </Typography>
                    </>
                  )}
                </Stack>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" component={RouterLink} to="/my-schedule">Open My Schedule</Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Time-off quick entry */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Time off</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Create a request and track its status.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" component={RouterLink} to="/my-timeoff">
                    Go to My Time Off
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}
