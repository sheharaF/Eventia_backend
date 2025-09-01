const express = require("express");
const router = express.Router();
const Testimonial = require("../models/Testimonial");
const {
  verifyToken,
  isAdmin,
  isAuthenticated,
} = require("../middleware/authMiddleware");

// Public route - Get approved testimonials
router.get("/", async (req, res) => {
  try {
    const { eventType, limit = 10 } = req.query;

    let query = { isApproved: true };
    if (eventType) {
      query.eventType = { $regex: new RegExp(`^${eventType}$`, "i") };
    }

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get testimonial by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    if (!testimonial.isApproved) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit new testimonial (authenticated users)
router.post("/", verifyToken, isAuthenticated, async (req, res) => {
  try {
    const {
      customerName,
      customerRole,
      eventType,
      rating,
      testimonial,
      vendorId,
      image,
    } = req.body;

    const newTestimonial = new Testimonial({
      customerName,
      customerRole,
      eventType,
      rating,
      testimonial,
      vendorId,
      image,
      isApproved: false, // Requires admin approval
    });

    const savedTestimonial = await newTestimonial.save();
    res.status(201).json({
      message: "Testimonial submitted successfully and pending approval",
      testimonial: savedTestimonial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
// Get all testimonials (admin only)
router.get("/admin/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.isApproved = status === "approved";
    }

    const testimonials = await Testimonial.find(query)
      .populate("vendorId", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Testimonial.countDocuments(query);

    res.json({
      testimonials,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/reject testimonial (admin only)
router.put("/admin/:id/approve", verifyToken, isAdmin, async (req, res) => {
  try {
    const { approve } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    testimonial.isApproved = approve;
    await testimonial.save();

    res.json({
      message: `Testimonial ${approve ? "approved" : "rejected"}`,
      testimonial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete testimonial (admin only)
router.delete("/admin/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get testimonials by vendor (for vendor dashboard)
router.get(
  "/vendor/:vendorId",
  verifyToken,
  isAuthenticated,
  async (req, res) => {
    try {
      const { vendorId } = req.params;

      // Check if user is the vendor or admin
      if (req.user.role !== "Admin" && req.user.id !== vendorId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const testimonials = await Testimonial.find({ vendorId }).sort({
        createdAt: -1,
      });

      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
