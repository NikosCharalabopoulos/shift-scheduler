const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createShiftAssignmentValidator, updateShiftAssignmentValidator,
  shiftAssignmentIdParam, shiftAssignmentListQuery
} = require("../validators/shiftAssignmentValidators");
const {
  getAllShiftAssignments, getShiftAssignmentById, createShiftAssignment, updateShiftAssignment, deleteShiftAssignment
} = require("../controllers/shiftAssignmentController");

const router = express.Router();

router.get("/", auth, requireRole("OWNER","MANAGER"), shiftAssignmentListQuery, validate, getAllShiftAssignments);
router.get("/:id", auth, requireRole("OWNER","MANAGER"), shiftAssignmentIdParam, validate, getShiftAssignmentById);
router.post("/", auth, requireRole("OWNER","MANAGER"), createShiftAssignmentValidator, validate, createShiftAssignment);
router.patch("/:id", auth, requireRole("OWNER","MANAGER"), updateShiftAssignmentValidator, validate, updateShiftAssignment);
router.delete("/:id", auth, requireRole("OWNER","MANAGER"), shiftAssignmentIdParam, validate, deleteShiftAssignment);

module.exports = router;
