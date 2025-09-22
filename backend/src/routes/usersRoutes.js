// backend/src/routes/usersRoutes.js
const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const router = express.Router();

// GET /api/users
router.get("/", getAllUsers);

// GET /api/users/:id
router.get("/:id", getUserById);

// POST /api/users
router.post("/", createUser);

// PATCH /api/users/:id
router.patch("/:id", updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

module.exports = router;
