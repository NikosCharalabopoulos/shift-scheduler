// backend/src/routes/employeesRoutes.js
const express = require("express");
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

const router = express.Router();

// GET /api/employees
router.get("/", getAllEmployees);

// GET /api/employees/:id
router.get("/:id", getEmployeeById);

// POST /api/employees
router.post("/", createEmployee);

// PATCH /api/employees/:id
router.patch("/:id", updateEmployee);

// DELETE /api/employees/:id
router.delete("/:id", deleteEmployee);

module.exports = router;
