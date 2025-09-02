const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventType: { type: String, required: true }, // Required field
    serviceCategory: { type: String, required: true }, // Required field
    location: {
      city: { type: String, required: true },
      district: { type: String, required: true },
    },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    capacity: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be a number or "Any"
    images: [{ type: String, required: true }],
    availableDates: [{ type: Date }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", adSchema);
