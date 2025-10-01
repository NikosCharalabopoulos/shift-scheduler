const { body, param } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid user id");
const fullName = body("fullName").optional().trim().notEmpty().withMessage("fullName cannot be empty");
const email = body("email").optional().isEmail().withMessage("Invalid email");
const password = body("password").optional().isLength({ min: 6 }).withMessage("Password min 6 chars");
const role = body("role").optional().isIn(["OWNER","MANAGER","EMPLOYEE"]).withMessage("Invalid role");

const createUserValidator = [
  body("fullName").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  role
];
const updateUserValidator = [idParam, fullName, email, password, role];
const userIdParam = [idParam];

module.exports = { createUserValidator, updateUserValidator, userIdParam };
