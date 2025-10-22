// staffgrid/src/components/AvailabilityFormModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../lib/api";
import { startOfWeek, addDays, formatYMDLocal } from "../utils/date";

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" }, // 0..6 στο backend — Sunday=0
];

function weekdayOffsetFromMonday(weekday) {
  return weekday === 0 ? 6 : weekday - 1;
}

export default function AvailabilityFormModal({
  open,
  onClose,
  onSaved,     // (payload, id) για EDIT ή single create
  onSaveMany,  // (payloads[]) για batch create
  initial
}) {
  const isEdit = !!initial?._id;

  const initialState = useMemo(() => {
    if (!initial) {
      const todayYMD = new Date().toISOString().slice(0, 10);
      return {
        anchorDate: todayYMD,                // UX μόνο
        selectedDays: new Set([1,2,3,4,5]),  // Mon–Fri
        weekday: 1,                          // μόνο για edit
        startTime: "09:00",
        endTime: "17:00",
      };
    }
    return {
      anchorDate: new Date().toISOString().slice(0, 10),
      selectedDays: new Set([Number(initial.weekday ?? 1)]),
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

  function toggleDay(dayValue) {
    setForm((prev) => {
      const next = new Set(prev.selectedDays);
      if (next.has(dayValue)) next.delete(dayValue);
      else next.add(dayValue);
      return { ...prev, selectedDays: next };
    });
  }

  function onChange(e) {
    const { name, value } = e.target;
    if (name === "anchorDate") {
      setForm((prev) => ({ ...prev, anchorDate: value }));
    } else if (name === "weekday") {
      setForm((prev) => ({ ...prev, weekday: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function validate() {
    if (form.startTime?.length !== 5 || form.endTime?.length !== 5) return "Time must be HH:mm";
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    if (isNaN(sh) || isNaN(eh)) return "Invalid time";
    const s = sh * 60 + sm, e = eh * 60 + em;
    if (e <= s) return "End time must be after start time";
    if (isEdit) {
      if (form.weekday < 0 || form.weekday > 6) return "Weekday must be 0..6";
    } else {
      if (form.selectedDays.size === 0) return "Select at least one weekday";
    }
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }

    setSubmitting(true);
    setErr("");
    try {
      if (isEdit) {
        const payload = {
          weekday: form.weekday,
          startTime: form.startTime,
          endTime: form.endTime,
        };
        await onSaved?.(payload, initial._id);
      } else {
        const payloads = Array.from(form.selectedDays).map((wd) => ({
          weekday: wd,
          startTime: form.startTime,
          endTime: form.endTime,
        }));
        if (onSaveMany) {
          await onSaveMany(payloads);
        } else {
          for (const p of payloads) {
            // eslint-disable-next-line no-await-in-loop
            await onSaved?.(p, null);
          }
        }
      }
      onClose?.();
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  // ✅ PREVIEW ημερομηνιών για την επιλεγμένη εβδομάδα (UX)
  const mondayOfWeek = startOfWeek(new Date(form.anchorDate));
  const previewDates = !isEdit
    ? Array.from(form.selectedDays)
        .sort((a, b) => weekdayOffsetFromMonday(a) - weekdayOffsetFromMonday(b))
        .map((wd) => {
          const d = addDays(mondayOfWeek, weekdayOffsetFromMonday(wd));
          return `${WEEKDAYS.find((w) => w.value === wd)?.label || wd} ${formatYMDLocal(d)}`;
        })
    : [
        (() => {
          const d = addDays(mondayOfWeek, weekdayOffsetFromMonday(form.weekday));
          return `${WEEKDAYS.find((w) => w.value === form.weekday)?.label || form.weekday} ${formatYMDLocal(d)}`;
        })()
      ];

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit Availability" : "New Availability (batch)"}</h3>

        {!isEdit && (
          <p style={{ marginTop: 0, marginBottom: 8, color: "#64748b" }}>
            Tip: Οι ώρες ισχύουν επαναλαμβανόμενα για τις επιλεγμένες μέρες κάθε εβδομάδα.
          </p>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          {/* Anchor week */}
          <label style={label}>
            <span>Week (anchor date)</span>
            <input
              type="date"
              name="anchorDate"
              value={form.anchorDate}
              onChange={onChange}
              style={input}
            />
          </label>

          {/* Multi-day ή single-day επιλογή */}
          {!isEdit ? (
            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 14 }}>Weekdays</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {WEEKDAYS.map((w) => {
                  const checked = form.selectedDays.has(w.value);
                  return (
                    <label key={w.value} style={chk}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDay(w.value)}
                      />
                      <span>{w.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <label style={label}>
              <span>Weekday</span>
              <select name="weekday" value={form.weekday} onChange={onChange} style={input}>
                {WEEKDAYS.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </label>
          )}

          {/* Ώρες */}
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

          {/* ✅ Preview ημερομηνιών αυτής της εβδομάδας */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>Preview (this week):</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {previewDates.map((p, idx) => (
                <span key={idx} style={pill}>{p}</span>
              ))}
            </div>
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
  width: "min(640px, 100%)",
  background: "white",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
};

const label = { display: "grid", gap: 6, fontSize: 14 };
const input = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1" };
const chk = { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 999, background: "white" };
const pill = { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "white", border: "1px solid #e2e8f0", fontSize: 12 };
const primaryBtn = { padding: "8px 10px", borderRadius: 8, border: 0, background: "#22c55e", color: "black", fontWeight: 600, cursor: "pointer" };
const secondaryBtn = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" };
