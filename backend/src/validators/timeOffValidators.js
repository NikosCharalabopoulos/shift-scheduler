const { body, param, query } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid time-off id");

const createTimeOffValidator = [
  body("employee").isMongoId().withMessage("Invalid employee id"),
  body("type").isIn(["VACATION","SICK","OTHER"]).withMessage("Invalid type"),
  body("startDate").isISO8601().toDate().withMessage("Invalid startDate"),
  body("endDate").isISO8601().toDate().withMessage("Invalid endDate"),
  body("reason").optional().isString()
];

const updateTimeOffValidator = [
  idParam,
  body("type").optional().isIn(["VACATION","SICK","OTHER"]),
  body("startDate").optional().isISO8601().toDate(),
  body("endDate").optional().isISO8601().toDate(),
  body("status").optional().isIn(["PENDING","APPROVED","DECLINED"]),
  body("reason").optional().isString()
];

const timeOffIdParam = [ idParam ];
const timeOffListQuery = [
  query("employee").optional().isMongoId(),
  query("status").optional().isIn(["PENDING","APPROVED","DECLINED"]),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601()
];

module.exports = {
  createTimeOffValidator,
  updateTimeOffValidator,
  timeOffIdParam,
  timeOffListQuery
};
