// backend/src/controllers/shiftAssignmentController.js
const ShiftAssignment = require("../models/shiftAssignmentModel");
const Shift = require("../models/shiftModel");
const {
  hasTimeOffConflict,
  hasShiftOverlap,
  violatesAvailability,
} = require("../services/conflictService");

const isEmployee = (req) => req.user?.role === "EMPLOYEE";
const isManagerOrOwner = (req) => req.user && (req.user.role === "MANAGER" || req.user.role === "OWNER");

// GET /api/shift-assignments?shift=<shiftId>&employee=<employeeId>
const getAllShiftAssignments = async (req, res) => {
  try {
    const { shift, employee } = req.query;
    const filter = {};

    if (isEmployee(req)) {
      if (!req.employeeId) return res.status(200).json([]);
      filter.employee = req.employeeId; // self-scope
    } else if (employee) {
      filter.employee = employee;
    }
    if (shift) filter.shift = shift;

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

    if (isEmployee(req) && String(row.employee?._id || row.employee) !== String(req.employeeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(row);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shift assignment", error });
  }
};

// POST /api/shift-assignments (admin only)
const createShiftAssignment = async (req, res) => {
  try {
    if (!isManagerOrOwner(req)) return res.status(403).json({ message: "Forbidden" });

    const { shift, employee } = req.body;
    if (!shift || !employee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const assignedBy = req.user?.id;
    if (!assignedBy) return res.status(401).json({ message: "Unauthorized" });

    const exists = await ShiftAssignment.findOne({ shift, employee });
    if (exists) {
      return res.status(409).json({ message: "Employee already assigned to this shift" });
    }

    const s = await Shift.findById(shift).lean();
    if (!s) return res.status(404).json({ message: "Shift not found" });

    if (await hasTimeOffConflict(employee, s.date)) {
      return res.status(422).json({ message: "Employee has approved time-off on this date", code: "TIME_OFF_CONFLICT" });
    }
    if (await hasShiftOverlap(employee, s.date, s.startTime, s.endTime)) {
      return res.status(422).json({ message: "Employee has overlapping shift", code: "SHIFT_OVERLAP" });
    }
    if (await violatesAvailability(employee, s.date, s.startTime, s.endTime)) {
      return res.status(422).json({ message: "Shift is outside employee availability", code: "AVAILABILITY_VIOLATION" });
    }

    const saved = await new ShiftAssignment({ shift, employee, assignedBy }).save();

    try {
      const populated = await ShiftAssignment.findById(saved._id)
        .populate({ path: "shift", populate: { path: "department" } })
        .populate({ path: "employee", populate: { path: "user", select: "-passwordHash" } })
        .populate({ path: "assignedBy", select: "-passwordHash" });
      return res.status(201).json(populated);
    } catch (popErr) {
      console.warn("createShiftAssignment populate failed:", popErr?.message);
      return res.status(201).json(saved);
    }
  } catch (error) {
    console.error("createShiftAssignment error:", error);
    res.status(500).json({ message: "Error creating shift assignment", error });
  }
};

// PATCH /api/shift-assignments/:id (admin only)
const updateShiftAssignment = async (req, res) => {
  const { id } = req.params;
  const { shift, employee } = req.body;

  try {
    if (!isManagerOrOwner(req)) return res.status(403).json({ message: "Forbidden" });

    const current = await ShiftAssignment.findById(id);
    if (!current) return res.status(404).json({ message: "Shift assignment not found" });

    const nextShiftId = shift ?? current.shift.toString();
    const nextEmployeeId = employee ?? current.employee.toString();

    const s = await Shift.findById(nextShiftId).lean();
    if (!s) return res.status(404).json({ message: "Shift not found" });

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

    const saved = await current.save();

    try {
      const populated = await ShiftAssignment.findById(saved._id)
        .populate({ path: "shift", populate: { path: "department" } })
        .populate({ path: "employee", populate: { path: "user", select: "-passwordHash" } })
        .populate({ path: "assignedBy", select: "-passwordHash" });
      return res.status(200).json(populated);
    } catch (popErr) {
      console.warn("updateShiftAssignment populate failed:", popErr?.message);
      return res.status(200).json(saved);
    }
  } catch (error) {
    console.error("updateShiftAssignment error:", error);
    res.status(500).json({ message: "Error updating shift assignment", error });
  }
};

// DELETE /api/shift-assignments/:id (admin only)
const deleteShiftAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isManagerOrOwner(req)) return res.status(403).json({ message: "Forbidden" });

    const deleted = await ShiftAssignment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Shift assignment not found" });

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
  deleteShiftAssignment,
};
