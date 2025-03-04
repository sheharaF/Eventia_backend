const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

// Get all districts and cities
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Search Cities (Optimized)
router.get("/search", async (req, res) => {
  try {
    const query = req.query.query?.trim();

    if (!query) {
      return res.json([]);
    }

    // 🔥 Fix: Use `$elemMatch` for better matching on array fields
    const locations = await Location.find({
      cities: { $elemMatch: { $regex: query, $options: "i" } },
    });

    // Extract matching cities with their districts
    const matchingCities = [];
    locations.forEach((location) => {
      location.cities.forEach((city) => {
        if (city.toLowerCase().includes(query.toLowerCase())) {
          matchingCities.push({ city, district: location.district });
        }
      });
    });

    res.json(matchingCities);
  } catch (err) {
    console.error("Error searching locations:", err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Get cities based on a district
router.get("/:district", async (req, res) => {
  try {
    let district = req.params.district.trim();

    // 🔥 Fix: Case-insensitive and space-tolerant search
    const location = await Location.findOne({
      district: { $regex: `^${district}$`, $options: "i" },
    });

    if (!location) {
      return res
        .status(404)
        .json({ message: `No cities found for district: ${district}` });
    }

    res.json(location.cities);
  } catch (err) {
    console.error("Error fetching cities:", err);
    res.status(500).json({ error: "Failed to fetch district data" });
  }
});

module.exports = router;
