const express = require("express");
const router = express.Router();
const Ad = require("../models/Ads");
const {
  verifyToken,
  isVendor,
  isAuthenticated,
  hasRole,
} = require("../middleware/authMiddleware");

// Public route - Search ads (no authentication required)
router.get("/search", async (req, res) => {
  try {
    const { eventType, serviceCategory, location, price, capacity } = req.query;

    if (!eventType && !serviceCategory) {
      return res
        .status(400)
        .json({ error: "eventType or serviceCategory is required" });
    }

    let filters = {};

    if (eventType) {
      filters.eventType = { $regex: new RegExp(`^${eventType}$`, "i") };
    }

    if (serviceCategory) {
      const categories = serviceCategory.split(",").map((cat) => cat.trim());
      filters.serviceCategory = {
        $in: categories.map((cat) => new RegExp(`^${cat}$`, "i")),
      };
    }

    if (location) {
      filters.$or = [
        { "location.city": { $regex: new RegExp(location, "i") } },
        { "location.district": { $regex: new RegExp(location, "i") } },
      ];
    }

    if (price) {
      filters["priceRange.max"] = { $lte: parseInt(price) };
    }

    if (capacity) {
      filters.$or = [
        { capacity: "Any" },
        { capacity: { $gte: parseInt(capacity) } },
      ];
    }

    const ads = await Ad.find(filters);
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all ads (public)
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find().populate("vendorId", "name email");
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get specific ad by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate(
      "vendorId",
      "name email"
    );
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }
    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user's own ads (authenticated users only)
router.get("/user/my-ads", verifyToken, isAuthenticated, async (req, res) => {
  try {
    const ads = await Ad.find({ vendorId: req.user.id });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create new ad (Vendor only)
router.post("/", verifyToken, isVendor, async (req, res) => {
  try {
    const newAd = new Ad({
      ...req.body,
      vendorId: req.user.id,
    });
    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update ad (Owner only)
router.put("/:id", verifyToken, isVendor, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check if the user owns this ad
    if (ad.vendorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Access denied. You can only update your own ads" });
    }

    const updatedAd = await Ad.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete ad (Owner only)
router.delete("/:id", verifyToken, isVendor, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check if the user owns this ad
    if (ad.vendorId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Access denied. You can only delete your own ads" });
    }

    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
