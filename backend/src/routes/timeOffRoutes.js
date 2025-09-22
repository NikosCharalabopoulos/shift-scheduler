// backend/src/routes/timeOffRoutes.js
const express = require("express");
const {
  getAllTimeOff,
  getTimeOffById,
  createTimeOff,
  updateTimeOff,
  deleteTimeOff
} = require("../controllers/timeOffController");

const router = express.Router();

// GET /api/timeoff
router.get("/", getAllTimeOff);

// GET /api/timeoff/:id
router.get("/:id", getTimeOffById);

// POST /api/timeoff
router.post("/", createTimeOff);

// PATCH /api/timeoff/:id
router.patch("/:id", updateTimeOff);

// DELETE /api/timeoff/:id
router.delete("/:id", deleteTimeOff);

module.exports = router;
