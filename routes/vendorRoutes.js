const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Ad = require("../models/Ads");
const EventPackage = require("../models/EventPackage");
const EventPlan = require("../models/EventPlan");
const User = require("../models/User");
const { verifyToken, isVendor } = require("../middleware/authMiddleware");

// Get vendor dashboard overview
router.get("/dashboard", verifyToken, isVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get vendor's services and packages
    const services = await Ad.find({ vendorId }).sort({ createdAt: -1 });
    const packages = await EventPackage.find({ vendorId }).sort({
      createdAt: -1,
    });

    // Get total earnings (from event plans that include this vendor)
    const eventPlans = await EventPlan.find({
      $or: [
        { "selectedVendors.vendorId": vendorId },
        { "selectedPackages.vendorId": vendorId },
      ],
      status: { $in: ["Confirmed", "Completed"] },
    });

    const totalEarnings = eventPlans.reduce((sum, plan) => {
      let planEarnings = 0;

      // Calculate earnings from services
      const vendorServices = plan.selectedVendors.filter(
        (v) => v.vendorId.toString() === vendorId
      );
      planEarnings += vendorServices.reduce(
        (s, service) => s + service.price * (service.quantity || 1),
        0
      );

      // Calculate earnings from packages
      const vendorPackages = plan.selectedPackages.filter(
        (p) => p.vendorId.toString() === vendorId
      );
      planEarnings += vendorPackages.reduce(
        (s, pkg) => s + pkg.price * (pkg.quantity || 1),
        0
      );

      return sum + planEarnings;
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
      packages: {
        total: packages.length,
        list: packages.slice(0, 5), // Show latest 5
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

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for saving images on backend
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    const safeName = file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  },
});

const upload = multer({ storage });

// Helper to parse possibly-stringified JSON fields from multipart
function parseMaybeJSON(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_) {
      return value;
    }
  }
  return value;
}

// Post service or package (combined form) with image upload
router.post("/post", verifyToken, isVendor, upload.array("images", 10), async (req, res) => {
  try {
    // Pull scalar fields
    const type = req.body.type;
    const title = req.body.title;
    const description = req.body.description;
    const eventType = req.body.eventType;
    const isActive = req.body.isActive !== undefined ? req.body.isActive === "true" || req.body.isActive === true : true;

    // Parse complex fields (may arrive as JSON strings)
    const serviceCategory = req.body.serviceCategory;
    const services = parseMaybeJSON(req.body.services);
    const location = parseMaybeJSON(req.body.location);
    const capacity = parseMaybeJSON(req.body.capacity);
    const availableDates = parseMaybeJSON(req.body.availableDates);

    // Build image paths from uploaded files
    const uploadedImages = (req.files || []).map((f) => path.posix.join("/uploads", path.basename(f.path)));

    // ✅ Validation
    if (!type || !title || !description || !eventType) {
      return res.status(400).json({
        error: "type, title, description, and eventType are required",
      });
    }

    if (type === "service") {
      if (!serviceCategory) {
        return res.status(400).json({
          error: "serviceCategory is required for services",
        });
      }

      // Expect priceRange from body
      const priceRangeRaw = parseMaybeJSON(req.body.priceRange);
      if (!priceRangeRaw || priceRangeRaw.min === undefined || priceRangeRaw.max === undefined) {
        return res.status(400).json({
          error: "priceRange.min and priceRange.max are required for services",
        });
      }
      if (!uploadedImages.length) {
        return res.status(400).json({ error: "At least one image is required" });
      }
      const newService = new Ad({
        title,
        description,
        eventType,
        serviceCategory,
        priceRange: {
          min: parseFloat(priceRangeRaw.min),
          max: parseFloat(priceRangeRaw.max),
        },
        location,
        capacity,
        availableDates,
        images: uploadedImages,
        isActive,
        vendorId: req.user.id,
      });

      const savedService = await newService.save();
      return res.status(201).json({
        message: "Service posted successfully",
        service: savedService,
      });
    }

    if (type === "package") {
      if (!req.body.price) {
        return res.status(400).json({
          error: "price is required for packages",
        });
      }
      if (!services || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({
          error: "services array is required for packages",
        });
      }
      if (!uploadedImages.length) {
        return res.status(400).json({ error: "At least one image is required" });
      }

      const newPackage = new EventPackage({
        title,
        description,
        eventType,
        price: parseFloat(req.body.price),
        services,
        location,
        capacity,
        availableDates,
        images: uploadedImages,
        isActive,
        vendorId: req.user.id,
      });

      const savedPackage = await newPackage.save();
      return res.status(201).json({
        message: "Package posted successfully",
        package: savedPackage,
      });
    }

    return res.status(400).json({
      error: "type must be either 'service' or 'package'",
    });
  } catch (error) {
    console.error("Post service/package error:", error);
    res.status(500).json({ error: "Failed to post service/package" });
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
        totalCount: total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor's packages with pagination
router.get("/packages", verifyToken, isVendor, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = { vendorId: req.user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
      ];
    }

    const packages = await EventPackage.find(query)
      .populate("services", "title description price")
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
        totalCount: total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update service
router.put("/services/:id", verifyToken, isVendor, async (req, res) => {
  try {
    const service = await Ad.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Check if the user owns this service
    if (service.vendorId.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. You can only update your own services",
      });
    }

    const updatedService = await Ad.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update package
router.put("/packages/:id", verifyToken, isVendor, async (req, res) => {
  try {
    const package = await EventPackage.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ error: "Package not found" });
    }

    // Check if the user owns this package
    if (package.vendorId.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. You can only update your own packages",
      });
    }

    const updatedPackage = await EventPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Package updated successfully",
      package: updatedPackage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete service
router.delete("/services/:id", verifyToken, isVendor, async (req, res) => {
  try {
    const service = await Ad.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Check if the user owns this service
    if (service.vendorId.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. You can only delete your own services",
      });
    }

    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete package
router.delete("/packages/:id", verifyToken, isVendor, async (req, res) => {
  try {
    const package = await EventPackage.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ error: "Package not found" });
    }

    // Check if the user owns this package
    if (package.vendorId.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. You can only delete your own packages",
      });
    }

    await EventPackage.findByIdAndDelete(req.params.id);
    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor's bookings
router.get("/bookings", verifyToken, isVendor, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { "selectedVendors.vendorId": req.user.id },
        { "selectedPackages.vendorId": req.user.id },
      ],
    };

    if (status) {
      query.status = status;
    }

    const bookings = await EventPlan.find(query)
      .populate("userId", "name email")
      .populate("selectedVendors.serviceId", "title description")
      .populate("selectedPackages.packageId", "title description")
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
        totalCount: total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vendor profile
router.put("/profile", verifyToken, isVendor, async (req, res) => {
  try {
    const { name, phone, address, businessRegistration } = req.body;
    const updateData = {};

    if (name?.trim()) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (businessRegistration)
      updateData.businessRegistration = businessRegistration;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No valid fields provided for update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || null,
        address: updatedUser.address || null,
        isApproved: updatedUser.isApproved,
        businessRegistration: updatedUser.businessRegistration,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
