const { body, param, query } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid shift-assignment id");

const createShiftAssignmentValidator = [
  body("shift").isMongoId().withMessage("Invalid shift id"),
  body("employee").isMongoId().withMessage("Invalid employee id"),
  body("assignedBy").isMongoId().withMessage("Invalid user id")
];

const updateShiftAssignmentValidator = [
  idParam,
  body("shift").optional().isMongoId(),
  body("employee").optional().isMongoId(),
  body("assignedBy").optional().isMongoId()
];

const shiftAssignmentIdParam = [ idParam ];
const shiftAssignmentListQuery = [
  query("shift").optional().isMongoId(),
  query("employee").optional().isMongoId()
];

module.exports = {
  createShiftAssignmentValidator,
  updateShiftAssignmentValidator,
  shiftAssignmentIdParam,
  shiftAssignmentListQuery
};
