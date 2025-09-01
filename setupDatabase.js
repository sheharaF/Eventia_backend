require("dotenv").config();
const mongoose = require("mongoose");
const Location = require("./models/Location");
const EventService = require("./models/EventService");
const EventPackage = require("./models/EventPackage");

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected for Database Setup!"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Sample data for locations
const locationData = [
  {
    district: "Western",
    cities: [
      "Colombo 01",
      "Colombo 02",
      "Colombo 03",
      "Colombo 04",
      "Colombo 05",
      "Colombo 06",
      "Colombo 07",
      "Colombo 08",
      "Colombo 09",
      "Colombo 10",
      "Colombo 11",
      "Colombo 12",
      "Colombo 13",
      "Colombo 14",
      "Colombo 15",
      "Dehiwala",
      "Mount Lavinia",
      "Moratuwa",
      "Panadura",
      "Kalutara",
      "Bandaragama",
      "Horana",
      "Ingiriya",
      "Matugama",
      "Agalawatta",
    ],
  },
  {
    district: "Central",
    cities: [
      "Kandy",
      "Peradeniya",
      "Gampola",
      "Nawalapitiya",
      "Tumkur",
      "Matale",
      "Dambulla",
      "Sigiriya",
      "Galewela",
      "Rattota",
      "Nuwara Eliya",
      "Hatton",
      "Talawakele",
      "Maskeliya",
      "Kotagala",
    ],
  },
  {
    district: "Southern",
    cities: [
      "Galle",
      "Ambalangoda",
      "Hikkaduwa",
      "Bentota",
      "Aluthgama",
      "Beruwala",
      "Kalutara",
      "Weligama",
      "Mirissa",
      "Matara",
      "Dikwella",
      "Tangalle",
      "Hambantota",
      "Tissamaharama",
      "Kataragama",
    ],
  },
  {
    district: "Eastern",
    cities: [
      "Batticaloa",
      "Kalkudah",
      "Passekudah",
      "Trincomalee",
      "Nilaveli",
      "Uppuveli",
      "Kantale",
      "Ampara",
      "Akkaraipattu",
      "Kalmunai",
    ],
  },
  {
    district: "Northern",
    cities: [
      "Jaffna",
      "Point Pedro",
      "Chavakachcheri",
      "Kilinochchi",
      "Mullaitivu",
      "Vavuniya",
      "Mannar",
      "Delft",
      "Kayts",
      "Karainagar",
    ],
  },
  {
    district: "North Western",
    cities: [
      "Kurunegala",
      "Polgahawela",
      "Alawwa",
      "Kuliyapitiya",
      "Nikaweratiya",
      "Puttalam",
      "Chilaw",
      "Wennappuwa",
      "Anamaduwa",
      "Nattandiya",
    ],
  },
  {
    district: "North Central",
    cities: [
      "Anuradhapura",
      "Kekirawa",
      "Medawachchiya",
      "Tambuttegama",
      "Kebithigollawa",
      "Polonnaruwa",
      "Kaduruwela",
      "Hingurakgoda",
      "Medirigiriya",
      "Lankathilaka",
    ],
  },
  {
    district: "Uva",
    cities: [
      "Badulla",
      "Bandarawela",
      "Haputale",
      "Welimada",
      "Passara",
      "Monaragala",
      "Bibile",
      "Wellawaya",
      "Kataragama",
      "Buttala",
    ],
  },
  {
    district: "Sabaragamuwa",
    cities: [
      "Ratnapura",
      "Embilipitiya",
      "Balangoda",
      "Pelmadulla",
      "Eheliyagoda",
      "Kegalle",
      "Mawanella",
      "Warakapola",
      "Rambukkana",
      "Galigamuwa",
    ],
  },
];

