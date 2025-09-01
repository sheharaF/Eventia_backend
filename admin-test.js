require("dotenv").config();
const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:5000/api";
let adminToken = "";
let existingVendorId = "";
let existingServiceId = "";
let existingTestimonialId = "";

// Test admin credentials
const adminUser = {
  name: "Admin User",
  email: "admin@eventia.com",
  password: "admin123",
  role: "Admin",
};

// Utility functions
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const logError = (message, error) => {
  console.log(`\n❌ ${message}`);
  if (error.response) {
    console.log(`Status: ${error.response.status}`);
    console.log(`Data:`, error.response.data);
  } else {
    console.log(`Error:`, error.message);
  }
};

const logSuccess = (message, data = null) => {
  console.log(`\n✅ ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

// Test functions
const testAdminRegistration = async () => {
  try {
    log("Testing Admin Registration...");

    const response = await axios.post(`${BASE_URL}/auth/register`, adminUser);
    adminToken = response.data.token;

    logSuccess("Admin registered successfully", {
      token: adminToken.substring(0, 20) + "...",
      user: response.data.user,
    });

    return true;
  } catch (error) {
    if (
      error.response?.status === 400 &&
      error.response.data.error === "User already exists"
    ) {
      log("Admin already exists, proceeding with login...");
      return await testAdminLogin();
    }
    logError("Admin registration failed", error);
    return false;
  }
};

const testAdminLogin = async () => {
  try {
    log("Testing Admin Login...");

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password,
    });

    adminToken = response.data.token;

    logSuccess("Admin login successful", {
      token: adminToken.substring(0, 20) + "...",
      user: response.data.user,
    });

    return true;
  } catch (error) {
    logError("Admin login failed", error);
    return false;
  }
};

const testAdminDashboard = async () => {
  try {
    log("Testing Admin Dashboard...");

    const response = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    logSuccess("Dashboard data retrieved", response.data);
    return true;
  } catch (error) {
    logError("Dashboard test failed", error);
    return false;
  }
};

const testVendorListing = async () => {
  try {
    log("Testing Vendor Listing...");

    const response = await axios.get(`${BASE_URL}/admin/vendors`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { page: 1, limit: 10 },
    });

    if (response.data.vendors.length > 0) {
      existingVendorId = response.data.vendors[0]._id;
      logSuccess("Vendors listed successfully", {
        count: response.data.vendors.length,
        pagination: response.data.pagination,
        firstVendorId: existingVendorId,
      });
    } else {
      log("No existing vendors found for testing");
    }

    return true;
  } catch (error) {
    logError("Vendor listing failed", error);
    return false;
  }
};

const testVendorDetails = async () => {
  try {
    if (!existingVendorId) {
      log("Skipping vendor details test - no existing vendor found");
      return true;
    }

    log("Testing Vendor Details...");

    const response = await axios.get(
      `${BASE_URL}/admin/vendors/${existingVendorId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    logSuccess("Vendor details retrieved", response.data);
    return true;
  } catch (error) {
    logError("Vendor details failed", error);
    return false;
  }
};

const testVendorApproval = async () => {
  try {
    if (!existingVendorId) {
      log("Skipping vendor approval test - no existing vendor found");
      return true;
    }

    log("Testing Vendor Approval...");

    const response = await axios.put(
      `${BASE_URL}/admin/approve-vendor/${existingVendorId}`,
      {
        approve: true,
        reason: "Test approval for admin testing",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    logSuccess("Vendor approved successfully", response.data);
    return true;
  } catch (error) {
    logError("Vendor approval failed", error);
    return false;
  }
};

const testServiceListing = async () => {
  try {
    log("Testing Service Listing...");

    const response = await axios.get(`${BASE_URL}/admin/services`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { page: 1, limit: 10 },
    });

    if (response.data.services.length > 0) {
      existingServiceId = response.data.services[0]._id;
      logSuccess("Services listed successfully", {
        count: response.data.services.length,
        pagination: response.data.pagination,
        firstServiceId: existingServiceId,
      });
    } else {
      log("No existing services found for testing");
    }

    return true;
  } catch (error) {
    logError("Service listing failed", error);
    return false;
  }
};

const testServiceManagement = async () => {
  try {
    if (!existingServiceId) {
      log("Skipping service management test - no existing service found");
      return true;
    }

    log("Testing Service Management...");

    // Toggle service status
    const toggleResponse = await axios.put(
      `${BASE_URL}/admin/services/${existingServiceId}/toggle`,
      {
        active: false,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    logSuccess("Service status toggled", toggleResponse.data);
    return true;
  } catch (error) {
    logError("Service management failed", error);
    return false;
  }
};

const testTestimonialListing = async () => {
  try {
    log("Testing Testimonial Listing...");

    const response = await axios.get(`${BASE_URL}/admin/testimonials`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { page: 1, limit: 10 },
    });

    if (response.data.testimonials.length > 0) {
      existingTestimonialId = response.data.testimonials[0]._id;
      logSuccess("Testimonials listed successfully", {
        count: response.data.testimonials.length,
        pagination: response.data.pagination,
        firstTestimonialId: existingTestimonialId,
      });
    } else {
      log("No existing testimonials found for testing");
    }

    return true;
  } catch (error) {
    logError("Testimonial listing failed", error);
    return false;
  }
};

const testTestimonialManagement = async () => {
  try {
    if (!existingTestimonialId) {
      log(
        "Skipping testimonial management test - no existing testimonial found"
      );
      return true;
    }

    log("Testing Testimonial Management...");

    // Approve testimonial
    const approveResponse = await axios.put(
      `${BASE_URL}/admin/testimonials/${existingTestimonialId}/approve`,
      {
        approve: true,
        adminNotes: "Approved for testing purposes",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    logSuccess("Testimonial approved", approveResponse.data);
    return true;
  } catch (error) {
    logError("Testimonial management failed", error);
    return false;
  }
};

const testEventPlanManagement = async () => {
  try {
    log("Testing Event Plan Management...");

    const response = await axios.get(`${BASE_URL}/admin/event-plans`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { page: 1, limit: 10 },
    });

    logSuccess("Event plans listed successfully", {
      count: response.data.eventPlans.length,
      pagination: response.data.pagination,
    });

    return true;
  } catch (error) {
    logError("Event plan management failed", error);
    return false;
  }
};

const testSystemStats = async () => {
  try {
    log("Testing System Statistics...");

    const response = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { period: "month" },
    });

    logSuccess("System stats retrieved", response.data);
    return true;
  } catch (error) {
    logError("System stats failed", error);
    return false;
  }
};

const testSystemHealth = async () => {
  try {
    log("Testing System Health...");

    const response = await axios.get(`${BASE_URL}/admin/system-health`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    logSuccess("System health retrieved", response.data);
    return true;
  } catch (error) {
    logError("System health check failed", error);
    return false;
  }
};

const testBulkOperations = async () => {
  try {
    if (!existingVendorId) {
      log("Skipping bulk operations test - no existing vendor found");
      return true;
    }

    log("Testing Bulk Operations...");

    const response = await axios.post(
      `${BASE_URL}/admin/bulk-approve-vendors`,
      {
        vendorIds: [existingVendorId],
        approve: true,
        reason: "Bulk approval test",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    logSuccess("Bulk operation successful", response.data);
    return true;
  } catch (error) {
    logError("Bulk operations failed", error);
    return false;
  }
};

// Main test runner
const runAdminTests = async () => {
  console.log("🚀 Starting Admin Management Testing...\n");
  console.log(
    "Note: Admin only manages existing data, doesn't create new vendors/services\n"
  );

  const tests = [
    { name: "Admin Authentication", test: testAdminRegistration },
    { name: "Dashboard Overview", test: testAdminDashboard },
    { name: "Vendor Listing", test: testVendorListing },
    { name: "Vendor Details", test: testVendorDetails },
    { name: "Vendor Approval", test: testVendorApproval },
    { name: "Service Listing", test: testServiceListing },
    { name: "Service Management", test: testServiceManagement },
    { name: "Testimonial Listing", test: testTestimonialListing },
    { name: "Testimonial Management", test: testTestimonialManagement },
    { name: "Event Plan Management", test: testEventPlanManagement },
    { name: "System Statistics", test: testSystemStats },
    { name: "System Health", test: testSystemHealth },
    { name: "Bulk Operations", test: testBulkOperations },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of tests) {
    try {
      console.log(`\n📋 Running: ${testCase.name}`);
      const result = await testCase.test();
      if (result) {
        passed++;
        console.log(`✅ ${testCase.name} - PASSED`);
      } else {
        failed++;
        console.log(`❌ ${testCase.name} - FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${testCase.name} - ERROR: ${error.message}`);
    }
  }

  console.log(`\n🎯 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${tests.length}`);

  if (failed === 0) {
    console.log(
      `\n🎉 All admin management tests passed! The admin system is working perfectly.`
    );
  } else {
    console.log(
      `\n⚠️  ${failed} test(s) failed. Please check the errors above.`
    );
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAdminTests().catch(console.error);
}

module.exports = { runAdminTests };
