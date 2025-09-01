const express = require("express");
const router = express.Router();
const EventService = require("../models/EventService");

// Get all event types
router.get("/", async (req, res) => {
  try {
    const eventTypes = await EventService.find().select(
      "eventType description image"
    );
    res.json(eventTypes);
  } catch (error) {
    console.error("Error fetching event types:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get services based on event type
router.get("/:eventType", async (req, res) => {
  const eventType = decodeURIComponent(req.params.eventType);

  try {
    const eventServices = await EventService.findOne({
      eventType: { $regex: new RegExp(`^${eventType}$`, "i") },
    });

    if (!eventServices) {
      return res
        .status(404)
        .json({ error: `No services found for event type: ${eventType}` });
    }
    res.json(eventServices.serviceCategories); // Send only services array
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
