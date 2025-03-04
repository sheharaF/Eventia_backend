const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // Example: "Venue & Buffet"
  location: { type: String, default: "Any" },
  price: { type: Number, required: true }, // Renamed from "budget" to "price"
  guestCount: { type: mongoose.Schema.Types.Mixed, default: "Any" }, // Can be a number or "Any"
  image: { type: String, required: true },
});

const Ad = mongoose.model("Ad", AdSchema);
module.exports = Ad;
