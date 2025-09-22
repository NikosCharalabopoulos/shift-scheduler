// backend/src/controllers/departmentController.js
const Department = require("../models/Department");

// GET /api/departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch departments", error });
  }
};

// GET /api/departments/:id
const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: "Error fetching department", error });
  }
};

// POST /api/departments
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newDepartment = new Department({ name, description });
    const saved = await newDepartment.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error creating department", error });
  }
};

// PATCH /api/departments/:id
const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;

    const updated = await Department.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
      context: "query"
    });

    if (!updated) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating department", error });
  }
};

// DELETE /api/departments/:id
const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting department", error });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
