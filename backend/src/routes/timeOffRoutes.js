const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createTimeOffValidator, updateTimeOffValidator,
  timeOffIdParam, timeOffListQuery
} = require("../validators/timeOffValidators");
const {
  getAllTimeOff, getTimeOffById, createTimeOff, updateTimeOff, deleteTimeOff
} = require("..//controllers/timeOffController");

const router = express.Router();

router.get("/", auth, requireRole("OWNER","MANAGER"), timeOffListQuery, validate, getAllTimeOff);
router.get("/:id", auth, requireRole("OWNER","MANAGER"), timeOffIdParam, validate, getTimeOffById);
router.post("/", auth, requireRole("OWNER","MANAGER"), createTimeOffValidator, validate, createTimeOff);
router.patch("/:id", auth, requireRole("OWNER","MANAGER"), updateTimeOffValidator, validate, updateTimeOff);
router.delete("/:id", auth, requireRole("OWNER","MANAGER"), timeOffIdParam, validate, deleteTimeOff);

module.exports = router;
