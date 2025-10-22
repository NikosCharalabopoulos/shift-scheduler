const express = require("express");
const { auth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createTimeOffValidator, updateTimeOffValidator,
  timeOffIdParam, timeOffListQuery
} = require("../validators/timeOffValidators");
const {
  getAllTimeOff, getTimeOffById, createTimeOff, updateTimeOff, deleteTimeOff
} = require("../controllers/timeOffController");

const router = express.Router();

// Όλοι οι ρόλοι με auth. Ο controller χειρίζεται self-scope και τι επιτρέπεται να αλλάξει ποιος.
router.get("/", auth, timeOffListQuery, validate, getAllTimeOff);
router.get("/:id", auth, timeOffIdParam, validate, getTimeOffById);
router.post("/", auth, createTimeOffValidator, validate, createTimeOff);
router.patch("/:id", auth, updateTimeOffValidator, validate, updateTimeOff);
router.delete("/:id", auth, timeOffIdParam, validate, deleteTimeOff);

module.exports = router;
