const express = require("express");
const User = require("../models/User");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Approve or Reject Vendor
router.put("/approve-vendor/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;

    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== "Vendor") {
      return res.status(404).json({ error: "Vendor not found" });
    }

    vendor.isApproved = approve;
    await vendor.save();

    res.json({ message: `Vendor ${approve ? "approved" : "rejected"}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
