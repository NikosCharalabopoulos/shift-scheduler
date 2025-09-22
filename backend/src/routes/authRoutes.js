// backend/src/routes/authRoutes.js
const express = require("express");
const {
  register,
  login,
  logout,
  me
} = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", me);

module.exports = router;
