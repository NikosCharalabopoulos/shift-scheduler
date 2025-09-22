// backend/src/controllers/employeeController.js
const Employee = require("../models/Employee");

// GET /api/employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("user", "-passwordHash")
      .populate("department");
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch employees", error });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findById(id)
      .populate("user", "-passwordHash")
      .populate("department");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee", error });
  }
};

// POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const { user, department, position, contractHours } = req.body;

    if (!user || !department) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newEmployee = new Employee({
      user,
      department,
      position,
      contractHours
    });

    const saved = await newEmployee.save();
    const populated = await saved.populate([
      { path: "user", select: "-passwordHash" },
      { path: "department" }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error creating employee", error });
  }
};

// PATCH /api/employees/:id
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { department, position, contractHours } = req.body;

  try {
    const dataToUpdate = {};
    if (department !== undefined) dataToUpdate.department = department;
    if (position !== undefined) dataToUpdate.position = position;
    if (contractHours !== undefined) dataToUpdate.contractHours = contractHours;

    const updated = await Employee.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
      runValidators: true,
      context: "query"
    })
      .populate("user", "-passwordHash")
      .populate("department");

    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error });
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
