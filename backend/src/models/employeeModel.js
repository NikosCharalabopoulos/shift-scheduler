const mongoose = require("mongoose");
const { Schema } = mongoose;

const employeeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // κάθε user έχει μόνο ένα employee profile
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  position: {
    type: String,
    trim: true
  },
  contractHours: {
    type: Number, // max ώρες/εβδομάδα
    min: 0
  }
}, {
  timestamps: true
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
