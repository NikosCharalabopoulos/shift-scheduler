const mongoose = require("mongoose");
const { Schema } = mongoose;

const timeOffSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  type: {
    type: String,
    enum: ["VACATION", "SICK", "OTHER"],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "DECLINED"],
    default: "PENDING"
  },
  reason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const TimeOff = mongoose.model("TimeOff", timeOffSchema);

module.exports = TimeOff;
