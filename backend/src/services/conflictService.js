const Shift = require("../models/shiftModel");
const ShiftAssignment = require("../models/shiftAssignmentModel");
const TimeOff = require("../models/timeOffModel");
const Availability = require("../models/availabilityModel");
const { toMinutes, rangesOverlap, weekdayOf } = require("../utils/time");

// Ελέγχει αν end > start
function assertTimeOrder(startTime, endTime) {
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    const err = new Error("endTime must be after startTime");
    err.status = 422;
    throw err;
  }
}

// Αν η βάρδια είναι π.χ. 2025-10-01, τότε time-off conflict αν η ημερομηνία πέφτει ανάμεσα σε startDate..endDate (inclusive)
async function hasTimeOffConflict(employeeId, shiftDateISO) {
  const d = new Date(shiftDateISO);
  const conflict = await TimeOff.findOne({
    employee: employeeId,
    status: "APPROVED",
    startDate: { $lte: d },
    endDate: { $gte: d }
  }).lean();
  return Boolean(conflict);
}

// Υπάρχει ήδη άλλη βάρδια για τον ίδιο υπάλληλο την ίδια μέρα με επικάλυψη ωρών;
async function hasShiftOverlap(employeeId, shiftDateISO, startTime, endTime, excludeAssignmentId = null) {
  const assignments = await ShiftAssignment.find({
    employee: employeeId,
    ...(excludeAssignmentId ? { _id: { $ne: excludeAssignmentId } } : {})
  })
    .populate("shift")
    .lean();

  const targetStart = toMinutes(startTime);
  const targetEnd = toMinutes(endTime);

  return assignments.some(a => {
    if (!a.shift) return false;
    // ίδια μέρα;
    const sameDay = new Date(a.shift.date).toDateString() === new Date(shiftDateISO).toDateString();
    if (!sameDay) return false;

    const s = toMinutes(a.shift.startTime);
    const e = toMinutes(a.shift.endTime);
    return rangesOverlap(targetStart, targetEnd, s, e);
  });
}

// Αν υπάρχουν availability entries για τη μέρα, απαιτούμε το shift να "χωράει" σε μία από αυτές.
// Αν ΔΕΝ υπάρχουν δηλώσεις διαθεσιμότητας για τη μέρα, ΔΕΝ μπλοκάρουμε (χαλαρός κανόνας για MVP).
async function violatesAvailability(employeeId, shiftDateISO, startTime, endTime) {
  const weekday = weekdayOf(shiftDateISO);
  const slots = await Availability.find({ employee: employeeId, weekday }).lean();

  if (!slots || slots.length === 0) return false; // κανόνας: αν δεν έχει δηλώσει τίποτα, το επιτρέπουμε

  const needStart = toMinutes(startTime);
  const needEnd = toMinutes(endTime);

  const fitsSome = slots.some(sl => {
    const aStart = toMinutes(sl.startTime);
    const aEnd = toMinutes(sl.endTime);
    return aStart <= needStart && needEnd <= aEnd;
  });

  return !fitsSome;
}

module.exports = {
  assertTimeOrder,
  hasTimeOffConflict,
  hasShiftOverlap,
  violatesAvailability
};
