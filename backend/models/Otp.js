const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  post: String,
  subject: String,
  rollNo: String,
  email: String,
  otp: String,
  expiresAt: Date,
  isVerified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 }
});

module.exports = mongoose.model("Otp", otpSchema);
