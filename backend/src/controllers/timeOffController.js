// backend/src/controllers/timeOffController.js
const TimeOff = require("../models/timeOffModel");

const isEmployee = (req) => req.user?.role === "EMPLOYEE";
const isManagerOrOwner = (req) => req.user && (req.user.role === "MANAGER" || req.user.role === "OWNER");

// GET /api/timeoff?employee=<id>&status=PENDING|APPROVED|DECLINED&from=YYYY-MM-DD&to=YYYY-MM-DD
const getAllTimeOff = async (req, res) => {
  try {
    const { employee, status, from, to } = req.query;
    const filter = {};

    if (isEmployee(req)) {
      if (!req.employeeId) return res.status(200).json([]);
      filter.employee = req.employeeId; // self-scope
    } else if (employee) {
      filter.employee = employee;
    }
    if (status) filter.status = status;

    if (from || to) {
      // overlap condition: startDate <= to && endDate >= from
      const toDt = new Date(to || "9999-12-31");
      const fromDt = new Date(from || "0001-01-01");
      filter.$and = [{ startDate: { $lte: toDt } }, { endDate: { $gte: fromDt } }];
    }

    const results = await TimeOff.find(filter).populate({
      path: "employee",
      populate: { path: "user", select: "-passwordHash" },
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
      populate: { path: "user", select: "-passwordHash" },
    });
    if (!record) return res.status(404).json({ message: "Time-off request not found" });

    if (isEmployee(req) && String(record.employee?._id || record.employee) !== String(req.employeeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "Error fetching time-off request", error });
  }
};

// POST /api/timeoff
// Employee: δημιουργεί μόνο για τον εαυτό του, status=PENDING
const createTimeOff = async (req, res) => {
  try {
    const { employee, type, startDate, endDate, reason } = req.body;

    const payload = { type, startDate, endDate, reason };

    if (isEmployee(req)) {
      if (!req.employeeId) return res.status(403).json({ message: "No employee profile" });
      payload.employee = req.employeeId;
      payload.status = "PENDING";
    } else {
      if (!employee) return res.status(400).json({ message: "Missing employee" });
      payload.employee = employee;
      payload.status = "PENDING"; // default
    }

    const saved = await new TimeOff(payload).save();
    const populated = await saved.populate({
      path: "employee",
      populate: { path: "user", select: "-passwordHash" },
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating time-off request", error });
  }
};

// PATCH /api/timeoff/:id
// Employee: μπορεί να επεξεργαστεί ΜΟΝΟ δικό του και ΜΟΝΟ αν status=PENDING (όχι status/employee πεδία)
// Manager/Owner: μπορεί να αλλάξει και status
const updateTimeOff = async (req, res) => {
  const { id } = req.params;
  const { type, startDate, endDate, status, reason, employee } = req.body;

  try {
    const current = await TimeOff.findById(id);
    if (!current) return res.status(404).json({ message: "Time-off request not found" });

    if (isEmployee(req)) {
      if (!req.employeeId || String(current.employee) !== String(req.employeeId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (current.status !== "PENDING") {
        return res.status(422).json({ message: "Only PENDING requests can be edited" });
      }
    }

    const dataToUpdate = {};
    if (type !== undefined) dataToUpdate.type = type;
    if (startDate !== undefined) dataToUpdate.startDate = startDate;
    if (endDate !== undefined) dataToUpdate.endDate = endDate;
    if (reason !== undefined) dataToUpdate.reason = reason;

    if (isManagerOrOwner(req)) {
      if (status !== undefined) dataToUpdate.status = status;
      if (employee !== undefined) dataToUpdate.employee = employee;
    }

    const updated = await TimeOff.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
      context: "query",
    }).populate({
      path: "employee",
      populate: { path: "user", select: "-passwordHash" },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating time-off request", error });
  }
};

// DELETE /api/timeoff/:id
// ΠΑΝΤΑ: μόνο PENDING μπορεί να διαγραφεί (για όλους τους ρόλους)
const deleteTimeOff = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await TimeOff.findById(id);
    if (!existing) return res.status(404).json({ message: "Time-off request not found" });

    // Αν είναι EMPLOYEE, κράτα και το self-guard
    if (isEmployee(req)) {
      if (!req.employeeId || String(existing.employee) !== String(req.employeeId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    // ✅ Επιτρέπεται διαγραφή ΜΟΝΟ όταν είναι PENDING (για όλους τους ρόλους)
    if (existing.status !== "PENDING") {
      return res.status(422).json({ message: "Only PENDING requests can be deleted" });
    }

    await TimeOff.findByIdAndDelete(id);
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
  deleteTimeOff,
};
