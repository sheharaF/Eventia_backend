const mongoose = require("mongoose");

const eventServiceSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ["Wedding", "Birthday", "Corporate", "Anniversary", "Other"],
    },
    // Match existing Mongo documents exactly: `servicecategory`
    servicecategory: [
      {
        name: { type: String, required: true }, // e.g., "Photography"
        status: {
          type: String,
          enum: ["Required", "Optional"],
          required: true,
        },
        description: String,
        averagePrice: Number,
        popularVendors: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    description: String,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventService", eventServiceSchema);
