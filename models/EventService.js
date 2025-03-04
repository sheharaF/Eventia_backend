const mongoose = require("mongoose");

const eventServiceSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // e.g., "Wedding"
  services: [
    {
      name: { type: String, required: true }, // e.g., "Photography"
      status: { type: String, enum: ["Required", "Optional"], required: true },
    },
  ],
});

module.exports = mongoose.model("EventServices", eventServiceSchema);
