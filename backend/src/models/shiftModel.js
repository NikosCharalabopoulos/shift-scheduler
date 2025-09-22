const mongoose = require("mongoose");
const { Schema } = mongoose;

const shiftSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // π.χ. "09:00"
    required: true,
    trim: true
  },
  endTime: {
    type: String, // π.χ. "17:00"
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Shift = mongoose.model("Shift", shiftSchema);

module.exports = Shift;
