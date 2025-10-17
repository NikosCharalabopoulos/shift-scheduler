import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

export default function DepartmentFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial?._id);
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setDescription(initial?.description || "");
      setError("");
    }
  }, [open, initial]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.patch(`/departments/${initial._id}`, { name, description });
      } else {
        await api.post("/departments", { name, description });
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit Department" : "New Department"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <label>
            <div>Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              maxLength={80}
            />
          </label>
          <label>
            <div>Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ ...styles.input, resize: "vertical" }}
            />
          </label>

          {error && <div style={{ color: "#ef4444" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={styles.secondaryBtn} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" style={styles.primaryBtn} disabled={submitting}>
              {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save changes" : "Create")}
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
    zIndex: 50
  },
  modal: {
    width: 480,
    background: "white",
    color: "#0f172a",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    marginTop: 4
  },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: 0,
    background: "#22c55e",
    color: "black",
    fontWeight: 600,
    cursor: "pointer"
  },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer"
  }
};
