const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createDepartmentValidator, updateDepartmentValidator, departmentIdParam
} = require("../validators/departmentValidators");
const {
  getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment
} = require("../controllers/departmentController");

const router = express.Router();

router.get("/", auth, requireRole("OWNER","MANAGER"), getAllDepartments);
router.get("/:id", auth, requireRole("OWNER","MANAGER"), departmentIdParam, validate, getDepartmentById);
router.post("/", auth, requireRole("OWNER","MANAGER"), createDepartmentValidator, validate, createDepartment);
router.patch("/:id", auth, requireRole("OWNER","MANAGER"), updateDepartmentValidator, validate, updateDepartment);
router.delete("/:id", auth, requireRole("OWNER","MANAGER"), departmentIdParam, validate, deleteDepartment);

module.exports = router;
