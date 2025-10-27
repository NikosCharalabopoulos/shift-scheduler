// staffgrid/src/pages/employee/MyTimeOff.jsx
import React, { useMemo, useState } from "react";
import useMyTimeOff from "../../hooks/useMyTimeOff";
import TimeOffFormModal from "../../components/TimeOffFormModal";

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
  Chip,
  CircularProgress,
} from "@mui/material";

function StatusChip({ status }) {
  const color =
    status === "APPROVED" ? "success" :
    status === "DECLINED" ? "error" :
    "warning";
  return (
    <Chip
      size="small"
      color={color}
      label={status}
      sx={{ fontWeight: 700 }}
    />
  );
}

export default function MyTimeOff() {
  const { rows, loading, err, createItem, updateItem, deleteItem } = useMyTimeOff();
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const type = (r.type || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();
      const status = (r.status || "").toLowerCase();
      return type.includes(q) || reason.includes(q) || status.includes(q);
    });
  }, [rows, query]);

  async function onCreateOrUpdate(payload, id) {
    if (id) {
      await updateItem(id, payload);
      alert("Request updated.");
    } else {
      await createItem(payload);
      alert("Request created.");
    }
  }

  async function onDelete(id) {
    setBusyId(id);
    try {
      await deleteItem(id); // backend μπλοκάρει μη-PENDING
      alert("Request deleted.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <Box p={2}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Typography variant="h5" fontWeight={700}>My Time Off</Typography>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            placeholder="Search type/reason/status…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={() => { if (!loading) { setEditing(null); setOpenForm(true); } }}
            disabled={loading}
          >
            New Request
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
        <Typography color="text.secondary" sx={{ mt: 2 }}>No requests yet.</Typography>
      )}

      {/* Table */}
      {!loading && !err && filtered.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={140}>Type</TableCell>
                <TableCell width={220}>Dates</TableCell>
                <TableCell width={160}>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell width={220}>Created</TableCell>
                <TableCell align="right" width={180}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => {
                const start = new Date(r.startDate).toLocaleDateString();
                const end = new Date(r.endDate).toLocaleDateString();
                const created = new Date(r.createdAt).toLocaleString();
                const isPending = r.status === "PENDING";
                const rowBusy = busyId === r._id;

                return (
                  <TableRow key={r._id} hover>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{start} — {end}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <StatusChip status={r.status} />
                        {rowBusy && (
                          <Typography variant="caption" color="text.secondary">
                            Processing…
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap title={r.reason || ""} color={r.reason ? "inherit" : "text.secondary"}>
                        {r.reason || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{created}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={!isPending || rowBusy}
                          onClick={() => { setEditing(r); setOpenForm(true); }}
                        >
                          {rowBusy ? "…" : "Edit"}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={!isPending || rowBusy}
                          onClick={() => {
                            const ok = confirm(`Delete this ${r.type} request (${start} — ${end})?`);
                            if (ok) onDelete(r._id);
                          }}
                        >
                          {rowBusy ? "Deleting…" : "Delete"}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
      <TimeOffFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={onCreateOrUpdate}
        initial={editing}
      />
    </Box>
  );
}
