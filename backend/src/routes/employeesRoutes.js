const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createEmployeeValidator, updateEmployeeValidator, employeeIdParam
} = require("../validators/employeeValidators");
const {
  getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee
} = require("../controllers/employeeController");

const router = express.Router();

router.get("/", auth, requireRole("OWNER","MANAGER"), getAllEmployees);
router.get("/:id", auth, requireRole("OWNER","MANAGER"), employeeIdParam, validate, getEmployeeById);
router.post("/", auth, requireRole("OWNER","MANAGER"), createEmployeeValidator, validate, createEmployee);
router.patch("/:id", auth, requireRole("OWNER","MANAGER"), updateEmployeeValidator, validate, updateEmployee);
router.delete("/:id", auth, requireRole("OWNER","MANAGER"), employeeIdParam, validate, deleteEmployee);

module.exports = router;
