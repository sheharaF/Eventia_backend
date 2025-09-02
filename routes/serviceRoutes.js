// routes/serviceRoutes.js
const express = require("express");
const router = express.Router();
const Ad = require("../models/Ads");

// @desc Get all services (with optional filters, pagination, search)
// @route GET /api/services
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      city,
      district,
    } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.serviceCategory = { $regex: category, $options: "i" };
    }

    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    if (district) {
      query["location.district"] = { $regex: district, $options: "i" };
    }

    const services = await Ad.find(query)
      .populate("vendorId", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Ad.countDocuments(query);

    res.json({
      services,
      pagination: {
        current: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
        totalCount: total,
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc Get a single service by ID
// @route GET /api/services/:id
router.get("/:id", async (req, res) => {
  try {
    const service = await Ad.findById(req.params.id).populate(
      "vendorId",
      "name email phone"
    );
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
