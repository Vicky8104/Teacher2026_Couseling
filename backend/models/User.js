const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  post: String,
  subject: String,
  rollNo: String,
  meritNo: String,
  name: String,
  fatherName: String,
  gender: String,
  dob: Date,
  maritalStatus: String,
  homeDistrict: String,
  category: String,
  selectionCategory: String,
  specialCategory: String,
  mobileNo: String,
  email: String,
  otherOption: String
});

userSchema.index({ post: 1, subject: 1, rollNo: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);

