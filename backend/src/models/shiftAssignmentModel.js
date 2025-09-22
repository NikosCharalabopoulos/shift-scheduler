const mongoose = require("mongoose");
const { Schema } = mongoose;

const shiftAssignmentSchema = new Schema({
  shift: {
    type: Schema.Types.ObjectId,
    ref: "Shift",
    required: true
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: "User", // ποιος έκανε την ανάθεση
    required: true
  }
}, {
  timestamps: true
});

const ShiftAssignment = mongoose.model("ShiftAssignment", shiftAssignmentSchema);

module.exports = ShiftAssignment;
