const mongoose = require("mongoose");

const eventPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ["Wedding", "Birthday", "Corporate", "Anniversary", "Other"],
    },
    budget: {
      type: Number,
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
    },
    preferredLocation: {
      city: { type: String, required: true },
      district: { type: String, required: true },
    },
    eventDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Planning", "Confirmed", "Completed", "Cancelled"],
      default: "Planning",
    },
    selectedVendors: [
      {
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ad",
        },
        price: Number,
        notes: String,
      },
    ],
    selectedPackages: [
      {
        packageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EventPackage",
        },
        price: Number,
        notes: String,
      },
    ],
    totalCost: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventPlan", eventPlanSchema);
