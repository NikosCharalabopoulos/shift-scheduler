// backend/src/controllers/shiftAssignmentController.js
const ShiftAssignment = require("../models/ShiftAssignment");

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

    // Προαιρετικός έλεγχος διπλοεγγραφής (ίδιο shift + employee)
    const exists = await ShiftAssignment.findOne({ shift, employee });
    if (exists) {
      return res.status(409).json({ message: "Employee already assigned to this shift" });
    }

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
// επιτρέπει π.χ. αλλαγή του assignedBy (αν θέλεις να καταγράψεις νέο manager)
const updateShiftAssignment = async (req, res) => {
  const { id } = req.params;
  const { shift, employee, assignedBy } = req.body;

  try {
    const dataToUpdate = {};
    if (shift !== undefined) dataToUpdate.shift = shift;
    if (employee !== undefined) dataToUpdate.employee = employee;
    if (assignedBy !== undefined) dataToUpdate.assignedBy = assignedBy;

    const updated = await ShiftAssignment.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
      context: "query"
    })
      .populate({ path: "shift", populate: { path: "department" } })
      .populate({ path: "employee", populate: { path: "user", select: "-passwordHash" } })
      .populate({ path: "assignedBy", select: "-passwordHash" });

    if (!updated) {
      return res.status(404).json({ message: "Shift assignment not found" });
    }

    res.status(200).json(updated);
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
