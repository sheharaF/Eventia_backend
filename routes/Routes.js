const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const serviceRoutes = require("./serviceRoutes");
const locationRoutes = require("./locationRoutes");
const adRoutes = require("./adRoutes");
const packageRoutes = require("./packageRoutes");
const eventPlanRoutes = require("./eventPlanRoutes");
const vendorRoutes = require("./vendorRoutes");
const testimonialRoutes = require("./testimonialRoutes");
const contactRoutes = require("./contactRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes); // Authentication routes under `/api/auth`
router.use("/admin", adminRoutes); // Admin routes under `/api/admin`
router.use("/services", serviceRoutes); // Service routes under `/api/services`
router.use("/locations", locationRoutes); // Location routes under `/api/locations`
router.use("/ads", adRoutes); // Ad routes under `/api/ads`
router.use("/packages", packageRoutes); // Package routes under `/api/packages`
router.use("/event-plans", eventPlanRoutes); // Event planning routes under `/api/event-plans`
router.use("/vendor", vendorRoutes); // Vendor dashboard routes under `/api/vendor`
router.use("/testimonials", testimonialRoutes); // Testimonial routes under `/api/testimonials`
router.use("/contact", contactRoutes); // Contact form routes under `/api/contact`
router.use("/user", userRoutes); // User routes under `/api/user`

module.exports = router;
