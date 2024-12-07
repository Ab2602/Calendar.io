const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  name: { type: String },
  email: { type: String },
  profilePhoto: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  registeredDate: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
