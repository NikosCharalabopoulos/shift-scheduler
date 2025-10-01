// backend/src/controllers/shiftAssignmentController.js
const ShiftAssignment = require("../models/shiftAssignmentModel");
const Shift = require("../models/shiftModel");
const {
  hasTimeOffConflict,
  hasShiftOverlap,
  violatesAvailability
} = require("../services/conflictService");

// GET /api/shift-assignments
// optional query: ?shift=<shiftId>&employee=<employeeId>
const getAllShiftAssignments = async (req, res) => {
  try {
    const { shift, employee } = req.query;
    const filter = {};
    if (shift) filter.shift = shift;
    if (employee) filter.employee = employee;

    const rows = await ShiftAssignment.find(filter)
      .populate({ path: "shift", populate: { path: "department" } })
      .populate({ path: "employee", populate: { path: "user", select: "-passwordHash" } })
      .populate({ path: "assignedBy", select: "-passwordHash" });

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch shift assignments", error });
  }
};

// GET /api/shift-assignments/:id
const getShiftAssignmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const row = await ShiftAssignment.findById(id)
      .populate({ path: "shift", populate: { path: "department" } })
      .populate({ path: "employee", populate: { path: "user", select: "-passwordHash" } })
      .populate({ path: "assignedBy", select: "-passwordHash" });

    if (!row) return res.status(404).json({ message: "Shift assignment not found" });
    res.status(200).json(row);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shift assignment", error });
  }
};

// POST /api/shift-assignments
// body: { shift, employee, assignedBy }
const createShiftAssignment = async (req, res) => {
  try {
    const { shift, employee, assignedBy } = req.body;
    if (!shift || !employee || !assignedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 0) διπλοεγγραφή
    const exists = await ShiftAssignment.findOne({ shift, employee });
    if (exists) {
      return res.status(409).json({ message: "Employee already assigned to this shift" });
    }

    // 1) στοιχεία shift
    const s = await Shift.findById(shift).lean();
    if (!s) return res.status(404).json({ message: "Shift not found" });

    // 2) time-off conflict
    if (await hasTimeOffConflict(employee, s.date)) {
      return res.status(422).json({ message: "Employee has approved time-off on this date", code: "TIME_OFF_CONFLICT" });
    }

    // 3) overlap με άλλη βάρδια
    if (await hasShiftOverlap(employee, s.date, s.startTime, s.endTime)) {
      return res.status(422).json({ message: "Employee has overlapping shift", code: "SHIFT_OVERLAP" });
    }

    // 4) availability violation (αν υπάρχει δηλωμένη)
    if (await violatesAvailability(employee, s.date, s.startTime, s.endTime)) {
      return res.status(422).json({ message: "Shift is outside employee availability", code: "AVAILABILITY_VIOLATION" });
    }

    // 5) OK create
    const row = new ShiftAssignment({ shift, employee, assignedBy });
    const saved = await row.save();
    const populated = await saved
      .populate({ path: "shift", populate: { path: "department" } })
      .populate({ path: "employee", populate: { path: "user", select: "-passwordHash" } })
      .populate({ path: "assignedBy", select: "-passwordHash" });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating shift assignment", error });
  }
};

// PATCH /api/shift-assignments/:id
const updateShiftAssignment = async (req, res) => {
  const { id } = req.params;
  const { shift, employee, assignedBy } = req.body;

  try {
    const current = await ShiftAssignment.findById(id);
    if (!current) return res.status(404).json({ message: "Shift assignment not found" });

    const nextShiftId = shift ?? current.shift.toString();
    const nextEmployeeId = employee ?? current.employee.toString();

    const s = await Shift.findById(nextShiftId).lean();
    if (!s) return res.status(404).json({ message: "Shift not found" });

    // κανόνες με εξαίρεση το ίδιο assignment (για overlap)
    if (await hasTimeOffConflict(nextEmployeeId, s.date)) {
      return res.status(422).json({ message: "Employee has approved time-off on this date", code: "TIME_OFF_CONFLICT" });
    }

    if (await hasShiftOverlap(nextEmployeeId, s.date, s.startTime, s.endTime, current._id)) {
      return res.status(422).json({ message: "Employee has overlapping shift", code: "SHIFT_OVERLAP" });
    }

    if (await violatesAvailability(nextEmployeeId, s.date, s.startTime, s.endTime)) {
      return res.status(422).json({ message: "Shift is outside employee availability", code: "AVAILABILITY_VIOLATION" });
    }

    current.shift = nextShiftId;
    current.employee = nextEmployeeId;
    if (assignedBy !== undefined) current.assignedBy = assignedBy;

    const saved = await current.save();
    const populated = await saved
      .populate({ path: "shift", populate: { path: "department" } })
      .populate({ path: "employee", populate: { path: "user", select: "-passwordHash" } })
      .populate({ path: "assignedBy", select: "-passwordHash" });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error updating shift assignment", error });
  }
};

// DELETE /api/shift-assignments/:id
const deleteShiftAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await ShiftAssignment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Shift assignment not found" });
    }
    res.status(200).json({ message: "Shift assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shift assignment", error });
  }
};

module.exports = {
  getAllShiftAssignments,
  getShiftAssignmentById,
  createShiftAssignment,
  updateShiftAssignment,
  deleteShiftAssignment
};
