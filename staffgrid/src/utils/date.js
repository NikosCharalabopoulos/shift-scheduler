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

export function formatISODate(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

export function formatShort(d) {
  return new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "2-digit" });
}
