const express = require("express");
const { verifyToken, isUser } = require("../middleware/authMiddleware");
const Ad = require("../models/Ads");
const EventPackage = require("../models/EventPackage");
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

// Browse vendor services with filtering
router.get("/services", async (req, res) => {
  try {
    const {
      eventType,
      serviceCategory,
      minPrice,
      maxPrice,
      location,
      date,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (page - 1) * limit;
    let filters = {};

    // Event type filter
    if (eventType) {
      filters.eventType = { $regex: new RegExp(eventType, "i") };
    }

    // Service category filter
    if (serviceCategory) {
      const categories = serviceCategory.split(",").map((cat) => cat.trim());
      filters.serviceCategory = {
        $in: categories.map((cat) => new RegExp(cat, "i")),
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    // Location filter
    if (location) {
      filters.$or = [
        { "location.city": { $regex: new RegExp(location, "i") } },
        { "location.district": { $regex: new RegExp(location, "i") } },
      ];
    }

    // Date availability filter (if service has date restrictions)
    if (date) {
      filters.$or = [
        { availableDates: { $exists: false } }, // No date restrictions
        { availableDates: { $in: [new Date(date)] } },
      ];
    }

    const services = await Ad.find(filters)
      .populate("vendorId", "name email phone isApproved")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Ad.countDocuments(filters);

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
    console.error("Services search error:", error);
    res.status(500).json({ error: "Failed to search services" });
  }
});

// Browse event packages with filtering
router.get("/packages", async (req, res) => {
  try {
    const {
      eventType,
      minPrice,
      maxPrice,
      location,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (page - 1) * limit;
    let filters = {};

    // Event type filter
    if (eventType) {
      filters.eventType = { $regex: new RegExp(eventType, "i") };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    // Location filter
    if (location) {
      filters.$or = [
        { "location.city": { $regex: new RegExp(location, "i") } },
        { "location.district": { $regex: new RegExp(location, "i") } },
      ];
    }

    const packages = await EventPackage.find(filters)
      .populate("vendorId", "name email phone isApproved")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await EventPackage.countDocuments(filters);

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
    console.error("Packages search error:", error);
    res.status(500).json({ error: "Failed to search packages" });
  }
});

// Get user's cart (current event plan in planning stage)
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
      return res.json({ cart: null, message: "No active cart found" });
    }

    // Calculate total cost
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
      },
      summary: {
        vendorCount: cart.selectedVendors.length,
        packageCount: cart.selectedPackages.length,
        totalCost,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add service to cart
router.post("/cart/services", verifyToken, isUser, async (req, res) => {
  try {
    const { serviceId, vendorId, price, quantity = 1 } = req.body;

    if (!serviceId || !vendorId || !price) {
      return res.status(400).json({
        error: "serviceId, vendorId, and price are required",
      });
    }

    // Validate service exists and is active and belongs to vendor
    const service = await Ad.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(400).json({ error: "Service unavailable" });
    }
    if (service.vendorId.toString() !== vendorId) {
      return res.status(400).json({ error: "Service/vendor mismatch" });
    }

    // Find or create cart
    let cart = await EventPlan.findOne({
      userId: req.user.id,
      status: "Planning",
    });

    if (!cart) {
      cart = new EventPlan({
        userId: req.user.id,
        status: "Planning",
        selectedVendors: [],
        selectedPackages: [],
      });
    }

    // Check if service already exists in cart
    const existingServiceIndex = cart.selectedVendors.findIndex(
      (item) =>
        item.serviceId.toString() === serviceId &&
        item.vendorId.toString() === vendorId
    );

    if (existingServiceIndex >= 0) {
      // Update quantity
      cart.selectedVendors[existingServiceIndex].quantity += quantity;
    } else {
      // Add new service
      cart.selectedVendors.push({
        serviceId,
        vendorId,
        price: parseFloat(price),
        quantity,
      });
    }

    await cart.save();

    res.json({
      message: "Service added to cart successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Failed to add service to cart" });
  }
});

// Add package to cart
router.post("/cart/packages", verifyToken, isUser, async (req, res) => {
  try {
    const { packageId, vendorId, price, quantity = 1 } = req.body;

    if (!packageId || !vendorId || !price) {
      return res.status(400).json({
        error: "packageId, vendorId, and price are required",
      });
    }

    // Validate package exists and is active and belongs to vendor
    const pkg = await EventPackage.findById(packageId);
    if (!pkg || !pkg.isActive) {
      return res.status(400).json({ error: "Package unavailable" });
    }
    if (pkg.vendorId.toString() !== vendorId) {
      return res.status(400).json({ error: "Package/vendor mismatch" });
    }

    // Find or create cart
    let cart = await EventPlan.findOne({
      userId: req.user.id,
      status: "Planning",
    });

    if (!cart) {
      cart = new EventPlan({
        userId: req.user.id,
        status: "Planning",
        selectedVendors: [],
        selectedPackages: [],
      });
    }

    // Check if package already exists in cart
    const existingPackageIndex = cart.selectedPackages.findIndex(
      (item) =>
        item.packageId.toString() === packageId &&
        item.vendorId.toString() === vendorId
    );

    if (existingPackageIndex >= 0) {
      // Update quantity
      cart.selectedPackages[existingPackageIndex].quantity += quantity;
    } else {
      // Add new package
      cart.selectedPackages.push({
        packageId,
        vendorId,
        price: parseFloat(price),
        quantity,
      });
    }

    await cart.save();

    res.json({
      message: "Package added to cart successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Add package to cart error:", error);
    res.status(500).json({ error: "Failed to add package to cart" });
  }
});

// Get current cart
router.get("/cart", verifyToken, isUser, async (req, res) => {
  try {
    const cart = await EventPlan.findOne({
      userId: req.user.id,
      status: "Planning",
    })
      .populate("selectedVendors.vendorId", "name email phone")
      .populate("selectedVendors.serviceId", "title description serviceCategory images priceRange")
      .populate("selectedPackages.vendorId", "name email phone")
      .populate("selectedPackages.packageId", "title description price services images");

    if (!cart) {
      return res.json({
        message: "Cart is empty",
        cart: {
          userId: req.user.id,
          status: "Planning",
          selectedVendors: [],
          selectedPackages: [],
          totalCost: 0,
        },
      });
    }

    const totalCost =
      cart.selectedVendors.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      ) +
      cart.selectedPackages.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      );

    res.json({ cart: { ...cart.toObject(), totalCost } });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Remove service from cart
router.delete(
  "/cart/services/:serviceId",
  verifyToken,
  isUser,
  async (req, res) => {
    try {
      const { serviceId } = req.params;
      const { vendorId } = req.query;

      if (!vendorId) {
        return res.status(400).json({ error: "vendorId is required" });
      }

      const cart = await EventPlan.findOne({
        userId: req.user.id,
        status: "Planning",
      });

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      cart.selectedVendors = cart.selectedVendors.filter(
        (item) =>
          !(
            item.serviceId.toString() === serviceId &&
            item.vendorId.toString() === vendorId
          )
      );

      await cart.save();

      res.json({
        message: "Service removed from cart successfully",
        cart: cart,
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ error: "Failed to remove service from cart" });
    }
  }
);

// Remove package from cart
router.delete(
  "/cart/packages/:packageId",
  verifyToken,
  isUser,
  async (req, res) => {
    try {
      const { packageId } = req.params;
      const { vendorId } = req.query;

      if (!vendorId) {
        return res.status(400).json({ error: "vendorId is required" });
      }

      const cart = await EventPlan.findOne({
        userId: req.user.id,
        status: "Planning",
      });

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      cart.selectedPackages = cart.selectedPackages.filter(
        (item) =>
          !(
            item.packageId.toString() === packageId &&
            item.vendorId.toString() === vendorId
          )
      );

      await cart.save();

      res.json({
        message: "Package removed from cart successfully",
        cart: cart,
      });
    } catch (error) {
      console.error("Remove package from cart error:", error);
      res.status(500).json({ error: "Failed to remove package from cart" });
    }
  }
);

// Checkout/Confirm booking
router.post("/cart/checkout", verifyToken, isUser, async (req, res) => {
  try {
    const allowedEventTypes = [
      "Wedding",
      "Birthday",
      "Corporate",
      "Anniversary",
      "Other",
    ];

    const {
      eventType,
      budget,
      guestCount,
      preferredLocation,
      eventDate,
      notes,
    } = req.body || {};

    // Basic validation before any DB operations
    if (!eventType || !allowedEventTypes.includes(eventType)) {
      return res.status(400).json({
        error:
          "Invalid eventType. Allowed: Wedding, Birthday, Corporate, Anniversary, Other",
      });
    }

    const parsedBudget = Number(budget);
    const parsedGuests = Number(guestCount);
    if (!parsedBudget || parsedBudget <= 0) {
      return res.status(400).json({ error: "budget must be a positive number" });
    }
    if (!parsedGuests || parsedGuests <= 0) {
      return res.status(400).json({ error: "guestCount must be a positive number" });
    }

    if (
      !preferredLocation ||
      typeof preferredLocation !== "object" ||
      !preferredLocation.city ||
      !preferredLocation.district
    ) {
      return res.status(400).json({
        error: "preferredLocation.city and preferredLocation.district are required",
      });
    }

    const parsedDate = new Date(eventDate);
    if (!eventDate || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "eventDate must be a valid date" });
    }

    // Find user's cart
    const cart = await EventPlan.findOne({
      userId: req.user.id,
      status: "Planning",
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart is empty" });
    }

    if (
      (!cart.selectedVendors || cart.selectedVendors.length === 0) &&
      (!cart.selectedPackages || cart.selectedPackages.length === 0)
    ) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Update cart with event details and confirm booking
    cart.eventType = eventType;
    cart.budget = parsedBudget;
    cart.guestCount = parsedGuests;
    cart.preferredLocation = {
      city: String(preferredLocation.city),
      district: String(preferredLocation.district),
    };
    cart.eventDate = parsedDate;
    cart.notes = notes;
    cart.status = "Confirmed";
    cart.totalCost =
      (cart.selectedVendors || []).reduce(
        (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
        0
      ) +
      (cart.selectedPackages || []).reduce(
        (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
        0
      );

    await cart.save();

    res.json({
      message: "Booking confirmed successfully!",
      booking: cart,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    // Surface validation errors as 400 instead of 500
    if (error?.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to confirm booking" });
  }
});

// View user's confirmed bookings
router.get("/bookings", verifyToken, isUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bookings = await EventPlan.find({
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

    const total = await EventPlan.countDocuments({
      userId: req.user.id,
      status: { $in: ["Confirmed", "Completed", "Cancelled"] },
    });

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

module.exports = router;
