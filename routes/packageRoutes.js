const express = require("express");
const EventPackage = require("../models/EventPackage"); // Import the model
const router = express.Router();

// Route to get all event packages
router.get("/", async (req, res) => {
  try {
    const packages = await EventPackage.find();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching packages" });
  }
});

// Route to get event packages by event type
router.get("/:eventType", async (req, res) => {
  const { eventType } = req.params;
  try {
    const packages = await EventPackage.find({ eventType });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching packages by event type" });
  }
});

// Export the router
module.exports = router;
