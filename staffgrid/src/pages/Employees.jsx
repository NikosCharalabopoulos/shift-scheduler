// staffgrid/src/pages/Employees.jsx
import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import EmployeeFormModal from "../components/EmployeeFormModal";

// MUI
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  async function fetchEmployees() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/employees");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const name = r.user?.fullName?.toLowerCase() || "";
      const email = r.user?.email?.toLowerCase() || "";
      const dep = r.department?.name?.toLowerCase() || "";
      const pos = r.position?.toLowerCase() || "";
      return name.includes(q) || email.includes(q) || dep.includes(q) || pos.includes(q);
    });
  }, [rows, query]);

  async function onDelete(id) {
    setDeletingId(id);
    setDeleting(true);
    setDeleteErr("");
    try {
      await api.delete(`/employees/${id}`);
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      setDeleteErr(getErrorMessage(e));
    } finally {
      setDeleting(false);
      setDeletingId("");
    }
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" gap={2}>
        <Typography variant="h5" fontWeight={700}>Employees</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            placeholder="Search name/email/department/position…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => { setEditing(null); setOpenForm(true); }}
          >
            New Employee
          </Button>
        </Stack>
      </Stack>

      {/* Loading / Error / Empty */}
      {loading && (
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading…</Typography>
        </Stack>
      )}
      {err && <Typography color="error" sx={{ mt: 2 }}>{err}</Typography>}
      {!loading && !err && filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>No employees found.</Typography>
      )}

      {/* Table */}
      {!loading && !err && filtered.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={240}>Name</TableCell>
                <TableCell width={260}>Email</TableCell>
                <TableCell width={200}>Department</TableCell>
                <TableCell width={160}>Position</TableCell>
                <TableCell width={140}>Contract Hours</TableCell>
                <TableCell width={200}>Created</TableCell>
                <TableCell align="right" width={120}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => {
                const isDeletingThis = deleting && deletingId === r._id;
                return (
                  <TableRow key={r._id} hover>
                    <TableCell>{r.user?.fullName || "—"}</TableCell>
                    <TableCell>{r.user?.email || "—"}</TableCell>
                    <TableCell>{r.department?.name || "—"}</TableCell>
                    <TableCell>{r.position || <span style={{ color: "#94a3b8" }}>—</span>}</TableCell>
                    <TableCell>{r.contractHours ?? <span style={{ color: "#94a3b8" }}>—</span>}</TableCell>
                    <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => { setEditing(r); setOpenForm(true); }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={isDeletingThis}
                              onClick={() => {
                                const ok = confirm(`Delete employee "${r.user?.fullName}"?`);
                                if (ok) onDelete(r._id);
                              }}
                            >
                              {isDeletingThis ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {deleteErr && <Typography color="error" sx={{ mt: 1.5 }}>{deleteErr}</Typography>}

      {/* Modal */}
      <EmployeeFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={fetchEmployees}
        initial={editing}
      />
    </Box>
  );
}
