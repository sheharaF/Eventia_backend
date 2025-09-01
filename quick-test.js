require("dotenv").config();
const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:5000/api";
let userToken = "";
let vendorToken = "";
let adminToken = "";
let eventPlanId = "";
let serviceId = "";

// Test data
const testUser = {
  name: "Test User",
  email: "testuser@example.com",
  password: "password123",
  role: "User",
};

const testVendor = {
  name: "Test Vendor",
  email: "testvendor@example.com",
  password: "password123",
  role: "Vendor",
  businessRegistration: "base64_encoded_document_here",
};

const testEventPlan = {
  eventType: "Wedding",
  budget: 50000,
  guestCount: 150,
  preferredLocation: {
    city: "Colombo",
    district: "Western",
  },
  eventDate: "2024-12-25T00:00:00.000Z",
  notes: "Test wedding event",
};

const testService = {
  title: "Test Photography Service",
  description: "Test photography service for weddings",
  eventType: "Wedding",
  serviceCategory: "Photography",
  location: {
    city: "Colombo",
    district: "Western",
  },
  priceRange: {
    min: 15000,
    max: 50000,
  },
  capacity: 200,
  images: ["test1.jpg", "test2.jpg"],
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

// Test functions
const testServerHealth = async () => {
  console.log("🏥 Testing server health...");
  try {
    const response = await axios.get("http://localhost:5000/");
    if (response.data === "Eventia Backend is Running with Cloud DB!") {
      console.log("✅ Server is running");
      return true;
    } else {
      console.log("❌ Server response unexpected");
      return false;
    }
  } catch (error) {
    console.log("❌ Server is not running");
    return false;
  }
};

const testUserRegistration = async () => {
  console.log("👤 Testing user registration...");
  const result = await makeRequest("POST", "/auth/register", testUser);

  if (result.success) {
    console.log("✅ User registered successfully");
    userToken = result.data.token;
    return true;
  } else {
    console.log("❌ User registration failed:", result.error);
    return false;
  }
};

const testUserLogin = async () => {
  console.log("🔑 Testing user login...");
  const result = await makeRequest("POST", "/auth/login", {
    email: testUser.email,
    password: testUser.password,
  });

  if (result.success) {
    console.log("✅ User login successful");
    userToken = result.data.token;
    return true;
  } else {
    console.log("❌ User login failed:", result.error);
    return false;
  }
};

const testVendorRegistration = async () => {
  console.log("🏢 Testing vendor registration...");
  const result = await makeRequest("POST", "/auth/register", testVendor);

  if (result.success) {
    console.log("✅ Vendor registered successfully");
    vendorToken = result.data.token;
    return true;
  } else {
    console.log("❌ Vendor registration failed:", result.error);
    return false;
  }
};

const testEventPlanCreation = async () => {
  console.log("📅 Testing event plan creation...");
  const result = await makeRequest(
    "POST",
    "/event-plans",
    testEventPlan,
    userToken
  );

  if (result.success) {
    console.log("✅ Event plan created successfully");
    eventPlanId = result.data._id;
    return true;
  } else {
    console.log("❌ Event plan creation failed:", result.error);
    return false;
  }
};

const testServiceCreation = async () => {
  console.log("🛍️ Testing service creation...");
  const result = await makeRequest("POST", "/ads", testService, vendorToken);

  if (result.success) {
    console.log("✅ Service created successfully");
    serviceId = result.data._id;
    return true;
  } else {
    console.log("❌ Service creation failed:", result.error);
    return false;
  }
};

const testGetEventPlans = async () => {
  console.log("📋 Testing get event plans...");
  const result = await makeRequest(
    "GET",
    "/event-plans/my-plans",
    null,
    userToken
  );

  if (result.success) {
    console.log("✅ Event plans retrieved successfully");
    return true;
  } else {
    console.log("❌ Get event plans failed:", result.error);
    return false;
  }
};

const testGetServices = async () => {
  console.log("🔍 Testing get services...");
  const result = await makeRequest("GET", "/ads", null);

  if (result.success) {
    console.log("✅ Services retrieved successfully");
    return true;
  } else {
    console.log("❌ Get services failed:", result.error);
    return false;
  }
};

const testGetLocations = async () => {
  console.log("📍 Testing get locations...");
  const result = await makeRequest("GET", "/locations", null);

  if (result.success) {
    console.log("✅ Locations retrieved successfully");
    return true;
  } else {
    console.log("❌ Get locations failed:", result.error);
    return false;
  }
};

const testGetEventTypes = async () => {
  console.log("🎭 Testing get event types...");
  const result = await makeRequest("GET", "/services", null);

  if (result.success) {
    console.log("✅ Event types retrieved successfully");
    return true;
  } else {
    console.log("❌ Get event types failed:", result.error);
    return false;
  }
};

const testContactForm = async () => {
  console.log("📞 Testing contact form...");
  const result = await makeRequest("POST", "/contact", {
    name: "Test Contact",
    email: "contact@example.com",
    subject: "Test Inquiry",
    message: "This is a test contact form submission",
  });

  if (result.success) {
    console.log("✅ Contact form submitted successfully");
    return true;
  } else {
    console.log("❌ Contact form submission failed:", result.error);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log("🚀 Starting Eventia Backend Quick Tests...\n");

  const tests = [
    { name: "Server Health", fn: testServerHealth },
    { name: "User Registration", fn: testUserRegistration },
    { name: "User Login", fn: testUserLogin },
    { name: "Vendor Registration", fn: testVendorRegistration },
    { name: "Event Plan Creation", fn: testEventPlanCreation },
    { name: "Service Creation", fn: testServiceCreation },
    { name: "Get Event Plans", fn: testGetEventPlans },
    { name: "Get Services", fn: testGetServices },
    { name: "Get Locations", fn: testGetLocations },
    { name: "Get Event Types", fn: testGetEventTypes },
    { name: "Contact Form", fn: testContactForm },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎯 TEST RESULTS SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${tests.length}`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Your backend is working perfectly!");
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check the errors above.`);
  }

  console.log("\n💡 Next steps:");
  console.log("   1. Check the detailed API documentation");
  console.log("   2. Test admin functionality manually");
  console.log("   3. Test vendor approval workflow");
  console.log("   4. Integrate with your frontend");
};

// Check if axios is installed
try {
  require("axios");
} catch (error) {
  console.log("❌ Axios is not installed. Please run:");
  console.log("   npm install axios");
  process.exit(1);
}

// Run tests
runTests().catch(console.error);
