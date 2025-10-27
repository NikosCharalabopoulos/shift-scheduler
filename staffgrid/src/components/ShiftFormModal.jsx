import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

// MUI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

export default function ShiftFormModal({ open, onClose, onSaved, initial, departmentId, date }) {
  const isEdit = Boolean(initial?._id);
  const [departments, setDepartments] = useState([]);
  const [dep, setDep] = useState(departmentId || initial?.department?._id || "");
  const [shiftDate, setShiftDate] = useState(initial?.date?.slice(0, 10) || date || "");
  const [startTime, setStartTime] = useState(initial?.startTime || "09:00");
  const [endTime, setEndTime] = useState(initial?.endTime || "17:00");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDep(departmentId || initial?.department?._id || "");
      setShiftDate(initial?.date?.slice(0, 10) || date || "");
      setStartTime(initial?.startTime || "09:00");
      setEndTime(initial?.endTime || "17:00");
      setNotes(initial?.notes || "");
      setError("");
      api.get("/departments").then(r => setDepartments(r.data || [])).catch(()=>{});
    }
  }, [open, initial, departmentId, date]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      if (isEdit) {
        await api.patch(`/shifts/${initial._id}`, { department: dep, date: shiftDate, startTime, endTime, notes });
      } else {
        await api.post("/shifts", { department: dep, date: shiftDate, startTime, endTime, notes });
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => !submitting && onClose?.()} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Shift" : "New Shift"}</DialogTitle>

      <DialogContent dividers>
        <form onSubmit={submit}>
          <Stack spacing={2}>
            <FormControl size="small" required>
              <InputLabel id="dep-label">Department</InputLabel>
              <Select
                labelId="dep-label"
                label="Department"
                value={dep}
                onChange={(e) => setDep(e.target.value)}
              >
                {departments.map(d => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              size="small"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Start"
                type="time"
                size="small"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End"
                type="time"
                size="small"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <TextField
              label="Notes (optional)"
              size="small"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />

            {error && <Typography color="error">{error}</Typography>}
          </Stack>

          {/* Hidden submit so Enter works */}
          <button type="submit" style={{ display: "none" }} />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={submitting}>
          {submitting ? "Saving..." : (isEdit ? "Save" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
