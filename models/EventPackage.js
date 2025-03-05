const mongoose = require("mongoose");

// Define the schema for the EventPackage
const packageSchema = new mongoose.Schema({
  title: String,
  eventType: String,
  serviceCategory: String,
  description: String,
  location: {
    city: String,
    district: String,
  },
  priceRange: {
    min: Number,
    max: Number,
  },
  capacity: Number,
  images: [String],
});

// Create the model
const EventPackage = mongoose.model("EventPackage", packageSchema);

// Export the model
module.exports = EventPackage;
