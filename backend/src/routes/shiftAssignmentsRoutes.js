const express = require("express");
const { auth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createShiftAssignmentValidator, updateShiftAssignmentValidator,
  shiftAssignmentIdParam, shiftAssignmentListQuery
} = require("../validators/shiftAssignmentValidators");
const {
  getAllShiftAssignments, getShiftAssignmentById, createShiftAssignment, updateShiftAssignment, deleteShiftAssignment
} = require("../controllers/shiftAssignmentController");

const router = express.Router();

// GET: όλοι οι ρόλοι με auth (self-scope στον controller)
// POST/PATCH/DELETE: ο controller μπλοκάρει αν δεν είναι MANAGER/OWNER
router.get("/", auth, shiftAssignmentListQuery, validate, getAllShiftAssignments);
router.get("/:id", auth, shiftAssignmentIdParam, validate, getShiftAssignmentById);
router.post("/", auth, createShiftAssignmentValidator, validate, createShiftAssignment);
router.patch("/:id", auth, updateShiftAssignmentValidator, validate, updateShiftAssignment);
router.delete("/:id", auth, shiftAssignmentIdParam, validate, deleteShiftAssignment);

module.exports = router;
