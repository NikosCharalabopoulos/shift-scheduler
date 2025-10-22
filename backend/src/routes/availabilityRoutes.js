const express = require("express");
const { auth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createAvailabilityValidator, updateAvailabilityValidator,
  availabilityIdParam, availabilityListQuery
} = require("../validators/availabilityValidators");
const {
  getAllAvailability, getAvailabilityById, createAvailability, updateAvailability, deleteAvailability
} = require("../controllers/availabilityController");

const router = express.Router();

// Όλοι οι ρόλοι με auth. Το self-scope/permissions εφαρμόζονται στον controller.
router.get("/", auth, availabilityListQuery, validate, getAllAvailability);
router.get("/:id", auth, availabilityIdParam, validate, getAvailabilityById);
router.post("/", auth, createAvailabilityValidator, validate, createAvailability);
router.patch("/:id", auth, updateAvailabilityValidator, validate, updateAvailability);
router.delete("/:id", auth, availabilityIdParam, validate, deleteAvailability);

module.exports = router;
