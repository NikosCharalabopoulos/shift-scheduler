const { body, param } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid department id");
const name = body("name").optional().trim().notEmpty().withMessage("Name cannot be empty");
const description = body("description").optional().isString();

const createDepartmentValidator = [ body("name").trim().notEmpty() , description ];
const updateDepartmentValidator = [ idParam, name, description ];
const departmentIdParam = [ idParam ];

module.exports = { createDepartmentValidator, updateDepartmentValidator, departmentIdParam };
