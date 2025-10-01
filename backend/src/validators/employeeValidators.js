const { body, param } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid employee id");

const createEmployeeValidator = [
  body("user").isMongoId().withMessage("Invalid user id"),
  body("department").isMongoId().withMessage("Invalid department id"),
  body("position").optional().isString(),
  body("contractHours").optional().isInt({ min: 0 }).withMessage("contractHours must be >= 0")
];

const updateEmployeeValidator = [
  idParam,
  body("department").optional().isMongoId(),
  body("position").optional().isString(),
  body("contractHours").optional().isInt({ min: 0 })
];

const employeeIdParam = [ idParam ];

module.exports = { createEmployeeValidator, updateEmployeeValidator, employeeIdParam };