// Sample data for event services
const eventServiceData = [
  {
    eventType: "Wedding",
    description: "Complete wedding planning and coordination services",
    image: "wedding-service.jpg",
    serviceCategories: [
      {
        name: "Photography",
        status: "Required",
        description: "Professional wedding photography and videography",
        averagePrice: 25000,
      },
      {
        name: "Venue",
        status: "Required",
        description: "Wedding venue selection and booking",
        averagePrice: 100000,
      },
      {
        name: "Catering",
        status: "Required",
        description: "Wedding reception catering services",
        averagePrice: 1500,
      },
      {
        name: "Decoration",
        status: "Required",
        description: "Wedding venue decoration and floral arrangements",
        averagePrice: 50000,
      },
      {
        name: "Music",
        status: "Optional",
        description: "Live music or DJ services",
        averagePrice: 30000,
      },
      {
        name: "Transportation",
        status: "Optional",
        description: "Guest transportation services",
        averagePrice: 20000,
      },
    ],
  },
  {
    eventType: "Birthday",
    description: "Birthday party planning and celebration services",
    image: "birthday-service.jpg",
    serviceCategories: [
      {
        name: "Venue",
        status: "Required",
        description: "Birthday party venue",
        averagePrice: 15000,
      },
      {
        name: "Catering",
        status: "Required",
        description: "Birthday party food and beverages",
        averagePrice: 800,
      },
      {
        name: "Decoration",
        status: "Optional",
        description: "Party decoration and themes",
        averagePrice: 10000,
      },
      {
        name: "Entertainment",
        status: "Optional",
        description: "Games, activities, and entertainment",
        averagePrice: 15000,
      },
    ],
  },
  {
    eventType: "Corporate",
    description: "Corporate event planning and management services",
    image: "corporate-service.jpg",
    serviceCategories: [
      {
        name: "Venue",
        status: "Required",
        description: "Corporate event venue",
        averagePrice: 50000,
      },
      {
        name: "Catering",
        status: "Required",
        description: "Corporate event catering",
        averagePrice: 1200,
      },
      {
        name: "Audio Visual",
        status: "Required",
        description: "Sound systems, projectors, and technical equipment",
        averagePrice: 25000,
      },
      {
        name: "Decoration",
        status: "Optional",
        description: "Corporate event decoration",
        averagePrice: 20000,
      },
    ],
  },
  {
    eventType: "Anniversary",
    description: "Anniversary celebration planning services",
    image: "anniversary-service.jpg",
    serviceCategories: [
      {
        name: "Venue",
        status: "Required",
        description: "Anniversary celebration venue",
        averagePrice: 30000,
      },
      {
        name: "Catering",
        status: "Required",
        description: "Anniversary celebration catering",
        averagePrice: 1000,
      },
      {
        name: "Decoration",
        status: "Optional",
        description: "Anniversary celebration decoration",
        averagePrice: 25000,
      },
      {
        name: "Entertainment",
        status: "Optional",
        description: "Live music or entertainment",
        averagePrice: 20000,
      },
    ],
  },
];

// Sample data for event packages
const eventPackageData = [
  {
    title: "Basic Wedding Package",
    eventType: "Wedding",
    serviceCategory: "Complete Package",
    description:
      "Essential wedding services including venue, catering, and basic decoration",
    location: {
      city: "Colombo",
      district: "Western",
    },
    priceRange: {
      min: 150000,
      max: 250000,
    },
    capacity: 100,
    images: ["basic-wedding-1.jpg", "basic-wedding-2.jpg"],
  },
  {
    title: "Premium Wedding Package",
    eventType: "Wedding",
    serviceCategory: "Complete Package",
    description:
      "Luxury wedding package with premium services, photography, and full decoration",
    location: {
      city: "Colombo",
      district: "Western",
    },
    priceRange: {
      min: 300000,
      max: 500000,
    },
    capacity: 200,
    images: ["premium-wedding-1.jpg", "premium-wedding-2.jpg"],
  },
  {
    title: "Corporate Conference Package",
    eventType: "Corporate",
    serviceCategory: "Conference",
    description:
      "Complete corporate conference setup with audio-visual equipment and catering",
    location: {
      city: "Colombo",
      district: "Western",
    },
    priceRange: {
      min: 100000,
      max: 200000,
    },
    capacity: 150,
    images: ["corporate-1.jpg", "corporate-2.jpg"],
  },
  {
    title: "Birthday Party Package",
    eventType: "Birthday",
    serviceCategory: "Party",
    description:
      "Fun birthday party package with decoration, catering, and entertainment",
    location: {
      city: "Colombo",
      district: "Western",
    },
    priceRange: {
      min: 25000,
      max: 50000,
    },
    capacity: 50,
    images: ["birthday-1.jpg", "birthday-2.jpg"],
  },
];

// Function to setup database
async function setupDatabase() {
  try {
    console.log("🚀 Starting database setup...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Location.deleteMany({});
    await EventService.deleteMany({});
    await EventPackage.deleteMany({});

    // Insert locations
    console.log("📍 Inserting locations...");
    const locations = await Location.insertMany(locationData);
    console.log(`✅ Inserted ${locations.length} locations`);

    // Insert event services
    console.log("🎭 Inserting event services...");
    const eventServices = await EventService.insertMany(eventServiceData);
    console.log(`✅ Inserted ${eventServices.length} event services`);

    // Insert event packages
    console.log("📦 Inserting event packages...");
    const eventPackages = await EventPackage.insertMany(eventPackageData);
    console.log(`✅ Inserted ${eventPackages.length} event packages`);

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • Locations: ${locations.length}`);
    console.log(`   • Event Services: ${eventServices.length}`);
    console.log(`   • Event Packages: ${eventPackages.length}`);

    console.log("\n🔍 Sample data created:");
    console.log(
      "   • Districts: Western, Central, Southern, Eastern, Northern, etc."
    );
    console.log("   • Event Types: Wedding, Birthday, Corporate, Anniversary");
    console.log(
      "   • Service Categories: Photography, Venue, Catering, Decoration, etc."
    );

    console.log("\n💡 Next steps:");
    console.log("   1. Start your server: npm start");
    console.log("   2. Test the API endpoints");
    console.log("   3. Create users and vendors");
    console.log("   4. Test event planning functionality");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

// Run the setup
setupDatabase();
