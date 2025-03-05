const express = require("express");
const router = express.Router();
const EventService = require("../models/EventService");

// 1️⃣ Get services based on event type
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
    res.json(eventServices.servicecategory); // Send only services array
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
