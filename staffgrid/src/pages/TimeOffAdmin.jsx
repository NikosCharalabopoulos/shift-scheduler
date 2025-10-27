import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import DeclineModal from "../components/DeclineModal";
import StatusChip from "../components/StatusChip";

// MUI
import {
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const STATUS = ["PENDING", "APPROVED", "DECLINED"];

export default function TimeOffAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters
  const [status, setStatus] = useState("PENDING");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [q, setQ] = useState("");

  // decline modal
  const [declineFor, setDeclineFor] = useState(null);

  // per-row busy
  const [busy, setBusy] = useState({});
  const isRowBusy = (id) => !!busy[id];
  const setRowBusy = (id, on) => setBusy((b) => (on ? { ...b, [id]: true } : (delete b[id], { ...b })));

  useEffect(() => {
    api.get("/departments").then(r => setDepartments(r.data || [])).catch(()=>{});
  }, []);

  async function fetchList() {
    setLoading(true);
    setErr("");
    try {
      const params = {};
      if (status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get("/timeoff", { params });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, from, to]);

  const filtered = useMemo(() => {
    let out = rows;
    if (departmentId) {
      out = out.filter(r => r.employee?.department?._id === departmentId);
    }
    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(r => {
        const name = r.employee?.user?.fullName?.toLowerCase() || "";
        const email = r.employee?.user?.email?.toLowerCase() || "";
        const reason = r.reason?.toLowerCase() || "";
        return name.includes(qq) || email.includes(qq) || reason.includes(qq);
      });
    }
    return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [rows, departmentId, q]);

  async function approve(id) {
    if (isRowBusy(id)) return;
    setRowBusy(id, true);
    try {
      await api.patch(`/timeoff/${id}`, { status: "APPROVED" });
      await fetchList();
      alert("Time-off approved.");
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setRowBusy(id, false);
    }
  }

  async function decline(id, reason) {
    if (isRowBusy(id)) return;
    setRowBusy(id, true);
    try {
      await api.patch(`/timeoff/${id}`, { status: "DECLINED", ...(reason ? { reason } : {}) });
      await fetchList();
      alert("Time-off declined.");
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setRowBusy(id, false);
      setDeclineFor(null);
    }
  }

  async function remove(id, currentStatus) {
    if (currentStatus !== "PENDING") {
      alert("Only PENDING requests can be deleted.");
      return;
    }
    if (isRowBusy(id)) return;
    const ok = confirm("Delete this pending request?");
    if (!ok) return;

    setRowBusy(id, true);
    try {
      await api.delete(`/timeoff/${id}`);
      await fetchList();
      alert("Time-off deleted.");
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setRowBusy(id, false);
    }
  }

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={700}>Time Off — Admin</Typography>
        <Button onClick={fetchList} variant="outlined" disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">All</MenuItem>
              {STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="dep-label">Department</InputLabel>
            <Select
              labelId="dep-label"
              label="Department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">All</MenuItem>
              {departments.map(d => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search (name/email/reason)"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={loading}
            sx={{ minWidth: 260, flex: 1 }}
          />
        </Stack>
      </Paper>

      {loading && <Typography sx={{ mt: 2 }}>Loading…</Typography>}
      {err && <Typography color="error" sx={{ mt: 2 }}>{err}</Typography>}

      {/* Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="right" width={260}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: "text.secondary", py: 3 }}>
                  No requests found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const rowBusy = isRowBusy(r._id);
                const notPending = r.status !== "PENDING";
                return (
                  <TableRow key={r._id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{r.employee?.user?.fullName || "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.employee?.user?.email || "—"}</Typography>
                    </TableCell>
                    <TableCell>{r.employee?.department?.name || "—"}</TableCell>
                    <TableCell>{r.type || "—"}</TableCell>
                    <TableCell>
                      {(r.startDate || r.endDate)
                        ? `${new Date(r.startDate).toLocaleDateString()} – ${new Date(r.endDate).toLocaleDateString()}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={r.status} />
                      {rowBusy && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          Processing…
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography noWrap title={r.reason || ""} color={r.reason ? "inherit" : "text.secondary"}>
                        {r.reason || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={notPending || rowBusy}
                          onClick={() => approve(r._id)}
                        >
                          {rowBusy ? "..." : "Approve"}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          disabled={notPending || rowBusy}
                          onClick={() => setDeclineFor(r)}
                        >
                          {rowBusy ? "..." : "Decline"}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          disabled={notPending || rowBusy}
                          onClick={() => remove(r._id, r.status)}
                        >
                          {rowBusy ? "..." : "Delete"}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Decline modal */}
      <DeclineModal
        open={Boolean(declineFor)}
        onClose={() => setDeclineFor(null)}
        onConfirm={(reason) => decline(declineFor._id, reason)}
        defaultReason={declineFor?.reason || ""}
      />
    </Box>
  );
}
