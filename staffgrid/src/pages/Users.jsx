// staffgrid/src/pages/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import CreateUserModal from "../components/CreateUserModal";

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
  CircularProgress,
  Chip,
} from "@mui/material";

export default function Users() {
  const { user } = useAuth(); // guard ήδη στο routing
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/users");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        (r.fullName || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.role || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const roleColor = (role) =>
    role === "OWNER" ? "secondary" :
    role === "MANAGER" ? "primary" :
    role === "EMPLOYEE" ? "success" : "default";

  return (
    <Box p={3}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Typography variant="h5" fontWeight={700}>Users</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            placeholder="Search name/email/role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
          />
          <Button variant="contained" onClick={() => setOpenCreate(true)}>
            New User
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
        <Typography color="text.secondary" sx={{ mt: 2 }}>No users found.</Typography>
      )}

      {/* Table */}
      {!loading && !err && filtered.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell width={160}>Role</TableCell>
                <TableCell width={220}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{r.fullName || "—"}</TableCell>
                  <TableCell>{r.email || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.role || "—"}
                      color={roleColor(r.role)}
                      variant="filled"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Modal */}
      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={fetchUsers}
      />
    </Box>
  );
}
