import { useState, useEffect } from "react";

export default function DeclineModal({ open, onClose, onConfirm, defaultReason = "" }) {
  const [reason, setReason] = useState(defaultReason);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setReason(defaultReason || "");
      setErr("");
      setSubmitting(false);
    }
  }, [open, defaultReason]);

  if (!open) return null;

  async function confirm(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    try {
      await onConfirm?.(reason);
      onClose?.();
    } catch (e) {
      setErr(e?.message || "Failed to decline");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Decline request</h3>
        <form onSubmit={confirm} style={{ display: "grid", gap: 10 }}>
          <label>
            <div>Reason (optional)</div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              style={styles.textarea}
              placeholder="Add a short note for the employee…"
            />
          </label>

          {err && <div style={{ color: "#ef4444" }}>{err}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" style={styles.secondaryBtn} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" style={styles.dangerBtn} disabled={submitting}>
              {submitting ? "Declining…" : "Confirm decline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "grid",
    placeItems: "center",
    zIndex: 50,
  },
  modal: {
    width: 520,
    maxWidth: "95vw",
    background: "white",
    color: "#0f172a",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    marginTop: 4,
    resize: "vertical",
  },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
  },
  dangerBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: 0,
    background: "#ef4444",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
};
