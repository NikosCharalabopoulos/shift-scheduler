// backend/src/controllers/shiftController.js
const Shift = require("../models/shiftModel");
const { assertTimeOrder } = require("../services/conflictService");

// GET /api/shifts
// optional query: ?department=<id>&from=YYYY-MM-DD&to=YYYY-MM-DD
const getAllShifts = async (req, res) => {
  try {
    const { department, from, to } = req.query;
    const filter = {};

    if (department) filter.department = department;

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const shifts = await Shift.find(filter).populate("department");
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch shifts", error });
  }
};

// GET /api/shifts/:id
const getShiftById = async (req, res) => {
  const { id } = req.params;
  try {
    const shift = await Shift.findById(id).populate("department");
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    res.status(200).json(shift);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shift", error });
  }
};

// POST /api/shifts
const createShift = async (req, res) => {
  try {
    const { department, date, startTime, endTime, notes } = req.body;

    if (!department || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Business rule: endTime must be after startTime
    try {
      assertTimeOrder(startTime, endTime);
    } catch (ruleErr) {
      return res.status(ruleErr.status || 422).json({ message: ruleErr.message, code: "TIME_ORDER" });
    }

    const newShift = new Shift({ department, date, startTime, endTime, notes });
    const saved = await newShift.save();
    const populated = await saved.populate("department");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating shift", error });
  }
};

// PATCH /api/shifts/:id
const updateShift = async (req, res) => {
  const { id } = req.params;
  const { department, date, startTime, endTime, notes } = req.body;

  try {
    // Αν ενημερώνονται ώρες, έλεγξε την επιχειρησιακή λογική
    if (startTime !== undefined || endTime !== undefined) {
      const existing = await Shift.findById(id);
      if (!existing) return res.status(404).json({ message: "Shift not found" });

      const s = startTime ?? existing.startTime;
      const e = endTime ?? existing.endTime;
      try {
        assertTimeOrder(s, e);
      } catch (ruleErr) {
        return res.status(ruleErr.status || 422).json({ message: ruleErr.message, code: "TIME_ORDER" });
      }
    }

    const dataToUpdate = {};
    if (department !== undefined) dataToUpdate.department = department;
    if (date !== undefined) dataToUpdate.date = date;
    if (startTime !== undefined) dataToUpdate.startTime = startTime;
    if (endTime !== undefined) dataToUpdate.endTime = endTime;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updated = await Shift.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
      context: "query"
    }).populate("department");

    if (!updated) return res.status(404).json({ message: "Shift not found" });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating shift", error });
  }
};

// DELETE /api/shifts/:id
const deleteShift = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Shift.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Shift not found" });
    res.status(200).json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shift", error });
  }
};

module.exports = {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift
};
