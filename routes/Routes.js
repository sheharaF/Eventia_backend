const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const serviceRoutes = require("./serviceRoutes");
const locationRoutes = require("./locationRoutes");
const adRoutes = require("./adRoutes");

const router = express.Router();

router.use("/auth", authRoutes); // Authentication routes under `/api/auth`
router.use("/admin", adminRoutes); // Admin routes under `/api/admin`
router.use("/services", serviceRoutes); // Service routes under `/api/services`
router.use("/locations", locationRoutes); // Location routes under `/api/locations`
router.use("/ads", adRoutes); // Ad routes under `/api/ads`

module.exports = router;
