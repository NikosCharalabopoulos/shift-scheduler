import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

// MUI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

export default function AssignModal({ open, onClose, onChanged, shift }) {
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !shift?._id) return;
    setError("");
    setLoadingLists(true);
    Promise.all([
      api.get("/employees"),
      api.get("/shift-assignments", { params: { shift: shift._id } }),
    ])
      .then(([emps, asg]) => {
        setEmployees(emps.data || []);
        setAssignments(asg.data || []);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoadingLists(false));
  }, [open, shift?._id]);

  const assignedIds = useMemo(() => new Set(assignments.map((a) => a.employee?._id)), [assignments]);
  const availableEmployees = useMemo(
    () => employees.filter((e) => !assignedIds.has(e._id)),
    [employees, assignedIds]
  );

  if (!open || !shift) return null;

  async function assign() {
    if (!employeeId) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/shift-assignments", { shift: shift._id, employee: employeeId });
      alert("Assigned.");
      setEmployeeId("");
      onChanged?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function unassign(assignmentId) {
    const ok = confirm("Unassign this employee from the shift?");
    if (!ok) return;

    setSubmitting(true);
    setError("");
    try {
      await api.delete(`/shift-assignments/${assignmentId}`);
      alert("Unassigned.");
      onChanged?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => !submitting && onClose?.()} fullWidth maxWidth="sm">
      <DialogTitle>
        Assignments — {shift.startTime}–{shift.endTime}
      </DialogTitle>

      <DialogContent dividers>
        {loadingLists ? (
          <Stack direction="row" alignItems="center" gap={1}>
            <CircularProgress size={18} />
            <Typography color="text.secondary">Loading…</Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                Assigned
              </Typography>
              {assignments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No one assigned yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {assignments.map((a) => (
                    <Stack key={a._id} direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Typography>
                        {a.employee?.user?.fullName}{" "}
                        <Typography component="span" variant="body2" color="text.secondary">
                          ({a.employee?.user?.email})
                        </Typography>
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => unassign(a._id)}
                        disabled={submitting}
                      >
                        {submitting ? "..." : "Unassign"}
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>

            <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Assign someone
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                <FormControl size="small" sx={{ minWidth: 280 }}>
                  <InputLabel id="emp-label">Select employee…</InputLabel>
                  <Select
                    labelId="emp-label"
                    label="Select employee…"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    disabled={submitting}
                  >
                    {availableEmployees.map((e) => (
                      <MenuItem key={e._id} value={e._id}>
                        {e.user?.fullName} — {e.user?.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={assign}
                  disabled={submitting || !employeeId}
                >
                  {submitting ? "..." : "Assign"}
                </Button>
              </Stack>
            </Box>

            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
