const express = require("express");
const User = require("../models/User");
const Ad = require("../models/Ads");
const EventPlan = require("../models/EventPlan");
const Testimonial = require("../models/Testimonial");
const Contact = require("../models/Contact");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const mongoose = require("mongoose"); // Added for system health metrics

const router = express.Router();

// Get admin dashboard overview
router.get("/dashboard", verifyToken, isAdmin, async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ role: "User" });
    const totalVendors = await User.countDocuments({ role: "Vendor" });
    const pendingVendors = await User.countDocuments({
      role: "Vendor",
      isApproved: false,
    });
    const approvedVendors = await User.countDocuments({
      role: "Vendor",
      isApproved: true,
    });

    // Service statistics
    const totalServices = await Ad.countDocuments();
    const totalEventPlans = await EventPlan.countDocuments();

    // Contact and testimonial statistics
    const newContacts = await Contact.countDocuments({ status: "New" });
    const pendingTestimonials = await Testimonial.countDocuments({
      isApproved: false,
    });

    // Recent activity
    const recentVendors = await User.find({ role: "Vendor" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email isApproved createdAt");

    const recentEventPlans = await EventPlan.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: {
        total: totalUsers,
        vendors: {
          total: totalVendors,
          pending: pendingVendors,
          approved: approvedVendors,
        },
      },
      services: {
        total: totalServices,
        eventPlans: totalEventPlans,
      },
      adminTasks: {
        newContacts,
        pendingTestimonials,
      },
      recentActivity: {
        vendors: recentVendors,
        eventPlans: recentEventPlans,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vendors with pagination and filters
router.get("/vendors", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: "Vendor" };

    if (status === "pending") {
      query.isApproved = false;
    } else if (status === "approved") {
      query.isApproved = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .select("-password");

    const total = await User.countDocuments(query);

    res.json({
      vendors,
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

// Approve or Reject a Vendor
router.put("/vendors/:id/approve", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approve, reason } = req.body;

    if (typeof approve === "undefined") {
      return res.status(400).json({ error: "'approve' boolean is required" });
    }

    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== "Vendor") {
      return res.status(404).json({ error: "Vendor not found" });
    }

    vendor.isApproved = !!approve;
    if (reason) vendor.approvalReason = reason;
    if (approve) vendor.approvedAt = new Date();
    await vendor.save();

    res.json({
      message: `Vendor ${approve ? "approved" : "rejected"}`,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        isApproved: vendor.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a Vendor account (safe delete)
router.delete("/vendors/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== "Vendor") {
      return res.status(404).json({ error: "Vendor not found" });
    }

    // Block deletion if vendor has services or referenced in event plans
    const hasServices = await Ad.exists({ vendorId: req.params.id });
    const referencedInPlans = await EventPlan.exists({
      $or: [
        { "selectedVendors.vendorId": req.params.id },
        { "selectedPackages.vendorId": req.params.id },
      ],
    });

    if (hasServices || referencedInPlans) {
      return res.status(400).json({
        error:
          "Cannot delete vendor with listings or bookings. Deactivate listings and resolve bookings first.",
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor details with services
router.get("/vendors/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).select("-password");
    if (!vendor || vendor.role !== "Vendor") {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const services = await Ad.find({ vendorId: req.params.id });
    const eventPlans = await EventPlan.find({
      "selectedVendors.vendorId": req.params.id,
    }).populate("userId", "name email");

    res.json({
      vendor,
      services,
      eventPlans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all event plans with pagination
router.get("/event-plans", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { eventType: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const eventPlans = await EventPlan.find(query)
      .populate("userId", "name email")
      .populate("selectedVendors.vendorId", "name email")
      .populate("selectedVendors.serviceId", "title description")
      .populate("selectedPackages.packageId", "title description")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await EventPlan.countDocuments(query);

    res.json({
      eventPlans,
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

// View all registered users (role: User)
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    const query = { role: "User" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .select("-password");

    const total = await User.countDocuments(query);

    res.json({
      users,
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

// Delete a User account (safe delete)
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "User") {
      return res.status(404).json({ error: "User not found" });
    }

    const hasEventPlans = await EventPlan.exists({ userId: req.params.id });
    if (hasEventPlans) {
      return res.status(400).json({
        error: "Cannot delete user with existing event plans/bookings",
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system statistics
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let startDate = new Date();
    if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // User registration stats
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Event plan stats
    const eventPlanStats = await EventPlan.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Service creation stats
    const serviceStats = await Ad.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.json({
      period,
      userRegistrations,
      eventPlanStats,
      serviceStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has active services or event plans
    const hasServices = await Ad.exists({ vendorId: req.params.id });
    const hasEventPlans = await EventPlan.exists({ userId: req.params.id });

    if (hasServices || hasEventPlans) {
      return res.status(400).json({
        error: "Cannot delete user with active services or event plans",
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all testimonials for admin review
router.get("/testimonials", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, vendorId } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status === "pending") {
      query.isApproved = false;
    } else if (status === "approved") {
      query.isApproved = true;
    }

    if (vendorId) {
      query.vendorId = vendorId;
    }

    const testimonials = await Testimonial.find(query)
      .populate("vendorId", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Testimonial.countDocuments(query);

    res.json({
      testimonials,
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

// Testimonial approval flow removed

// Get all services for admin review (existing services only)
router.get("/services", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, vendorId, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (vendorId) {
      query.vendorId = vendorId;
    }

    if (status) {
      query.status = status;
    }

    const services = await Ad.find(query)
      .populate("vendorId", "name email")
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

// Toggle service status (active/inactive) - only for existing services
router.put("/services/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const service = await Ad.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    service.isActive = active;
    await service.save();

    res.json({
      message: `Service ${active ? "activated" : "deactivated"}`,
      service,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system health and performance metrics
router.get("/system-health", verifyToken, isAdmin, async (req, res) => {
  try {
    // Database connection status
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Memory usage
    const memUsage = process.memoryUsage();

    // Uptime
    const uptime = process.uptime();

    // Active connections (if using connection pooling)
    const activeConnections =
      mongoose.connection.client?.topology?.s?.connections?.length || 0;

    res.json({
      database: {
        status: dbStatus,
        activeConnections,
      },
      server: {
        uptime: Math.floor(uptime),
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024) + " MB",
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + " MB",
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + " MB",
        },
        nodeVersion: process.version,
        platform: process.platform,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk vendor approval removed

// Package management for admin
const EventPackage = require("../models/EventPackage");

// Get all packages
router.get("/packages", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, vendorId, active } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (vendorId) query.vendorId = vendorId;
    if (active === "true") query.isActive = true;
    if (active === "false") query.isActive = false;

    const packages = await EventPackage.find(query)
      .populate("vendorId", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await EventPackage.countDocuments(query);
    res.json({
      packages,
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

// Toggle package active state
router.put("/packages/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const pkg = await EventPackage.findById(id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    pkg.isActive = !!active;
    await pkg.save();
    res.json({ message: `Package ${pkg.isActive ? "activated" : "deactivated"}`, package: pkg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
