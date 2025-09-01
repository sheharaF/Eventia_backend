require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Ad = require("./models/Ads");
const Testimonial = require("./models/Testimonial");
const bcrypt = require("bcryptjs");

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected for Admin Data Population!"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Sample data for admin testing
const sampleVendors = [
  {
    name: "Wedding Wonders Photography",
    email: "photography@weddingwonders.com",
    password: "password123",
    role: "Vendor",
    isApproved: false, // Admin will approve this
    businessRegistration: "base64_encoded_document_1",
  },
  {
    name: "Elegant Events Catering",
    email: "catering@elegantevents.com",
    password: "password123",
    role: "Vendor",
    isApproved: true, // Already approved
    businessRegistration: "base64_encoded_document_2",
  },
  {
    name: "Dream Decorations",
    email: "decor@dreamdecorations.com",
    password: "password123",
    role: "Vendor",
    isApproved: false, // Admin will approve this
    businessRegistration: "base64_encoded_document_3",
  },
];

const sampleServices = [
  {
    title: "Wedding Photography Package",
    description:
      "Complete wedding photography coverage including engagement shoot",
    price: 2500,
    category: "Photography",
    eventType: "Wedding",
    isActive: true,
  },
  {
    title: "Corporate Event Catering",
    description: "Professional catering for corporate events and meetings",
    price: 45,
    category: "Catering",
    eventType: "Corporate",
    isActive: true,
  },
  {
    title: "Birthday Party Decorations",
    description: "Complete decoration setup for birthday celebrations",
    price: 800,
    category: "Decorations",
    eventType: "Birthday",
    isActive: false, // Admin can toggle this
  },
];

const sampleTestimonials = [
  {
    customerName: "Sarah Johnson",
    customerRole: "Bride",
    eventType: "Wedding",
    rating: 5,
    testimonial: "Amazing photography service! Our wedding photos are perfect.",
    isApproved: false, // Admin will approve this
  },
  {
    customerName: "Mike Chen",
    customerRole: "Event Organizer",
    eventType: "Corporate",
    rating: 4,
    testimonial:
      "Great catering service for our company event. Everyone loved the food!",
    isApproved: false, // Admin will approve this
  },
  {
    customerName: "Emily Davis",
    customerRole: "Mother",
    eventType: "Birthday",
    rating: 5,
    testimonial: "Beautiful decorations for my daughter's birthday party!",
    isApproved: false, // Admin will approve this
  },
];

// Populate database with sample data
const populateDatabase = async () => {
  try {
    console.log("🚀 Starting database population for admin testing...\n");

    // Create vendors
    console.log("📝 Creating sample vendors...");
    const createdVendors = [];
    for (const vendorData of sampleVendors) {
      try {
        // Check if vendor already exists
        let vendor = await User.findOne({ email: vendorData.email });
        if (!vendor) {
          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(vendorData.password, salt);

          // Create vendor
          vendor = new User({
            ...vendorData,
            password: hashedPassword,
          });
          await vendor.save();
          console.log(`✅ Created vendor: ${vendor.name}`);
        } else {
          console.log(`ℹ️  Vendor already exists: ${vendor.name}`);
        }
        createdVendors.push(vendor);
      } catch (error) {
        console.log(
          `❌ Error creating vendor ${vendorData.name}:`,
          error.message
        );
      }
    }

    // Create services (assign to vendors)
    console.log("\n📝 Creating sample services...");
    for (let i = 0; i < sampleServices.length; i++) {
      try {
        const serviceData = sampleServices[i];
        const vendor = createdVendors[i % createdVendors.length]; // Distribute services among vendors

        // Check if service already exists
        let service = await Ad.findOne({
          title: serviceData.title,
          vendorId: vendor._id,
        });

        if (!service) {
          service = new Ad({
            ...serviceData,
            vendorId: vendor._id,
          });
          await service.save();
          console.log(
            `✅ Created service: ${service.title} for ${vendor.name}`
          );
        } else {
          console.log(`ℹ️  Service already exists: ${service.title}`);
        }
      } catch (error) {
        console.log(
          `❌ Error creating service ${serviceData.title}:`,
          error.message
        );
      }
    }

    // Create testimonials
    console.log("\n📝 Creating sample testimonials...");
    for (let i = 0; i < sampleTestimonials.length; i++) {
      try {
        const testimonialData = sampleTestimonials[i];
        const vendor = createdVendors[i % createdVendors.length]; // Distribute testimonials among vendors

        // Check if testimonial already exists
        let testimonial = await Testimonial.findOne({
          customerName: testimonialData.customerName,
          vendorId: vendor._id,
        });

        if (!testimonial) {
          testimonial = new Testimonial({
            ...testimonialData,
            vendorId: vendor._id,
          });
          await testimonial.save();
          console.log(
            `✅ Created testimonial from ${testimonial.customerName} for ${vendor.name}`
          );
        } else {
          console.log(
            `ℹ️  Testimonial already exists from ${testimonialData.customerName}`
          );
        }
      } catch (error) {
        console.log(
          `❌ Error creating testimonial from ${testimonialData.customerName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Database population completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Vendors: ${createdVendors.length}`);
    console.log(`   - Services: ${sampleServices.length}`);
    console.log(`   - Testimonials: ${sampleTestimonials.length}`);
    console.log(
      "\n💡 Now you can run admin tests with existing data to manage!"
    );
    console.log("   Run: node admin-test.js");
  } catch (error) {
    console.error("❌ Error populating database:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase };
