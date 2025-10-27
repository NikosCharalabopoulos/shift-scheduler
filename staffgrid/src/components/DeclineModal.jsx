import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";

export default function DeclineModal({ open, onClose, onConfirm, defaultReason = "" }) {
  const [reason, setReason] = useState(defaultReason);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setReason(defaultReason || "");
      setSubmitting(false);
    }
  }, [open, defaultReason]);

  const submit = async (e) => {
    e?.preventDefault?.();
    setSubmitting(true);
    try {
      await onConfirm?.(reason.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose?.()} fullWidth maxWidth="sm">
      <DialogTitle>Decline request</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={submit}>
          <Stack spacing={2}>
            <TextField
              label="Reason (optional)"
              placeholder="Optional"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={3}
            />
            {/* Hidden submit so Enter works */}
            <button type="submit" style={{ display: "none" }} />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>Cancel</Button>
        <Button onClick={submit} variant="contained" color="warning" disabled={submitting}>
          {submitting ? "Declining…" : "Decline"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
