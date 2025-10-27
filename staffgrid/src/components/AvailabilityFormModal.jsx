// staffgrid/src/components/AvailabilityFormModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../lib/api";
import { startOfWeek, addDays, formatYMDLocal } from "../utils/date";

// MUI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Chip,
} from "@mui/material";

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" }, // 0..6 backend — Sunday=0
];

function weekdayOffsetFromMonday(weekday) {
  return weekday === 0 ? 6 : weekday - 1;
}

export default function AvailabilityFormModal({
  open,
  onClose,
  onSaved,     // (payload, id) for EDIT or single create
  onSaveMany,  // (payloads[]) for batch create
  initial
}) {
  const isEdit = !!initial?._id;

  const initialState = useMemo(() => {
    if (!initial) {
      const todayYMD = new Date().toISOString().slice(0, 10);
      return {
        anchorDate: todayYMD,               // UX only
        selectedDays: new Set([1,2,3,4,5]), // Mon–Fri
        weekday: 1,                         // for edit-only
        startTime: "09:00",
        endTime: "17:00",
      };
    }
    return {
      anchorDate: new Date().toISOString().slice(0, 10),
      selectedDays: new Set([Number(initial.weekday ?? 1)]),
      weekday: typeof initial.weekday === "number" ? initial.weekday : 1,
      startTime: initial.startTime || "09:00",
      endTime: initial.endTime || "17:00",
    };
  }, [initial]);

  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initialState);
      setErr("");
      setSubmitting(false);
    }
  }, [open, initialState]);

  function toggleDay(dayValue) {
    setForm((prev) => {
      const next = new Set(prev.selectedDays);
      if (next.has(dayValue)) next.delete(dayValue);
      else next.add(dayValue);
      return { ...prev, selectedDays: next };
    });
  }

  function onChange(e) {
    const { name, value } = e.target;
    if (name === "anchorDate") {
      setForm((prev) => ({ ...prev, anchorDate: value }));
    } else if (name === "weekday") {
      setForm((prev) => ({ ...prev, weekday: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function validate() {
    if (form.startTime?.length !== 5 || form.endTime?.length !== 5) return "Time must be HH:mm";
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    if (isNaN(sh) || isNaN(eh)) return "Invalid time";
    const s = sh * 60 + sm, e = eh * 60 + em;
    if (e <= s) return "End time must be after start time";
    if (isEdit) {
      if (form.weekday < 0 || form.weekday > 6) return "Weekday must be 0..6";
    } else {
      if (form.selectedDays.size === 0) return "Select at least one weekday";
    }
    return "";
  }

  async function onSubmit(e) {
    e?.preventDefault?.();
    const v = validate();
    if (v) { setErr(v); return; }

    setSubmitting(true);
    setErr("");
    try {
      if (isEdit) {
        const payload = {
          weekday: form.weekday,
          startTime: form.startTime,
          endTime: form.endTime,
        };
        await onSaved?.(payload, initial._id);
      } else {
        const payloads = Array.from(form.selectedDays).map((wd) => ({
          weekday: wd,
          startTime: form.startTime,
          endTime: form.endTime,
        }));
        if (onSaveMany) {
          await onSaveMany(payloads);
        } else {
          for (const p of payloads) {
            // eslint-disable-next-line no-await-in-loop
            await onSaved?.(p, null);
          }
        }
      }
      onClose?.();
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  // Preview ημερομηνιών για την επιλεγμένη εβδομάδα (UX)
  const mondayOfWeek = startOfWeek(new Date(form.anchorDate));
  const previewDates = !isEdit
    ? Array.from(form.selectedDays)
        .sort((a, b) => weekdayOffsetFromMonday(a) - weekdayOffsetFromMonday(b))
        .map((wd) => {
          const d = addDays(mondayOfWeek, weekdayOffsetFromMonday(wd));
          return `${WEEKDAYS.find((w) => w.value === wd)?.label || wd} ${formatYMDLocal(d)}`;
        })
    : [
        (() => {
          const d = addDays(mondayOfWeek, weekdayOffsetFromMonday(form.weekday));
          return `${WEEKDAYS.find((w) => w.value === form.weekday)?.label || form.weekday} ${formatYMDLocal(d)}`;
        })()
      ];

  return (
    <Dialog open={open} onClose={() => !submitting && onClose?.()} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Availability" : "New Availability (batch)"}</DialogTitle>

      <DialogContent dividers>
        {!isEdit && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Tip: Οι ώρες ισχύουν επαναλαμβανόμενα για τις επιλεγμένες μέρες κάθε εβδομάδα.
          </Typography>
        )}

        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            {/* Anchor week */}
            <TextField
              label="Week (anchor date)"
              type="date"
              name="anchorDate"
              value={form.anchorDate}
              onChange={onChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            {/* Multi-day ή single-day επιλογή */}
            {!isEdit ? (
              <Stack spacing={0.5}>
                <Typography variant="body2">Weekdays</Typography>
                <FormGroup row>
                  {WEEKDAYS.map((w) => {
                    const checked = form.selectedDays.has(w.value);
                    return (
                      <FormControlLabel
                        key={w.value}
                        control={
                          <Checkbox
                            size="small"
                            checked={checked}
                            onChange={() => toggleDay(w.value)}
                          />
                        }
                        label={w.label}
                        sx={{ mr: 1.5 }}
                      />
                    );
                  })}
                </FormGroup>
              </Stack>
            ) : (
              <FormControl size="small">
                <InputLabel id="weekday-label">Weekday</InputLabel>
                <Select
                  labelId="weekday-label"
                  label="Weekday"
                  name="weekday"
                  value={form.weekday}
                  onChange={onChange}
                >
                  {WEEKDAYS.map((w) => (
                    <MenuItem key={w.value} value={w.value}>{w.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Ώρες */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start"
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={onChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End"
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={onChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Preview ημερομηνιών αυτής της εβδομάδας */}
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Preview (this week):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {previewDates.map((p, idx) => (
                  <Chip key={idx} label={p} size="small" variant="outlined" />
                ))}
              </Stack>
            </Paper>

            {err && <Typography color="error">{err}</Typography>}
            {/* hidden submit for Enter key */}
            <button type="submit" style={{ display: "none" }} />
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {isEdit ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
