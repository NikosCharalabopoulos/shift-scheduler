// Μετατροπές και έλεγχοι χρόνου (HH:mm) & ημερομηνίας

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  // Επιστρέφει true αν [aStart,aEnd) τέμνει [bStart,bEnd)
  return aStart < bEnd && bStart < aEnd;
}

function weekdayOf(date) {
  // 0=Κυρ ... 6=Σαβ
  return new Date(date).getDay();
}

module.exports = { toMinutes, rangesOverlap, weekdayOf };
