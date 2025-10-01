const express = require("express");
const { auth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createUserValidator, updateUserValidator, userIdParam
} = require("../validators/userValidators");
const {
  getAllUsers, getUserById, createUser, updateUser, deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.get("/", auth, requireRole("OWNER","MANAGER"), getAllUsers);
router.get("/:id", auth, requireRole("OWNER","MANAGER"), userIdParam, validate, getUserById);
router.post("/", auth, requireRole("OWNER","MANAGER"), createUserValidator, validate, createUser);
router.patch("/:id", auth, requireRole("OWNER","MANAGER"), updateUserValidator, validate, updateUser);
router.delete("/:id", auth, requireRole("OWNER"), userIdParam, validate, deleteUser);

module.exports = router;
