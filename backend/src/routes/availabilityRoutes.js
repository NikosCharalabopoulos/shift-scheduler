const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createAvailabilityValidator, updateAvailabilityValidator,
  availabilityIdParam, availabilityListQuery
} = require("../validators/availabilityValidators");
const {
  getAllAvailability, getAvailabilityById, createAvailability, updateAvailability, deleteAvailability
} = require("../controllers/availabilityController");

const router = express.Router();

router.get("/", auth, requireRole("OWNER","MANAGER"), availabilityListQuery, validate, getAllAvailability);
router.get("/:id", auth, requireRole("OWNER","MANAGER"), availabilityIdParam, validate, getAvailabilityById);
router.post("/", auth, requireRole("OWNER","MANAGER"), createAvailabilityValidator, validate, createAvailability);
router.patch("/:id", auth, requireRole("OWNER","MANAGER"), updateAvailabilityValidator, validate, updateAvailability);
router.delete("/:id", auth, requireRole("OWNER","MANAGER"), availabilityIdParam, validate, deleteAvailability);

module.exports = router;
