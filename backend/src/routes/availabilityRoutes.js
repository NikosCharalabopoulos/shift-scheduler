// backend/src/routes/availabilityRoutes.js
const express = require("express");
const {
  getAllAvailability,
  getAvailabilityById,
  createAvailability,
  updateAvailability,
  deleteAvailability
} = require("../controllers/availabilityController");

const router = express.Router();

// GET /api/availability
router.get("/", getAllAvailability);

// GET /api/availability/:id
router.get("/:id", getAvailabilityById);

// POST /api/availability
router.post("/", createAvailability);

// PATCH /api/availability/:id
router.patch("/:id", updateAvailability);

// DELETE /api/availability/:id
router.delete("/:id", deleteAvailability);

module.exports = router;
