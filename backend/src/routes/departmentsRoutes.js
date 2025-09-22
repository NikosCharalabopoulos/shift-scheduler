// backend/src/routes/departmentsRoutes.js
const express = require("express");
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require("../controllers/departmentController");

const router = express.Router();

// GET /api/departments
router.get("/", getAllDepartments);

// GET /api/departments/:id
router.get("/:id", getDepartmentById);

// POST /api/departments
router.post("/", createDepartment);

// PATCH /api/departments/:id
router.patch("/:id", updateDepartment);

// DELETE /api/departments/:id
router.delete("/:id", deleteDepartment);

module.exports = router;
