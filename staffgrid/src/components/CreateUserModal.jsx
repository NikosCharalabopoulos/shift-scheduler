// staffgrid/src/components/CreateUserModal.jsx
import { useState, useEffect } from "react";
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

export default function CreateUserModal({ open, onClose, onCreated }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFullName("");
      setEmail("");
      setRole("EMPLOYEE");
      setPassword("");
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/users", { fullName, email, role, password });
      onCreated?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => !submitting && onClose?.()} fullWidth maxWidth="sm">
      <DialogTitle>New User</DialogTitle>

      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="small"
            />
            <TextField
              label="Password (min 6)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              inputProps={{ minLength: 6 }}
              size="small"
            />
            <FormControl size="small" required>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="OWNER">OWNER</MenuItem>
                <MenuItem value="MANAGER">MANAGER</MenuItem>
                <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
              </Select>
            </FormControl>

            {error && <Typography color="error">{error}</Typography>}
            {/* hidden submit for Enter key */}
            <button type="submit" style={{ display: "none" }} />
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? "Creating..." : "Create user"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
