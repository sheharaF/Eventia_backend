const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Register User or Vendor
router.post(
  "/register",
  upload.single("businessRegistration"),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      let newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });

      // If Vendor, store BR document and set approval to false
      if (role === "Vendor") {
        if (!req.file) {
          return res
            .status(400)
            .json({ error: "Business Registration document is required" });
        }
        newUser.businessRegistration = req.file.path;
        newUser.isApproved = false; // Needs admin approval
      }

      await newUser.save();
      res.status(201).json({
        message: "Registration successful! Awaiting approval if Vendor.",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // If Vendor, check approval status
    if (user.role === "Vendor" && !user.isApproved) {
      return res.status(403).json({ error: "Vendor approval pending" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
