// staffgrid/src/components/MyMonthGrid.jsx
import React from "react";
import { formatYMDLocal } from "../utils/date";

const WEEKDAY_HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MyMonthGrid({ matrix, month, assignments }) {
  // Ομαδοποίηση assignments ανά τοπικό YYYY-MM-DD
  const byDay = {};
  (assignments || []).forEach((a) => {
    if (!a.shift?.date) return;
    const ymd = formatYMDLocal(new Date(a.shift.date));
    (byDay[ymd] ||= []).push(a);
  });

  return (
    <div style={{ marginTop: 16 }}>
      {/* headers */}
      <div style={headerGrid}>
        {WEEKDAY_HEADER.map((h) => (
          <div key={h} style={headerCell}>{h}</div>
        ))}
      </div>

      {/* weeks */}
      <div style={weeksGrid}>
        {matrix.map((week, wi) => (
          <div key={wi} style={weekRow}>
            {week.map((date) => {
              const isOtherMonth = date.getMonth() !== month;
              const ymd = formatYMDLocal(date);
              const items = byDay[ymd] || [];
              return (
                <div key={ymd} style={{ ...dayCell, opacity: isOtherMonth ? 0.5 : 1 }}>
                  <div style={dayNumber}>{date.getDate()}</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {items.length === 0 && <div style={emptyPill}>—</div>}
                    {items.map((a) => (
                      <div key={a._id} style={pill}>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>
                          {a.shift?.startTime}–{a.shift?.endTime}
                        </div>
                        <div style={{ fontSize: 12, color: "#334155" }}>
                          {a.shift?.department?.name || "Department"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const headerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 8,
};

const headerCell = {
  padding: "6px 8px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  borderRadius: 8,
  fontWeight: 700,
  textAlign: "center",
};

const weeksGrid = {
  display: "grid",
  gap: 8,
};

const weekRow = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 8,
};

const dayCell = {
  minHeight: 120,
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  background: "white",
  padding: 8,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const dayNumber = { fontWeight: 700, fontSize: 14, color: "#0f172a" };

const pill = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "6px 8px",
  background: "white",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const emptyPill = {
  ...pill,
  color: "#94a3b8",
  textAlign: "center",
  fontStyle: "italic",
};
