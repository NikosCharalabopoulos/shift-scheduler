// staffgrid/src/components/MyMonthGrid.jsx
import React, { useMemo } from "react";
import { formatYMDLocal } from "../utils/date";

const WEEKDAY_HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Props:
 * - matrix: weeks[][] of Date (από getMonthRange)
 * - month: number (0..11) του anchor month για opacity άλλου μήνα
 * - shifts: array of shift docs
 * - assignments: array of assignment docs (για να δείξουμε count/ονόματα)
 * - onEmptyDayClick(dateObj, ymd)
 * - onShiftClick(shift)  // ανοίγει QuickAssignModal
 */
export default function MyMonthGrid({
  matrix,
  month,
  shifts,
  assignments,
  onEmptyDayClick,
  onShiftClick,
}) {
  // Ομαδοποίηση shifts ανά YYYY-MM-DD
  const shiftsByDay = useMemo(() => {
    const map = {};
    (shifts || []).forEach((s) => {
      if (!s.date) return;
      const ymd = formatYMDLocal(new Date(s.date));
      (map[ymd] ||= []).push(s);
    });
    // Ταξινόμηση μέσα στη μέρα κατά startTime
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
    );
    return map;
  }, [shifts]);

  // Ομαδοποίηση assignments ανά shiftId για γρήγορη πρόσβαση
  const assignmentsByShiftId = useMemo(() => {
    const map = {};
    (assignments || []).forEach((a) => {
      const sid = a.shift?._id || a.shift; // populated ή id
      if (!sid) return;
      (map[sid] ||= []).push(a);
    });
    return map;
  }, [assignments]);

  const hasEmptyClick = typeof onEmptyDayClick === "function";
  const hasShiftClick = typeof onShiftClick === "function";

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
              const dayShifts = shiftsByDay[ymd] || [];

              return (
                <div
                  key={ymd}
                  onClick={() => hasEmptyClick && onEmptyDayClick(date, ymd)}
                  style={{
                    ...dayCell,
                    opacity: isOtherMonth ? 0.5 : 1,
                    cursor: hasEmptyClick ? "pointer" : "default",
                  }}
                >
                  <div style={dayRow}>
                    <div style={dayNumber}>{date.getDate()}</div>
                    {hasEmptyClick && <div style={plus} title="Create shift">＋</div>}
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    {dayShifts.length === 0 && <div style={emptyPill}>—</div>}
                    {dayShifts.map((s) => {
                      const asgs = assignmentsByShiftId[s._id] || [];
                      const assignedNames = asgs
                        .map((a) => a.employee?.user?.fullName)
                        .filter(Boolean);
                      return (
                        <div
                          key={s._id}
                          style={{ ...pill, cursor: hasShiftClick ? "pointer" : "default" }}
                          onClick={(e) => {
                            e.stopPropagation(); // μην πυροδοτήσει το create
                            if (hasShiftClick) onShiftClick(s);
                          }}
                          title="Click to assign/unassign"
                        >
                          <div style={{ fontWeight: 600, fontSize: 12 }}>
                            {s.startTime}–{s.endTime}
                          </div>
                          <div style={{ fontSize: 12, color: "#334155" }}>
                            {s.department?.name || "Department"}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {assignedNames.length === 0
                              ? "No assignees"
                              : assignedNames.length <= 2
                                ? assignedNames.join(", ")
                                : `${assignedNames.slice(0, 2).join(", ")} +${assignedNames.length - 2}`}
                          </div>
                        </div>
                      );
                    })}
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

const headerGrid = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 };
const headerCell = {
  padding: "6px 8px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  borderRadius: 8,
  fontWeight: 700,
  textAlign: "center",
};
const weeksGrid = { display: "grid", gap: 8 };
const weekRow = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 };
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
const dayRow = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const dayNumber = { fontWeight: 700, fontSize: 14, color: "#0f172a" };
const plus = { fontSize: 14, color: "#0ea5e9", fontWeight: 700 };
const pill = {
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "6px 8px",
  background: "white",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};
const emptyPill = { ...pill, color: "#94a3b8", textAlign: "center", fontStyle: "italic" };
