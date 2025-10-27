import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import { startOfWeek, addDays, formatYMDLocal, formatShort } from "../utils/date";
import ShiftFormModal from "../components/ShiftFormModal";
import AssignModal from "../components/AssignModal";
import WeekNav from "../components/WeekNav";

// MUI
import {
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from "@mui/material";

export default function Schedule({ onAnyChange }) {
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState(""); // "" = All
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [openShiftForm, setOpenShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [assignFor, setAssignFor] = useState(null);

  // per-shift busy for Delete
  const [busyShift, setBusyShift] = useState({});
  const isBusy = (id) => !!busyShift[id];
  const setBusy = (id, on) =>
    setBusyShift((b) => (on ? { ...b, [id]: true } : (delete b[id], { ...b })));

  useEffect(() => {
    api
      .get("/departments")
      .then((r) => {
        setDepartments(r.data || []);
        // default: All Departments => κρατάμε departmentId = ""
      })
      .catch(() => {});
  }, []);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  async function fetchShifts() {
    setLoading(true);
    setErr("");
    try {
      const from = formatYMDLocal(days[0]);
      const to = formatYMDLocal(addDays(days[6], 1)); // exclusive
      const params = { from, to };
      if (departmentId) params.department = departmentId; // φίλτρο μόνο αν έχει επιλεγεί
      const { data } = await api.get("/shifts", { params });
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

  // Ετικέτα εβδομάδας (ίδια λογική με employee view)
  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    const sameMonth = weekStart.getMonth() === end.getMonth();
    return sameMonth
      ? `${weekStart.toLocaleDateString(undefined, { month: "short" })} ${weekStart.getDate()}–${end.getDate()}, ${end.getFullYear()}`
      : `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${end.getFullYear()}`;
  }, [weekStart]);

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
      onAnyChange?.();
      alert("Shift deleted.");
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setBusy(id, false);
    }
  }

  async function handleShiftSaved() {
    setOpenShiftForm(false);
    await fetchShifts();
    onAnyChange?.();
  }

  async function handleAssignChanged() {
    setAssignFor(null);
    await fetchShifts();
    onAnyChange?.();
  }

  return (
    <Box p={3}>
      {/* Header: centered WeekNav */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "center", sm: "center" }}
        justifyContent="center"
        spacing={1.5}
        sx={{ width: "100%", mt: 1 }}
      >
        <WeekNav
          label={weekLabel}
          onPrev={prevWeek}
          onToday={todayWeek}
          onNext={nextWeek}
        />
      </Stack>

      {/* Controls */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} sx={{ mt: 2 }}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="dep-label">Department</InputLabel>
          <Select
            labelId="dep-label"
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <MenuItem value="">
              <em>All Departments</em>
            </MenuItem>
            {departments.map((d) => (
              <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={() => { setEditingShift(null); setOpenShiftForm(true); }}
          sx={{ ml: { sm: "auto" } }}
        >
          New Shift
        </Button>
      </Stack>

      {loading && <Typography sx={{ mt: 2 }}>Loading…</Typography>}
      {err && <Typography color="error" sx={{ mt: 2 }}>{err}</Typography>}

      {/* Week grid */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {days.map((d) => {
          const key = formatYMDLocal(d);
          const list = shiftsByDate[key] || [];
          return (
            <Grid item xs={12} sm={6} md={4} lg={12/7} key={key}>
              <Paper variant="outlined" sx={{ p: 1.5, minHeight: 160, display: "flex", flexDirection: "column" }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>{formatShort(d)}</Typography>

                {list.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No shifts</Typography>
                ) : (
                  <Stack spacing={1}>
                    {list.map((s) => {
                      const rowBusy = isBusy(s._id);
                      return (
                        <Paper key={s._id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                            <Box>
                              <Typography fontWeight={600}>
                                {s.startTime}–{s.endTime}
                              </Typography>
                              {/* προαιρετικά δείξε και τμήμα όταν είναι All */}
                              {(!departmentId && s.department?.name) && (
                                <Typography variant="body2" color="text.secondary">
                                  {s.department.name}
                                </Typography>
                              )}
                              {s.notes && (
                                <Typography variant="body2" color="text.secondary">{s.notes}</Typography>
                              )}
                              {rowBusy && (
                                <Typography variant="caption" color="text.secondary">Processing…</Typography>
                              )}
                            </Box>

                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => { setEditingShift(s); setOpenShiftForm(true); }}
                                disabled={rowBusy}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => deleteShift(s._id)}
                                disabled={rowBusy}
                              >
                                {rowBusy ? "Deleting…" : "Delete"}
                              </Button>
                            </Stack>
                          </Stack>

                          <Divider sx={{ my: 1 }} />

                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => setAssignFor(s)}
                              disabled={rowBusy}
                            >
                              Assign
                            </Button>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Modals */}
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
    </Box>
  );
}
