// staffgrid/src/components/TimeOffFormModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { formatYMDLocal } from "../utils/date";
import { getErrorMessage } from "../lib/api";

export default function TimeOffFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = !!initial?._id;

  const initialState = useMemo(() => {
    if (!initial) {
      return {
        type: "VACATION",
        startDate: formatYMDLocal(new Date()),
        endDate: formatYMDLocal(new Date()),
        reason: "",
      };
    }
    return {
      type: initial.type || "VACATION",
      startDate: initial.startDate ? formatYMDLocal(new Date(initial.startDate)) : formatYMDLocal(new Date()),
      endDate: initial.endDate ? formatYMDLocal(new Date(initial.endDate)) : formatYMDLocal(new Date()),
      reason: initial.reason || "",
    };
  }, [initial]);

  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initialState);
      setErr("");
      setSubmitting(false);
    }
  }, [open, initialState]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    if (!form.startDate || !form.endDate) return "Start/End date required";
    if (form.endDate < form.startDate) return "End date must be on/after start date";
    if (!["VACATION", "SICK", "OTHER"].includes(form.type)) return "Invalid type";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      // Δεν στέλνουμε employee/status από client
      const payload = {
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason?.trim() || undefined,
      };
      await onSaved(payload, isEdit ? initial._id : null);
      onClose?.();
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit Time Off" : "New Time Off"}</h3>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={label}>
            <span>Type</span>
            <select name="type" value={form.type} onChange={onChange} style={input}>
              <option value="VACATION">VACATION</option>
              <option value="SICK">SICK</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={label}>
              <span>Start Date</span>
              <input type="date" name="startDate" value={form.startDate} onChange={onChange} style={input} />
            </label>
            <label style={label}>
              <span>End Date</span>
              <input type="date" name="endDate" value={form.endDate} onChange={onChange} style={input} />
            </label>
          </div>

          <label style={label}>
            <span>Reason (optional)</span>
            <textarea name="reason" value={form.reason} onChange={onChange} rows={3} style={{ ...input, resize: "vertical" }} />
          </label>

          {err && <div style={{ color: "#ef4444" }}>{err}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={secondaryBtn} disabled={submitting}>Cancel</button>
            <button type="submit" style={primaryBtn} disabled={submitting}>
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.45)",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 50,
};

const modal = {
  width: "min(720px, 100%)",
  background: "white",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
};

const label = { display: "grid", gap: 6, fontSize: 14 };
const input = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1" };
const primaryBtn = { padding: "8px 10px", borderRadius: 8, border: 0, background: "#22c55e", color: "black", fontWeight: 600, cursor: "pointer" };
const secondaryBtn = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" };
