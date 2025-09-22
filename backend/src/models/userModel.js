const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["OWNER", "MANAGER", "EMPLOYEE"],
    default: "EMPLOYEE",
    required: true
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
