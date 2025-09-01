const express = require("express");
const router = express.Router();
const Ad = require("../models/Ads");
const EventPlan = require("../models/EventPlan");
const User = require("../models/User");
const { verifyToken, isVendor } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Get vendor dashboard overview
router.get("/dashboard", verifyToken, isVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get vendor's services
    const services = await Ad.find({ vendorId }).sort({ createdAt: -1 });

    // Get total earnings (from event plans that include this vendor)
    const eventPlans = await EventPlan.find({
      "selectedVendors.vendorId": vendorId,
      status: { $in: ["Confirmed", "Completed"] },
    });

    const totalEarnings = eventPlans.reduce((sum, plan) => {
      const vendorService = plan.selectedVendors.find(
        (v) => v.vendorId.toString() === vendorId
      );
      return sum + (vendorService?.price || 0);
    }, 0);

    // Get pending bookings
    const pendingBookings = eventPlans.filter(
      (plan) => plan.status === "Planning"
    );

    // Get approved bookings
    const approvedBookings = eventPlans.filter(
      (plan) => plan.status === "Confirmed"
    );

    // Get completed bookings
    const completedBookings = eventPlans.filter(
      (plan) => plan.status === "Completed"
    );

    res.json({
      services: {
        total: services.length,
        list: services.slice(0, 5), // Show latest 5
      },
      earnings: {
        total: totalEarnings,
        thisMonth: 0, // TODO: Calculate monthly earnings
      },
      bookings: {
        pending: pendingBookings.length,
        approved: approvedBookings.length,
        completed: completedBookings.length,
        total: eventPlans.length,
      },
      recentActivity: eventPlans.slice(0, 10), // Show latest 10
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor's services with pagination
router.get("/services", verifyToken, isVendor, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = { vendorId: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
        { serviceCategory: { $regex: search, $options: "i" } },
      ];
    }

    const services = await Ad.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Ad.countDocuments(query);

    res.json({
      services,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor's bookings
router.get("/bookings", verifyToken, isVendor, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { "selectedVendors.vendorId": req.user.id };

    if (status) {
      query.status = status;
    }

    const bookings = await EventPlan.find(query)
      .populate("userId", "name email")
      .populate("selectedVendors.serviceId", "title description")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await EventPlan.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor's earnings report
router.get("/earnings", verifyToken, isVendor, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const eventPlans = await EventPlan.find({
      "selectedVendors.vendorId": req.user.id,
      status: { $in: ["Confirmed", "Completed"] },
      ...dateQuery,
    });

    const earnings = eventPlans.reduce((sum, plan) => {
      const vendorService = plan.selectedVendors.find(
        (v) => v.vendorId.toString() === req.user.id
      );
      return sum + (vendorService?.price || 0);
    }, 0);

    // Group by month for chart data
    const monthlyEarnings = {};
    eventPlans.forEach((plan) => {
      const month = plan.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      const vendorService = plan.selectedVendors.find(
        (v) => v.vendorId.toString() === req.user.id
      );
      monthlyEarnings[month] =
        (monthlyEarnings[month] || 0) + (vendorService?.price || 0);
    });

    res.json({
      totalEarnings: earnings,
      monthlyBreakdown: monthlyEarnings,
      totalBookings: eventPlans.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vendor profile
router.put("/profile", verifyToken, isVendor, async (req, res) => {
  try {
    const { name, businessRegistration } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, businessRegistration },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor statistics
router.get("/stats", verifyToken, isVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Service statistics
    const totalServices = await Ad.countDocuments({ vendorId });
    const activeServices = await Ad.countDocuments({ vendorId });

    // Booking statistics
    const totalBookings = await EventPlan.countDocuments({
      "selectedVendors.vendorId": vendorId,
    });

    const confirmedBookings = await EventPlan.countDocuments({
      "selectedVendors.vendorId": vendorId,
      status: "Confirmed",
    });

    const completedBookings = await EventPlan.countDocuments({
      "selectedVendors.vendorId": vendorId,
      status: "Completed",
    });

    // Revenue statistics
    const revenueData = await EventPlan.aggregate([
      {
        $match: {
          "selectedVendors.vendorId": new mongoose.Types.ObjectId(vendorId),
          status: { $in: ["Confirmed", "Completed"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$selectedVendors",
                    cond: {
                      $eq: [
                        "$$this.vendorId",
                        new mongoose.Types.ObjectId(vendorId),
                      ],
                    },
                  },
                },
                initialValue: 0,
                in: { $add: ["$$value", "$$this.price"] },
              },
            },
          },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      services: {
        total: totalServices,
        active: activeServices,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        conversionRate:
          totalBookings > 0
            ? ((confirmedBookings / totalBookings) * 100).toFixed(2)
            : 0,
      },
      revenue: {
        total: totalRevenue,
        averagePerBooking:
          totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
