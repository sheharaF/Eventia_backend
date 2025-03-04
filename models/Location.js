const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  district: { type: String, required: true }, // e.g., "Colombo"
  cities: { type: [String], required: true }, // e.g., ["Colombo 01", "Colombo 02", "Moratuwa"]
});

module.exports = mongoose.model("Location", locationSchema);
