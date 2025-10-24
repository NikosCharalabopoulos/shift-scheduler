const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const {
  enforceSelfOnBody,
  enforceSelfOnQuery,
  forbidMutatingForeignResource,
} = require("../middleware/selfScope");

// Controllers σου (όπως είναι γραμμένοι στον availabilityController.js)
const {
  getAllAvailability,
  getAvailabilityById,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");

// ΣΩΣΤΟ model import με βάση την ονοματολογία σου
const Availability = require("../models/availabilityModel");

// Helper για resolve του owner σε update/delete
async function getAvailabilityOwner(req) {
  const doc = await Availability.findById(req.params.id).select("employee");
  return doc?.employee;
}

// Όλα απαιτούν auth
router.use(auth);

// LIST: EMPLOYEE → μόνο τα δικά του
router.get("/", enforceSelfOnQuery("employee"), getAllAvailability);

// GET by id
router.get("/:id", getAvailabilityById);

// CREATE: EMPLOYEE → σώζει μόνο για τον εαυτό του
router.post("/", enforceSelfOnBody("employee"), createAvailability);

// PATCH (ο controller σου είναι PATCH): EMPLOYEE → μόνο αν είναι δικό του
router.patch(
  "/:id",
  forbidMutatingForeignResource(getAvailabilityOwner),
  enforceSelfOnBody("employee"),
  updateAvailability
);

// DELETE: EMPLOYEE → μόνο δικό του
router.delete(
  "/:id",
  forbidMutatingForeignResource(getAvailabilityOwner),
  deleteAvailability
);

module.exports = router;
