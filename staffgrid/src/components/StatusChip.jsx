import Chip from "@mui/material/Chip";

export default function StatusChip({ status }) {
  const map = {
    PENDING: { color: "warning", label: "PENDING" },
    APPROVED: { color: "success", label: "APPROVED" },
    DECLINED: { color: "error", label: "DECLINED" },
  };
  const cfg = map[status] || { color: "default", label: String(status || "—") };
  return <Chip size="small" variant="soft" color={cfg.color} label={cfg.label} />;
}
