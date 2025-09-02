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
      enum: ["Wedding", "Birthday", "Corporate", "Anniversary", "Other"],
      required: function () {
        return this.status !== "Planning"; // required when confirming
      },
    },
    budget: {
      type: Number,
      required: function () {
        return this.status !== "Planning";
      },
    },
    guestCount: {
      type: Number,
      required: function () {
        return this.status !== "Planning";
      },
    },
    preferredLocation: {
      city: { type: String },
      district: { type: String },
    },
    eventDate: {
      type: Date,
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
        quantity: { type: Number, default: 1 },
        notes: String,
      },
    ],
    selectedPackages: [
      {
        packageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EventPackage",
        },
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        price: Number,
        quantity: { type: Number, default: 1 },
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
