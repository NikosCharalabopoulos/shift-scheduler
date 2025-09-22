// backend/src/routes/shiftAssignmentsRoutes.js
const express = require("express");
const {
  getAllShiftAssignments,
  getShiftAssignmentById,
  createShiftAssignment,
  updateShiftAssignment,
  deleteShiftAssignment
} = require("../controllers/shiftAssignmentController");

const router = express.Router();

// GET /api/shift-assignments
router.get("/", getAllShiftAssignments);

// GET /api/shift-assignments/:id
router.get("/:id", getShiftAssignmentById);

// POST /api/shift-assignments
router.post("/", createShiftAssignment);

// PATCH /api/shift-assignments/:id
router.patch("/:id", updateShiftAssignment);

// DELETE /api/shift-assignments/:id
router.delete("/:id", deleteShiftAssignment);

module.exports = router;
