const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const {
  enforceSelfOnBody,
  enforceSelfOnQuery,
  forbidMutatingForeignResource,
} = require("../middleware/selfScope");

// Controllers σου (όπως είναι στον timeOffController.js)
const {
  getAllTimeOff,
  getTimeOffById,
  createTimeOff,
  updateTimeOff,
  deleteTimeOff,
} = require("../controllers/timeOffController");

// ΣΩΣΤΟ model import με βάση την ονοματολογία σου
const TimeOff = require("../models/timeOffModel");

// Helper για owner resolve
async function getTimeOffOwner(req) {
  const doc = await TimeOff.findById(req.params.id).select("employee");
  return doc?.employee;
}

router.use(auth);

// LIST: EMPLOYEE → μόνο τα δικά του
router.get("/", enforceSelfOnQuery("employee"), getAllTimeOff);

// GET by id
router.get("/:id", getTimeOffById);

// CREATE: EMPLOYEE → μόνο για τον εαυτό του
router.post("/", enforceSelfOnBody("employee"), createTimeOff);

// UPDATE: EMPLOYEE → μόνο αν είναι δικό του
router.put(
  "/:id",
  forbidMutatingForeignResource(getTimeOffOwner),
  enforceSelfOnBody("employee"),
  updateTimeOff
);

// DELETE: EMPLOYEE → μόνο αν είναι δικό του (κανόνες status μένουν στον controller)
router.delete(
  "/:id",
  forbidMutatingForeignResource(getTimeOffOwner),
  deleteTimeOff
);

module.exports = router;
