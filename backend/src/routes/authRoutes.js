const express = require("express");
const { register, login, logout, me } = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { registerValidator, loginValidator } = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/logout", auth, logout);
router.get("/me", auth, me);

module.exports = router;
