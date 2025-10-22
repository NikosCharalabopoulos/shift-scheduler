// staffgrid/src/components/AvailabilityFormModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../lib/api";

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" }, // 0..6 στο backend — Sunday=0
];

export default function AvailabilityFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = !!initial?._id;

  const initialState = useMemo(() => {
    if (!initial) {
      return {
        weekday: 1,        // Monday default
        startTime: "09:00",
        endTime: "17:00",
      };
    }
    return {
      weekday: typeof initial.weekday === "number" ? initial.weekday : 1,
      startTime: initial.startTime || "09:00",
      endTime: initial.endTime || "17:00",
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
    setForm((prev) => ({ ...prev, [name]: name === "weekday" ? Number(value) : value }));
  }

  function validate() {
    if (form.startTime?.length !== 5 || form.endTime?.length !== 5) return "Time must be HH:mm";
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    if (isNaN(sh) || isNaN(eh)) return "Invalid time";
    const s = sh * 60 + sm, e = eh * 60 + em;
    if (e <= s) return "End time must be after start time";
    if (form.weekday < 0 || form.weekday > 6) return "Weekday must be 0..6";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }

    setSubmitting(true);
    setErr("");
    try {
      const payload = {
        weekday: form.weekday,
        startTime: form.startTime,
        endTime: form.endTime,
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
        <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit Availability" : "New Availability"}</h3>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={label}>
            <span>Weekday</span>
            <select name="weekday" value={form.weekday} onChange={onChange} style={input}>
              {WEEKDAYS.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={label}>
              <span>Start</span>
              <input type="time" name="startTime" value={form.startTime} onChange={onChange} style={input} />
            </label>
            <label style={label}>
              <span>End</span>
              <input type="time" name="endTime" value={form.endTime} onChange={onChange} style={input} />
            </label>
          </div>

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
  width: "min(560px, 100%)",
  background: "white",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
};

const label = { display: "grid", gap: 6, fontSize: 14 };
const input = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1" };
const primaryBtn = { padding: "8px 10px", borderRadius: 8, border: 0, background: "#22c55e", color: "black", fontWeight: 600, cursor: "pointer" };
const secondaryBtn = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" };
