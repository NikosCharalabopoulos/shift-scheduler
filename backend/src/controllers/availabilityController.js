// backend/src/controllers/availabilityController.js
const Availability = require("../models/availabilityModel");

// helpers
const isEmployee = (req) => req.user?.role === "EMPLOYEE";

// GET /api/availability?employee=<id>&weekday=<0..6>
const getAllAvailability = async (req, res) => {
  try {
    const { employee, weekday } = req.query;
    const filter = {};

    if (isEmployee(req)) {
      if (!req.employeeId) return res.status(200).json([]);
      filter.employee = req.employeeId; // self-scope
    } else if (employee) {
      filter.employee = employee;
    }

    if (weekday !== undefined) filter.weekday = Number(weekday);

    const availability = await Availability.find(filter).populate("employee");
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch availability", error });
  }
};

// GET /api/availability/:id
const getAvailabilityById = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await Availability.findById(id).populate("employee");
    if (!record) return res.status(404).json({ message: "Availability not found" });

    // Self-guard για EMPLOYEE
    if (isEmployee(req) && String(record.employee) !== String(req.employeeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "Error fetching availability", error });
  }
};

// POST /api/availability
const createAvailability = async (req, res) => {
  try {
    const { employee, weekday, startTime, endTime } = req.body;

    const payload = { weekday, startTime, endTime };
    if (isEmployee(req)) {
      if (!req.employeeId) return res.status(403).json({ message: "No employee profile" });
      payload.employee = req.employeeId;
    } else {
      if (!employee) return res.status(400).json({ message: "Missing employee" });
      payload.employee = employee;
    }

    const saved = await new Availability(payload).save();
    const populated = await saved.populate("employee");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating availability", error });
  }
};

// PATCH /api/availability/:id
const updateAvailability = async (req, res) => {
  const { id } = req.params;
  const { weekday, startTime, endTime } = req.body;

  try {
    const existing = await Availability.findById(id);
    if (!existing) return res.status(404).json({ message: "Availability not found" });

    if (isEmployee(req) && String(existing.employee) !== String(req.employeeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const dataToUpdate = {};
    if (weekday !== undefined) dataToUpdate.weekday = weekday;
    if (startTime !== undefined) dataToUpdate.startTime = startTime;
    if (endTime !== undefined) dataToUpdate.endTime = endTime;
    // Δεν επιτρέπουμε αλλαγή owner από EMPLOYEE
    if ("employee" in req.body && !isEmployee(req)) dataToUpdate.employee = req.body.employee;

    const updated = await Availability.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
      context: "query",
    }).populate("employee");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating availability", error });
  }
};

// DELETE /api/availability/:id
const deleteAvailability = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await Availability.findById(id);
    if (!existing) return res.status(404).json({ message: "Availability not found" });

    if (isEmployee(req) && String(existing.employee) !== String(req.employeeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Availability.findByIdAndDelete(id);
    res.status(200).json({ message: "Availability deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting availability", error });
  }
};

module.exports = {
  getAllAvailability,
  getAvailabilityById,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};
