const mongoose = require("mongoose");
const { Schema } = mongoose;

const availabilitySchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  weekday: {
    type: Number, // 0 = Κυριακή, 1 = Δευτέρα, ... 6 = Σάββατο
    required: true,
    min: 0,
    max: 6
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
  }
}, {
  timestamps: true
});

const Availability = mongoose.model("Availability", availabilitySchema);

module.exports = Availability;
