// staffgrid/src/utils/date.js

/* ---------- Basic date helpers ---------- */

export function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d, n) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

export function addMonths(d, n) {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + n);
  return dt;
}

// ✅ Local YYYY-MM-DD (όχι UTC)
export function formatYMDLocal(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatShort(d) {
  return new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

/* ---------- Month helpers ---------- */

export function startOfMonth(d) {
  const dt = new Date(d.getFullYear(), d.getMonth(), 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function endOfMonth(d) {
  const dt = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  dt.setHours(23, 59, 59, 999);
  return dt;
}

// Monday-first month matrix: 5–6 εβδομάδες, 7 μέρες/εβδομάδα
export function getMonthMatrix(anchorDate) {
  const firstOfMonth = startOfMonth(anchorDate);
  const lastOfMonth = endOfMonth(anchorDate);

  // Από ποια Δευτέρα ξεκινάει το grid
  const gridStart = startOfWeek(firstOfMonth);

  // Πόσες μέρες θα δείξουμε: 35 (5 εβδομάδες) ή 42 (6 εβδομάδες)
  const after = (lastOfMonth - gridStart) / (1000 * 60 * 60 * 24) + 1;
  const daysInGrid = after > 35 ? 42 : 35;

  const days = Array.from({ length: daysInGrid }, (_, i) => addDays(gridStart, i));
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function getMonthRange(anchorDate) {
  const first = startOfMonth(anchorDate);
  const last = endOfMonth(anchorDate);
  return {
    fromYMD: formatYMDLocal(first),
    toYMD: formatYMDLocal(last),
    matrix: getMonthMatrix(anchorDate),
    label: anchorDate.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
  };
}

/* ---------- NEW: Week label helper ---------- */

export function getWeekLabel(anchor) {
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();

  return sameMonth
    ? `${start.toLocaleDateString(undefined, { month: "short" })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`
    : `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${end.getFullYear()}`;
}
