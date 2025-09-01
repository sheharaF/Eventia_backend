const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerRole: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    testimonial: {
      type: String,
      required: true,
      maxlength: 500,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
