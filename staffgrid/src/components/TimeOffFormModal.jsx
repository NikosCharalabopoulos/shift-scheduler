// staffgrid/src/components/TimeOffFormModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { formatYMDLocal } from "../utils/date";
import { getErrorMessage } from "../lib/api";

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
  Typography,
} from "@mui/material";

export default function TimeOffFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = !!initial?._id;

  const initialState = useMemo(() => {
    if (!initial) {
      return {
        type: "VACATION",
        startDate: formatYMDLocal(new Date()),
        endDate: formatYMDLocal(new Date()),
        reason: "",
      };
    }
    return {
      type: initial.type || "VACATION",
      startDate: initial.startDate
        ? formatYMDLocal(new Date(initial.startDate))
        : formatYMDLocal(new Date()),
      endDate: initial.endDate
        ? formatYMDLocal(new Date(initial.endDate))
        : formatYMDLocal(new Date()),
      reason: initial.reason || "",
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

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    if (!form.startDate || !form.endDate) return "Start/End date required";
    if (form.endDate < form.startDate) return "End date must be on/after start date";
    if (!["VACATION", "SICK", "OTHER"].includes(form.type)) return "Invalid type";
    return "";
  }

  async function onSubmit(e) {
    e?.preventDefault?.();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      const payload = {
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason?.trim() || undefined,
      };
      await onSaved(payload, isEdit ? initial._id : null);
      onClose?.();
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => !submitting && onClose?.()} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Time Off" : "New Time Off"}</DialogTitle>

      <DialogContent dividers>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <FormControl size="small">
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                label="Type"
                name="type"
                value={form.type}
                onChange={onChange}
              >
                <MenuItem value="VACATION">VACATION</MenuItem>
                <MenuItem value="SICK">SICK</MenuItem>
                <MenuItem value="OTHER">OTHER</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={onChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={onChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Reason (optional)"
              name="reason"
              value={form.reason}
              onChange={onChange}
              multiline
              minRows={3}
              size="small"
              fullWidth
            />

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
