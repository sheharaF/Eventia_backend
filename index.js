require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

// Serve uploaded images statically
const path = require("path");
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// MongoDB Cloud Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Atlas Connected Successfully!"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Eventia Backend is Running with Cloud DB!");
});

// Import Routes
const routes = require("./routes/Routes");
const googleAuthRoutes = require("./googleAuth");

// Use Routes
app.use("/api", routes); // All routes under `/api`
app.use("/api/google", googleAuthRoutes); // Google Auth under `/api/google`

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
