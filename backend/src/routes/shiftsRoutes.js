const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createShiftValidator, updateShiftValidator,
  shiftIdParam, shiftListQuery
} = require("../validators/shiftValidators");
const {
  getAllShifts, getShiftById, createShift, updateShift, deleteShift
} = require("../controllers/shiftController");

const router = express.Router();

router.get("/", auth, requireRole("OWNER","MANAGER"), shiftListQuery, validate, getAllShifts);
router.get("/:id", auth, requireRole("OWNER","MANAGER"), shiftIdParam, validate, getShiftById);
router.post("/", auth, requireRole("OWNER","MANAGER"), createShiftValidator, validate, createShift);
router.patch("/:id", auth, requireRole("OWNER","MANAGER"), updateShiftValidator, validate, updateShift);
router.delete("/:id", auth, requireRole("OWNER","MANAGER"), shiftIdParam, validate, deleteShift);

module.exports = router;
