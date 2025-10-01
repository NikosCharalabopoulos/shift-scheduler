const { body, param, query } = require("express-validator");

const timeHHmm = v => /^\d{2}:\d{2}$/.test(v);

const idParam = param("id").isMongoId().withMessage("Invalid availability id");
const employeeQ = query("employee").optional().isMongoId().withMessage("Invalid employee id");

const createAvailabilityValidator = [
  body("employee").isMongoId().withMessage("Invalid employee id"),
  body("weekday").isInt({ min:0, max:6 }).withMessage("weekday must be 0..6"),
  body("startTime").custom(v => timeHHmm(v)).withMessage("startTime must be HH:mm"),
  body("endTime").custom(v => timeHHmm(v)).withMessage("endTime must be HH:mm")
];

const updateAvailabilityValidator = [
  idParam,
  body("weekday").optional().isInt({ min:0, max:6 }),
  body("startTime").optional().custom(v => timeHHmm(v)),
  body("endTime").optional().custom(v => timeHHmm(v))
];

const availabilityIdParam = [ idParam ];
const availabilityListQuery = [ employeeQ ];

module.exports = {
  createAvailabilityValidator,
  updateAvailabilityValidator,
  availabilityIdParam,
  availabilityListQuery
};
