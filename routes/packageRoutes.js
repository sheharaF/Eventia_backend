const express = require("express");
const EventPackage = require("../models/EventPackage"); // Import the model
const router = express.Router();

// Route to get all event packages (optionally filtered by eventType)
router.get("/", async (req, res) => {
  try {
    const { eventType, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };
    if (eventType) {
      query.eventType = { $regex: new RegExp(`^${eventType}$`, "i") };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [packages, total] = await Promise.all([
      EventPackage.find(query)
        .populate("vendorId", "name email")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      EventPackage.countDocuments(query),
    ]);

    res.json({
      packages,
      pagination: {
        current: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
        totalCount: total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching packages" });
  }
});

// Route to get event packages by event type
router.get("/:eventType", async (req, res) => {
  const { eventType } = req.params;
  try {
    const packages = await EventPackage.find({
      isActive: true,
      eventType: { $regex: new RegExp(`^${eventType}$`, "i") },
    }).populate("vendorId", "name email");
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching packages by event type" });
  }
});

// Export the router
module.exports = router;
