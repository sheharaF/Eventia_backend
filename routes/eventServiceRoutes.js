const express = require("express");
const EventService = require("../models/EventService");

const router = express.Router();

// List available event types configured
router.get("/", async (req, res) => {
  try {
    const docs = await EventService.find({}, { eventType: 1 }).sort({ eventType: 1 });
    const eventTypes = [...new Set(docs.map((d) => d.eventType))];
    res.json({ eventTypes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get required and optional services for a given event type
router.get("/:eventType", async (req, res) => {
  try {
    const { eventType } = req.params;

    // Case-insensitive lookup
    const doc = await EventService.findOne({
      eventType: new RegExp(`^${eventType}$`, "i"),
    }).populate("servicecategory.popularVendors", "name email");

    if (!doc) {
      return res.status(404).json({ error: "Event type not configured" });
    }

    // Use the standardized field name matching DB: `servicecategory`
    const categories = doc.servicecategory || [];

    const required = categories
      .filter((c) => (c.status || "").toLowerCase() === "required")
      .map((c) => c.name);
    const optional = categories
      .filter((c) => (c.status || "").toLowerCase() === "optional")
      .map((c) => c.name);

    res.json({
      eventType: doc.eventType,
      required,
      optional,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
