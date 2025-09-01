const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Public route - Submit contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      status: "New",
    });

    const savedContact = await newContact.save();

    res.status(201).json({
      message:
        "Contact form submitted successfully. We'll get back to you soon!",
      contactId: savedContact._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
// Get all contact submissions (admin only)
router.get("/admin/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const contacts = await Contact.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
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

// Get specific contact submission (admin only)
router.get("/admin/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact submission not found" });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact status (admin only)
router.put("/admin/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact submission not found" });
    }

    contact.status = status;
    if (adminNotes) {
      contact.adminNotes = adminNotes;
    }

    await contact.save();

    res.json({
      message: "Contact status updated successfully",
      contact,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add admin notes to contact (admin only)
router.put("/admin/:id/notes", verifyToken, isAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact submission not found" });
    }

    contact.adminNotes = adminNotes;
    await contact.save();

    res.json({
      message: "Admin notes added successfully",
      contact,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact submission (admin only)
router.delete("/admin/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact submission not found" });
    }

    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Contact submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contact statistics (admin only)
router.get("/admin/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: "New" });
    const inProgressContacts = await Contact.countDocuments({
      status: "In Progress",
    });
    const resolvedContacts = await Contact.countDocuments({
      status: "Resolved",
    });
    const closedContacts = await Contact.countDocuments({ status: "Closed" });

    // Get contacts by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
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
      total: totalContacts,
      byStatus: {
        new: newContacts,
        inProgress: inProgressContacts,
        resolved: resolvedContacts,
        closed: closedContacts,
      },
      monthlyStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
