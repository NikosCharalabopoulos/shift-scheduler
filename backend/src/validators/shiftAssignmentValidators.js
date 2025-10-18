const { body, param, query } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid shift-assignment id");

const createShiftAssignmentValidator = [
  body("shift").isMongoId().withMessage("Invalid shift id"),
  body("employee").isMongoId().withMessage("Invalid employee id"),
  // ❌ ΔΕΝ ζητάμε assignedBy από τον client
];

const updateShiftAssignmentValidator = [
  idParam,
  body("shift").optional().isMongoId().withMessage("Invalid shift id"),
  body("employee").optional().isMongoId().withMessage("Invalid employee id"),
  // ❌ αγνοούμε assignedBy σε update
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
