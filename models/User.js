const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password is required only if not a Google user
      },
    },
    googleId: { type: String }, // Add Google ID for Google-authenticated users
    role: { type: String, enum: ["User", "Admin", "Vendor"], default: "User" },
    businessRegistration: {
      type: String,
      required: function () {
        return this.role === "Vendor";
      },
    },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
