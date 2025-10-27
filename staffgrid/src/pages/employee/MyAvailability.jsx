// staffgrid/src/pages/employee/MyAvailability.jsx
import React, { useMemo, useState } from "react";
import useMyAvailability from "../../hooks/useMyAvailability";
import AvailabilityFormModal from "../../components/AvailabilityFormModal";
import { startOfWeek, addDays, formatYMDLocal } from "../../utils/date";

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
} from "@mui/material";

const WEEKDAY_LABEL = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

// offset από Monday-start για weekday (0..6, Sunday=0)
function weekdayOffsetFromMonday(weekday) {
  return weekday === 0 ? 6 : weekday - 1;
}

export default function MyAvailability() {
  const { rows, loading, err, createItem, createMany, updateItem, deleteItem } = useMyAvailability();

  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState("");

  // Reference week (για ακριβείς ημερομηνίες)
  const [refYMD, setRefYMD] = useState(() => formatYMDLocal(new Date()));
  const mondayOfRefWeek = useMemo(() => startOfWeek(new Date(refYMD)), [refYMD]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const wd = WEEKDAY_LABEL[r.weekday] || String(r.weekday);
      const dateForRow = (() => {
        const offset = weekdayOffsetFromMonday(r.weekday);
        const d = addDays(mondayOfRefWeek, offset);
        return formatYMDLocal(d);
      })();
      return (
        wd.toLowerCase().includes(q) ||
        (r.startTime || "").includes(q) ||
        (r.endTime || "").includes(q) ||
        dateForRow.includes(q)
      );
    });
  }, [rows, query, mondayOfRefWeek]);

  async function onCreateOrUpdate(payload, id) {
    if (id) {
      await updateItem(id, payload);
      alert("Availability updated.");
    } else {
      await createItem(payload);
      alert("Availability created.");
    }
  }

  async function onCreateMany(payloads) {
    await createMany(payloads);
    alert("Availability created for selected weekdays.");
  }

  async function onDelete(id) {
    setBusyId(id);
    try {
      await deleteItem(id);
      alert("Availability deleted.");
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
        <Typography variant="h5" fontWeight={700}>My Availability</Typography>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            placeholder="Search weekday/time/date…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
            disabled={loading}
          />
          <Stack direction="row" gap={1.5} alignItems="center">
            <TextField
              label="Reference week"
              type="date"
              value={refYMD}
              onChange={(e) => setRefYMD(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={() => { if (!loading) { setEditing(null); setOpenForm(true); } }}
              disabled={loading}
            >
              New Availability
            </Button>
          </Stack>
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
        <Typography color="text.secondary" sx={{ mt: 2 }}>No availability entries.</Typography>
      )}

      {/* Table */}
      {!loading && !err && filtered.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={160}>Weekday</TableCell>
                <TableCell width={200}>Date (in selected week)</TableCell>
                <TableCell width={160}>Start</TableCell>
                <TableCell width={160}>End</TableCell>
                <TableCell width={220}>Created</TableCell>
                <TableCell align="right" width={160}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => {
                const offset = weekdayOffsetFromMonday(r.weekday);
                const dateObj = addDays(mondayOfRefWeek, offset);
                const dateLabel = formatYMDLocal(dateObj);
                const rowBusy = busyId === r._id;

                return (
                  <TableRow key={r._id} hover>
                    <TableCell>{WEEKDAY_LABEL[r.weekday] || r.weekday}</TableCell>
                    <TableCell>{dateLabel}</TableCell>
                    <TableCell>{r.startTime}</TableCell>
                    <TableCell>{r.endTime}</TableCell>
                    <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={rowBusy || loading}
                          onClick={() => { setEditing(r); setOpenForm(true); }}
                        >
                          {rowBusy ? "…" : "Edit"}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={rowBusy || loading}
                          onClick={() => {
                            const ok = confirm(`Delete ${WEEKDAY_LABEL[r.weekday] || r.weekday} ${r.startTime}-${r.endTime}?`);
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
      <AvailabilityFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={onCreateOrUpdate}
        onSaveMany={onCreateMany}
        initial={editing}
      />
    </Box>
  );
}
