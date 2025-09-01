const express = require("express");
const router = express.Router();
const EventPlan = require("../models/EventPlan");
const Ad = require("../models/Ads");
const EventPackage = require("../models/EventPackage");
const {
  verifyToken,
  isAuthenticated,
  isUser,
} = require("../middleware/authMiddleware");

// Create new event plan
router.post("/", verifyToken, isUser, async (req, res) => {
  try {
    const {
      eventType,
      budget,
      guestCount,
      preferredLocation,
      eventDate,
      notes,
    } = req.body;

    const newEventPlan = new EventPlan({
      userId: req.user.id,
      eventType,
      budget,
      guestCount,
      preferredLocation,
      eventDate,
      notes,
    });

    const savedPlan = await newEventPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's event plans
router.get("/my-plans", verifyToken, isAuthenticated, async (req, res) => {
  try {
    const plans = await EventPlan.find({ userId: req.user.id })
      .populate("selectedVendors.vendorId", "name email")
      .populate("selectedVendors.serviceId", "title description priceRange")
      .populate("selectedPackages.packageId", "title description priceRange")
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific event plan
router.get("/:id", verifyToken, isAuthenticated, async (req, res) => {
  try {
    const plan = await EventPlan.findById(req.params.id)
      .populate("selectedVendors.vendorId", "name email")
      .populate(
        "selectedVendors.serviceId",
        "title description priceRange images"
      )
      .populate(
        "selectedPackages.packageId",
        "title description priceRange images"
      );

    if (!plan) {
      return res.status(404).json({ error: "Event plan not found" });
    }

    // Check if user owns this plan or is admin
    if (plan.userId.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add vendor to event plan
router.post("/:id/vendors", verifyToken, isUser, async (req, res) => {
  try {
    const { vendorId, serviceId, price, notes } = req.body;

    const plan = await EventPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Event plan not found" });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if vendor already exists in plan
    const existingVendor = plan.selectedVendors.find(
      (v) =>
        v.vendorId.toString() === vendorId &&
        v.serviceId.toString() === serviceId
    );

    if (existingVendor) {
      return res
        .status(400)
        .json({ error: "Vendor already added to this plan" });
    }

    plan.selectedVendors.push({ vendorId, serviceId, price, notes });
    plan.totalCost =
      plan.selectedVendors.reduce((sum, v) => sum + (v.price || 0), 0) +
      plan.selectedPackages.reduce((sum, p) => sum + (p.price || 0), 0);

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add package to event plan
router.post("/:id/packages", verifyToken, isUser, async (req, res) => {
  try {
    const { packageId, price, notes } = req.body;

    const plan = await EventPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Event plan not found" });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if package already exists in plan
    const existingPackage = plan.selectedPackages.find(
      (p) => p.packageId.toString() === packageId
    );

    if (existingPackage) {
      return res
        .status(400)
        .json({ error: "Package already added to this plan" });
    }

    plan.selectedPackages.push({ packageId, price, notes });
    plan.totalCost =
      plan.selectedVendors.reduce((sum, v) => sum + (v.price || 0), 0) +
      plan.selectedPackages.reduce((sum, p) => sum + (p.price || 0), 0);

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove vendor from event plan
router.delete(
  "/:id/vendors/:vendorId",
  verifyToken,
  isUser,
  async (req, res) => {
    try {
      const plan = await EventPlan.findById(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: "Event plan not found" });
      }

      if (plan.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      plan.selectedVendors = plan.selectedVendors.filter(
        (v) => v.vendorId.toString() !== req.params.vendorId
      );

      plan.totalCost =
        plan.selectedVendors.reduce((sum, v) => sum + (v.price || 0), 0) +
        plan.selectedPackages.reduce((sum, p) => sum + (p.price || 0), 0);

      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Remove package from event plan
router.delete(
  "/:id/packages/:packageId",
  verifyToken,
  isUser,
  async (req, res) => {
    try {
      const plan = await EventPlan.findById(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: "Event plan not found" });
      }

      if (plan.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      plan.selectedPackages = plan.selectedPackages.filter(
        (p) => p.packageId.toString() !== req.params.packageId
      );

      plan.totalCost =
        plan.selectedVendors.reduce((sum, v) => sum + (v.price || 0), 0) +
        plan.selectedPackages.reduce((sum, p) => sum + (p.price || 0), 0);

      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update event plan status
router.put("/:id/status", verifyToken, isUser, async (req, res) => {
  try {
    const { status } = req.body;

    const plan = await EventPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Event plan not found" });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    plan.status = status;
    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recommended vendors based on event plan criteria
router.get("/:id/recommendations", verifyToken, isUser, async (req, res) => {
  try {
    const plan = await EventPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Event plan not found" });
    }

    if (plan.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Find vendors matching criteria
    const vendorQuery = {
      eventType: { $regex: new RegExp(`^${plan.eventType}$`, "i") },
      "priceRange.max": { $lte: plan.budget },
      capacity: { $gte: plan.guestCount },
      "location.city": { $regex: new RegExp(plan.preferredLocation.city, "i") },
    };

    const vendors = await Ad.find(vendorQuery)
      .populate("vendorId", "name email isApproved")
      .limit(10);

    // Find packages matching criteria
    const packageQuery = {
      eventType: { $regex: new RegExp(`^${plan.eventType}$`, "i") },
      "priceRange.max": { $lte: plan.budget },
      capacity: { $gte: plan.guestCount },
      "location.city": { $regex: new RegExp(plan.preferredLocation.city, "i") },
    };

    const packages = await EventPackage.find(packageQuery).limit(10);

    res.json({
      vendors: vendors.filter((v) => v.vendorId.isApproved),
      packages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
