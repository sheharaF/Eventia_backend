// createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Adjust the path to your User model

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "Sheharaf01@gmail.com",
      password: await bcrypt.hash("Sheharaf01@gmail.com", 10), // Hash the password
      role: "Admin",
      isApproved: true, // Admin is automatically approved
    });

    // Save the admin user
    await admin.save();
    console.log("Admin user created successfully!");

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

createAdmin();
