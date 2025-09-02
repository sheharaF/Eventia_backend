const mongoose = require("mongoose");

// Define the schema for the EventPackage
const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventType: { type: String, required: true },
    serviceCategory: { type: String },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For packages, we store a flat price
    price: { type: Number, required: true },
    // Optional services breakdown within the package
    services: { type: Array, default: [] },
    location: {
      city: { type: String },
      district: { type: String },
    },
    // Backwards compatible priceRange if needed by older consumers
    priceRange: {
      min: { type: Number },
      max: { type: Number },
    },
    capacity: { type: mongoose.Schema.Types.Mixed },
    images: [{ type: String }],
    availableDates: [{ type: Date }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create the model
const EventPackage = mongoose.model("EventPackage", packageSchema);

// Export the model
module.exports = EventPackage;
