import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import DeclineModal from "../components/DeclineModal";

const STATUS = ["PENDING", "APPROVED", "DECLINED"];

export default function TimeOffAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters
  const [status, setStatus] = useState("PENDING"); // default στο PENDING
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [q, setQ] = useState("");

  // decline modal
  const [declineFor, setDeclineFor] = useState(null);

  // per-row action busy state
  const [busy, setBusy] = useState({}); // { [id]: true }
  const isRowBusy = (id) => !!busy[id];
  const setRowBusy = (id, on) =>
    setBusy((b) => (on ? { ...b, [id]: true } : (b[id] && delete b[id], { ...b })));

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
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Time Off — Admin</h2>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 8 }}>
        <label>
          <div style={lbl}>Status</div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={input} disabled={loading}>
            <option value="">All</option>
            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label>
          <div style={lbl}>From</div>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={input} disabled={loading} />
        </label>

        <label>
          <div style={lbl}>To</div>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={input} disabled={loading} />
        </label>

        <label>
          <div style={lbl}>Department</div>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={input} disabled={loading}>
            <option value="">All</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </label>

        <label style={{ flex: 1, minWidth: 240 }}>
          <div style={lbl}>Search (name/email/reason)</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            style={input}
            disabled={loading}
          />
        </label>

        <button onClick={fetchList} style={refreshBtn} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading && <div style={{ marginTop: 16 }}>Loading…</div>}
      {err && <div style={{ marginTop: 16, color: "#ef4444" }}>{err}</div>}

      {/* Table */}
      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Reason</th>
              <th style={{ width: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ color: "#94a3b8", textAlign: "center", padding: 16 }}>
                  No requests found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const rowBusy = isRowBusy(r._id);
                const notPending = r.status !== "PENDING";
                return (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.employee?.user?.fullName || "—"}</div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>{r.employee?.user?.email || "—"}</div>
                    </td>
                    <td>{r.employee?.department?.name || "—"}</td>
                    <td>{r.type || "—"}</td>
                    <td>
                      {(r.startDate || r.endDate) ? (
                        <>
                          {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                        </>
                      ) : "—"}
                    </td>
                    <td>
                      <span style={{ ...badge, ...(r.status === "APPROVED" ? badgeGreen : r.status === "DECLINED" ? badgeRed : badgeYellow) }}>
                        {r.status}
                      </span>
                      {rowBusy && <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>Processing…</span>}
                    </td>
                    <td>
                      <div title={r.reason || ""} style={{ maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.reason || <span style={{ color: "#94a3b8" }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          style={{ ...btn, ...(notPending || rowBusy ? btnDisabled : btnPrimary) }}
                          disabled={notPending || rowBusy}
                          onClick={() => approve(r._id)}
                          title="Approve"
                        >
                          {rowBusy ? "..." : "Approve"}
                        </button>
                        <button
                          style={{ ...btn, ...(notPending || rowBusy ? btnDisabled : btnWarning) }}
                          disabled={notPending || rowBusy}
                          onClick={() => setDeclineFor(r)}
                          title="Decline"
                        >
                          {rowBusy ? "..." : "Decline"}
                        </button>
                        <button
                          style={{ ...btn, ...(notPending || rowBusy ? btnDisabled : btnDanger) }}
                          disabled={notPending || rowBusy}
                          onClick={() => remove(r._id, r.status)}
                          title="Delete"
                        >
                          {rowBusy ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Decline modal */}
      <DeclineModal
        open={Boolean(declineFor)}
        onClose={() => setDeclineFor(null)}
        onConfirm={(reason) => decline(declineFor._id, reason)}
        defaultReason={declineFor?.reason || ""}
      />
    </div>
  );
}

const lbl = { fontSize: 12, color: "#64748b", marginBottom: 4 };
const input = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 160 };
const refreshBtn = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" };

const table = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid #e2e8f0",
};
const thtd = {
  borderBottom: "1px solid #e2e8f0",
  padding: "10px 12px",
  textAlign: "left",
};
const badge = { padding: "2px 8px", borderRadius: 999, fontSize: 12, border: "1px solid #e2e8f0" };
const badgeGreen = { background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" };
const badgeRed = { background: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" };
const badgeYellow = { background: "#fef9c3", color: "#854d0e", borderColor: "#fde68a" };

const btn = { padding: "6px 10px", borderRadius: 8, cursor: "pointer", border: "1px solid #cbd5e1", background: "white" };
const btnPrimary = { background: "#22c55e", color: "black", border: 0, fontWeight: 600 };
const btnWarning = { background: "#fbbf24", color: "black", border: 0, fontWeight: 600 };
const btnDanger = { background: "#ef4444", color: "white", border: 0, fontWeight: 600 };
const btnDisabled = { opacity: 0.5, cursor: "not-allowed" };

/* table cells style */
const _thead = document?.createElement ? null : null; // no-op to avoid SSR warnings
// apply cell styles (simple way without CSS files)
const _patch = (() => {
  if (typeof window === "undefined") return;
  const apply = (selector, styleObj) => {
    const style = Object.entries(styleObj)
      .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`)
      .join(";");
    const tag = document.createElement("style");
    tag.textContent = `${selector}{${style}}`;
    document.head.appendChild(tag);
  };
  apply("table thead th", thtd);
  apply("table tbody td", thtd);
})();
