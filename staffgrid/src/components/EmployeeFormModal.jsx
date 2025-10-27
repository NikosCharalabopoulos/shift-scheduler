// staffgrid/src/components/EmployeeFormModal.jsx
import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

// MUI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";

export default function EmployeeFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial?._id);

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [userId, setUserId] = useState(initial?.user?._id || "");
  const [departmentId, setDepartmentId] = useState(initial?.department?._id || "");
  const [position, setPosition] = useState(initial?.position || "");
  const [contractHours, setContractHours] = useState(initial?.contractHours ?? 40);

  const [loadingRefs, setLoadingRefs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoadingRefs(true);
    Promise.all([api.get("/users"), api.get("/departments")])
      .then(([u, d]) => {
        setUsers(u.data || []);
        setDepartments(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingRefs(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      setUserId(initial?.user?._id || "");
      setDepartmentId(initial?.department?._id || "");
      setPosition(initial?.position || "");
      setContractHours(initial?.contractHours ?? 40);
      setError("");
    }
  }, [open, initial]);

  const employeeUsers = useMemo(() => users.filter((u) => u.role === "EMPLOYEE"), [users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.patch(`/employees/${initial._id}`, {
          department: departmentId,
          position,
          contractHours: Number(contractHours),
        });
      } else {
        await api.post("/employees", {
          user: userId,
          department: departmentId,
          position,
          contractHours: Number(contractHours),
        });
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
      <DialogTitle>{isEdit ? "Edit Employee" : "New Employee"}</DialogTitle>

      <DialogContent dividers>
        {loadingRefs ? (
          <Stack direction="row" alignItems="center" gap={1}>
            <CircularProgress size={18} />
            <Typography color="text.secondary">Loading…</Typography>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {!isEdit && (
                <FormControl size="small" required>
                  <InputLabel id="user-label">User (EMPLOYEE)</InputLabel>
                  <Select
                    labelId="user-label"
                    label="User (EMPLOYEE)"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <MenuItem value="" disabled>
                      Select user…
                    </MenuItem>
                    {employeeUsers.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.fullName} — {u.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl size="small" required>
                <InputLabel id="dep-label">Department</InputLabel>
                <Select
                  labelId="dep-label"
                  label="Department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <MenuItem value="" disabled>
                    Select department…
                  </MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d._id} value={d._id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Position"
                placeholder="e.g. Agent"
                size="small"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />

              <TextField
                label="Contract hours (per week)"
                type="number"
                inputProps={{ min: 0 }}
                size="small"
                value={contractHours}
                onChange={(e) => setContractHours(e.target.value)}
              />

              {error && <Typography color="error">{error}</Typography>}

              {/* hidden submit for Enter key */}
              <button type="submit" style={{ display: "none" }} />
            </Stack>
          </form>
        )}
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
