// staffgrid/src/pages/Departments.jsx
import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import DepartmentFormModal from "../components/DepartmentFormModal";

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

export default function Departments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  async function fetchDepartments() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/departments");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function onDelete(id) {
    setDeletingId(id);
    setDeleting(true);
    setDeleteErr("");
    try {
      await api.delete(`/departments/${id}`);
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
        <Typography variant="h5" fontWeight={700}>Departments</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            placeholder="Search name/description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => { setEditing(null); setOpenForm(true); }}
          >
            New Department
          </Button>
        </Stack>
      </Stack>

      {/* States */}
      {loading && (
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 2 }}>
          <CircularProgress size={20} />
          <Typography>Loading…</Typography>
        </Stack>
      )}
      {err && <Typography color="error" sx={{ mt: 2 }}>{err}</Typography>}
      {!loading && !err && filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>No departments found.</Typography>
      )}

      {/* Table */}
      {!loading && !err && filtered.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={240}>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell width={200}>Created</TableCell>
                <TableCell align="right" width={120}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => {
                const isDeletingThis = deleting && deletingId === r._id;
                return (
                  <TableRow key={r._id} hover>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>
                      <Typography noWrap title={r.description || ""} color={r.description ? "inherit" : "text.secondary"}>
                        {r.description || "—"}
                      </Typography>
                    </TableCell>
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
                                const ok = confirm(`Delete department "${r.name}"?`);
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
      <DepartmentFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={fetchDepartments}
        initial={editing}
      />
    </Box>
  );
}
