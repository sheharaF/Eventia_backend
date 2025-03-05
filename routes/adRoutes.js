const express = require("express");
const router = express.Router();
const Ad = require("../models/Ads");

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

module.exports = router;
