const { body, param, query } = require("express-validator");

const timeHHmm = v => /^\d{2}:\d{2}$/.test(v);

const idParam = param("id").isMongoId().withMessage("Invalid shift id");

const createShiftValidator = [
  body("department").isMongoId().withMessage("Invalid department id"),
  body("date").isISO8601().toDate().withMessage("Invalid date"),
  body("startTime").custom(v => timeHHmm(v)).withMessage("startTime must be HH:mm"),
  body("endTime").custom(v => timeHHmm(v)).withMessage("endTime must be HH:mm"),
  body("notes").optional().isString()
];

const updateShiftValidator = [
  idParam,
  body("department").optional().isMongoId(),
  body("date").optional().isISO8601().toDate(),
  body("startTime").optional().custom(v => timeHHmm(v)),
  body("endTime").optional().custom(v => timeHHmm(v)),
  body("notes").optional().isString()
];

const shiftIdParam = [ idParam ];
const shiftListQuery = [
  query("department").optional().isMongoId(),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601()
];

module.exports = {
  createShiftValidator,
  updateShiftValidator,
  shiftIdParam,
  shiftListQuery
};
