// staffgrid/src/components/DepartmentFormModal.jsx
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
  Typography,
} from "@mui/material";

export default function DepartmentFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial?._id);
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setDescription(initial?.description || "");
      setError("");
      setSubmitting(false);
    }
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.patch(`/departments/${initial._id}`, { name, description });
      } else {
        await api.post("/departments", { name, description });
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !submitting && onClose?.()} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Department" : "New Department"}</DialogTitle>

      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              inputProps={{ maxLength: 80 }}
              helperText={`${name.length}/80`}
              size="small"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={3}
              size="small"
            />
            {error && <Typography color="error">{error}</Typography>}
            {/* hidden submit so Enter works */}
            <button type="submit" style={{ display: "none" }} />
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
