// staffgrid/src/components/MyScheduleGrid.js
import React from "react";
import { formatYMDLocal } from "../utils/date";

function DayColumn({ date, items }) {
  const title = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div style={colStyle}>
      <div style={colHeader}>{title}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.length === 0 && <div style={emptyCard}>—</div>}
        {items.map((a) => (
          <div key={a._id} style={card}>
            <div style={{ fontWeight: 600 }}>
              {a.shift?.startTime}–{a.shift?.endTime}
            </div>
            <div style={{ color: "#334155" }}>
              {a.shift?.department?.name || "Department"}
            </div>
            {a.shift?.notes && (
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                {a.shift.notes}
              </div>
            )}
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>
              Assigned by: {a.assignedBy?.fullName || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyScheduleGrid({ days, assignments }) {
  // Ομαδοποίηση ανά τοπικό YYYY-MM-DD
  const byDay = Object.fromEntries(days.map((d) => [formatYMDLocal(d), []]));

  (assignments || []).forEach((a) => {
    const ymd = a.shift?.date ? formatYMDLocal(new Date(a.shift.date)) : null;
    if (ymd && byDay[ymd]) byDay[ymd].push(a);
  });

  return (
    <div style={grid}>
      {days.map((d) => (
        <DayColumn key={d.toISOString()} date={d} items={byDay[formatYMDLocal(d)] || []} />
      ))}
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(200px, 1fr))",
  gap: 12,
  marginTop: 16,
  overflowX: "auto",
};

const colStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const colHeader = {
  position: "sticky",
  top: 0,
  background: "white",
  padding: "8px 10px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontWeight: 700,
};

const card = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "8px 10px",
  background: "white",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const emptyCard = {
  ...card,
  color: "#94a3b8",
  textAlign: "center",
};
