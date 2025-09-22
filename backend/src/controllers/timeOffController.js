// backend/src/controllers/timeOffController.js
const TimeOff = require("../models/TimeOff");

// GET /api/timeoff
// optional query: ?employee=<id>&status=PENDING|APPROVED|DECLINED&from=YYYY-MM-DD&to=YYYY-MM-DD
const getAllTimeOff = async (req, res) => {
  try {
    const { employee, status, from, to } = req.query;
    const filter = {};

    if (employee) filter.employee = employee;
    if (status) filter.status = status;

    // φίλτρο ημερομηνιών: επιστρέφουμε αιτήσεις που τέμνουν το [from, to]
    if (from || to) {
      const range = {};
      if (from) range.$lte = new Date(to || "9999-12-31");
      if (to) range.$gte = new Date(from || "0001-01-01");

      // overlap condition: startDate <= to && endDate >= from
      filter.$and = [
        { startDate: { $lte: new Date(to || "9999-12-31") } },
        { endDate: { $gte: new Date(from || "0001-01-01") } }
      ];
    }

    const results = await TimeOff.find(filter).populate({
      path: "employee",
      populate: { path: "user", select: "-passwordHash" }
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch time-off requests", error });
  }
};

// GET /api/timeoff/:id
const getTimeOffById = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await TimeOff.findById(id).populate({
      path: "employee",
      populate: { path: "user", select: "-passwordHash" }
    });
    if (!record) {
      return res.status(404).json({ message: "Time-off request not found" });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "Error fetching time-off request", error });
  }
};

// POST /api/timeoff
const createTimeOff = async (req, res) => {
  try {
    const { employee, type, startDate, endDate, reason } = req.body;

    if (!employee || !type || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRecord = new TimeOff({
      employee,
      type,
      startDate,
      endDate,
      reason
    });

    const saved = await newRecord.save();
    const populated = await saved.populate({
      path: "employee",
      populate: { path: "user", select: "-passwordHash" }
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating time-off request", error });
  }
};

// PATCH /api/timeoff/:id
// Μπορείς να ενημερώσεις status (APPROVED/DECLINED), reason, dates κ.λπ.
const updateTimeOff = async (req, res) => {
  const { id } = req.params;
  const { type, startDate, endDate, status, reason } = req.body;

  try {
    const dataToUpdate = {};
    if (type !== undefined) dataToUpdate.type = type;
    if (startDate !== undefined) dataToUpdate.startDate = startDate;
    if (endDate !== undefined) dataToUpdate.endDate = endDate;
    if (status !== undefined) dataToUpdate.status = status;
    if (reason !== undefined) dataToUpdate.reason = reason;

    const updated = await TimeOff.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
      context: "query"
    }).populate({
      path: "employee",
      populate: { path: "user", select: "-passwordHash" }
    });

    if (!updated) {
      return res.status(404).json({ message: "Time-off request not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating time-off request", error });
  }
};

// DELETE /api/timeoff/:id
const deleteTimeOff = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await TimeOff.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Time-off request not found" });
    }
    res.status(200).json({ message: "Time-off request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting time-off request", error });
  }
};

module.exports = {
  getAllTimeOff,
  getTimeOffById,
  createTimeOff,
  updateTimeOff,
  deleteTimeOff
};
