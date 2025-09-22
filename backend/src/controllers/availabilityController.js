// backend/src/controllers/availabilityController.js
const Availability = require("../models/Availability");

// GET /api/availability
// optional query: ?employee=<id>
const getAllAvailability = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employee) {
      filter.employee = req.query.employee;
    }

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
    if (!record) {
      return res.status(404).json({ message: "Availability not found" });
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

    if (!employee || weekday === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRecord = new Availability({ employee, weekday, startTime, endTime });
    const saved = await newRecord.save();
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
    const dataToUpdate = {};
    if (weekday !== undefined) dataToUpdate.weekday = weekday;
    if (startTime !== undefined) dataToUpdate.startTime = startTime;
    if (endTime !== undefined) dataToUpdate.endTime = endTime;

    const updated = await Availability.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
      context: "query"
    }).populate("employee");

    if (!updated) {
      return res.status(404).json({ message: "Availability not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating availability", error });
  }
};

// DELETE /api/availability/:id
const deleteAvailability = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Availability.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Availability not found" });
    }
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
  deleteAvailability
};
