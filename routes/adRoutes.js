const express = require("express");
const router = express.Router();
const Ad = require("../models/Ads");

// ✅ Route to fetch all ads
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Route to search ads by filters
router.get("/search", async (req, res) => {
  try {
    const { type, location, price, guestCount } = req.query;

    let filters = {};

    if (type && type !== "Any")
      filters.type = { $regex: new RegExp(type, "i") }; // Case-insensitive search
    if (location && location !== "Any") filters.location = location;
    if (price) filters.price = { $lte: parseInt(price) }; // Find ads within budget
    if (guestCount && guestCount !== "Any") {
      filters.$or = [
        { guestCount: "Any" }, // Includes ads that don't require guest count
        { guestCount: { $gte: parseInt(guestCount) } }, // Ensures min guest count
      ];
    }

    const ads = await Ad.find(filters);
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
