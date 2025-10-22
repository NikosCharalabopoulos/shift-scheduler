// staffgrid/src/components/WeekNav.js
import React from "react";

export default function WeekNav({ label, onPrev, onToday, onNext }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={onPrev} style={btnStyle}>&larr; Prev</button>
      <button onClick={onToday} style={btnStyle}>Today</button>
      <button onClick={onNext} style={btnStyle}>Next &rarr;</button>
      <div style={{ fontWeight: 700, marginLeft: 8 }}>{label}</div>
    </div>
  );
}

const btnStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer",
};
