const { body, param, query } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid shift-assignment id");

const createShiftAssignmentValidator = [
  body("assignedBy").not().exists().withMessage("assignedBy is server-side only"),
  body("shift").isMongoId().withMessage("Invalid shift id"),
  body("employee").isMongoId().withMessage("Invalid employee id"),
];

const updateShiftAssignmentValidator = [
  idParam,
  body("assignedBy").not().exists().withMessage("assignedBy cannot be updated"),
  body("shift").optional().isMongoId().withMessage("Invalid shift id"),
  body("employee").optional().isMongoId().withMessage("Invalid employee id"),
];

const shiftAssignmentIdParam = [idParam];
const shiftAssignmentListQuery = [
  query("shift").optional().isMongoId().withMessage("Invalid shift id"),
  query("employee").optional().isMongoId().withMessage("Invalid employee id"),
];

module.exports = {
  createShiftAssignmentValidator,
  updateShiftAssignmentValidator,
  shiftAssignmentIdParam,
  shiftAssignmentListQuery,
};
