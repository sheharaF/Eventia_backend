const express = require("express");
const { verifyToken, isUser } = require("../middleware/authMiddleware");
const EventPlan = require("../models/EventPlan");
const User = require("../models/User");

const router = express.Router();

// Get user profile
router.get("/profile", verifyToken, isUser, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Invalid user token" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        _id: user._id, // ✅ use _id to match frontend
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
        address: user.address || null,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve user profile" });
  }
});

// Update user details
router.put("/profile", verifyToken, isUser, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Invalid user token" });
    }

    const { name, phone, address } = req.body;
    const updateData = {};

    if (name?.trim()) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
        address: user.address || null,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// Delete user account
router.delete("/profile", verifyToken, isUser, async (req, res) => {
  try {
    const activePlans = await EventPlan.findOne({
      userId: req.user.id,
      status: { $in: ["Planning", "Confirmed"] },
    });

    if (activePlans) {
      return res.status(400).json({
        error:
          "Cannot delete account with active event plans. Please cancel or complete them first.",
      });
    }

    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View user's cart
router.get("/cart", verifyToken, isUser, async (req, res) => {
  try {
    const cart = await EventPlan.findOne({
      userId: req.user.id,
      status: "Planning",
    }).populate([
      { path: "selectedVendors.vendorId", select: "name email phone" },
      {
        path: "selectedVendors.serviceId",
        select: "title description price category image",
      },
      {
        path: "selectedPackages.packageId",
        select: "title description price services image",
      },
    ]);

    if (!cart) {
      return res.json({ cart: null });
    }

    const vendorCost = cart.selectedVendors.reduce(
      (sum, item) => sum + (item.price || 0),
      0
    );
    const packageCost = cart.selectedPackages.reduce(
      (sum, item) => sum + (item.price || 0),
      0
    );
    const totalCost = vendorCost + packageCost;

    res.json({
      cart: {
        ...cart.toObject(),
        totalCost,
        selectedVendors: cart.selectedVendors || [],
        selectedPackages: cart.selectedPackages || [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View user's purchases
router.get("/purchases", verifyToken, isUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const purchases = await EventPlan.find({
      userId: req.user.id,
      status: { $in: ["Confirmed", "Completed", "Cancelled"] },
    })
      .populate([
        { path: "selectedVendors.vendorId", select: "name email phone" },
        {
          path: "selectedVendors.serviceId",
          select: "title description price category image",
        },
        {
          path: "selectedPackages.packageId",
          select: "title description price services image",
        },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      purchases, // ✅ frontend expects this
      pagination: {
        current: parseInt(page),
        total: Math.ceil(
          await EventPlan.countDocuments({ userId: req.user.id })
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
