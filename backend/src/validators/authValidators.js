const { body } = require("express-validator");

const emailRule = body("email").isEmail().withMessage("Invalid email");
const passwordRule = body("password").isLength({ min: 6 }).withMessage("Password min 6 chars");
const fullNameRule = body("fullName").trim().notEmpty().withMessage("Full name required");
const roleRule = body("role").optional().isIn(["OWNER","MANAGER","EMPLOYEE"]).withMessage("Invalid role");

const registerValidator = [fullNameRule, emailRule, passwordRule, roleRule];
const loginValidator = [emailRule, passwordRule];

module.exports = { registerValidator, loginValidator };
