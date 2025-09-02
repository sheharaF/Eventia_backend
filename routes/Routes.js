const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const vendorRoutes = require("./vendorRoutes");
const userRoutes = require("./userRoutes");
const serviceRoutes = require("./serviceRoutes");
const packageRoutes = require("./packageRoutes");
const eventServiceRoutes = require("./eventServiceRoutes");

const router = express.Router();

router.use("/auth", authRoutes); // Authentication routes under `/api/auth`
router.use("/admin", adminRoutes); // Admin routes under `/api/admin`
router.use("/vendor", vendorRoutes); // Vendor dashboard routes under `/api/vendor`
router.use("/user", userRoutes); // User routes under `/api/user`
router.use("/services", serviceRoutes); // Service routes under `/api/services`
router.use("/packages", packageRoutes); // Package routes under `/api/packages`
router.use("/event-services", eventServiceRoutes); // Required/optional services per event type

module.exports = router;
