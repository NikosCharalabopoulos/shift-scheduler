// backend/src/routes/shiftsRoutes.js
const express = require("express");
const {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift
} = require("../controllers/shiftController");

const router = express.Router();

// GET /api/shifts
router.get("/", getAllShifts);

// GET /api/shifts/:id
router.get("/:id", getShiftById);

// POST /api/shifts
router.post("/", createShift);

// PATCH /api/shifts/:id
router.patch("/:id", updateShift);

// DELETE /api/shifts/:id
router.delete("/:id", deleteShift);

module.exports = router;
