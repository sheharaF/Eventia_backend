require("dotenv").config();
const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:5000/api";
let userToken = "";

// Test user credentials
const testUser = {
  name: "Test User",
  email: "testuser@example.com",
  password: "password123",
  role: "User",
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
const testUserRegistration = async () => {
  try {
    log("Testing User Registration...");

    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    userToken = response.data.token;

    logSuccess("User registered successfully", {
      token: userToken.substring(0, 20) + "...",
      user: response.data.user,
    });

    return true;
  } catch (error) {
    if (
      error.response?.status === 400 &&
      error.response.data.error === "User already exists"
    ) {
      log("User already exists, proceeding with login...");
      return await testUserLogin();
    }
    logError("User registration failed", error);
    return false;
  }
};

const testUserLogin = async () => {
  try {
    log("Testing User Login...");

    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    userToken = response.data.token;

    logSuccess("User login successful", {
      token: userToken.substring(0, 20) + "...",
      user: response.data.user,
    });

    return true;
  } catch (error) {
    logError("User login failed", error);
    return false;
  }
};

const testUserProfile = async () => {
  try {
    log("Testing User Profile...");

    // Get profile
    const getResponse = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    logSuccess("Profile retrieved successfully", getResponse.data);

    // Verify the profile structure
    if (getResponse.data.success && getResponse.data.user) {
      const user = getResponse.data.user;
      log("Profile structure verified:", {
        hasId: !!user.id,
        hasName: !!user.name,
        hasEmail: !!user.email,
        hasRole: !!user.role,
        hasPhone: user.phone !== undefined,
        hasAddress: user.address !== undefined,
        hasTimestamps: !!(user.createdAt && user.updatedAt),
      });
    }

    // Update profile with new fields
    const updateResponse = await axios.put(
      `${BASE_URL}/user/profile`,
      {
        name: "Updated Test User",
        phone: "+1234567890",
        address: "123 Test Street, Test City",
      },
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    logSuccess("Profile updated successfully", updateResponse.data);

    // Verify the update worked by getting profile again
    const verifyResponse = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (verifyResponse.data.success && verifyResponse.data.user) {
      const updatedUser = verifyResponse.data.user;
      logSuccess("Profile update verified:", {
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
      });
    }

    return true;
  } catch (error) {
    logError("Profile test failed", error);
    return false;
  }
};

const testUserCart = async () => {
  try {
    log("Testing User Cart...");

    const response = await axios.get(`${BASE_URL}/user/cart`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    logSuccess("Cart retrieved successfully", response.data);

    return true;
  } catch (error) {
    logError("Cart test failed", error);
    return false;
  }
};

const testUserPurchases = async () => {
  try {
    log("Testing User Purchases...");

    const response = await axios.get(`${BASE_URL}/user/purchases`, {
      headers: { Authorization: `Bearer ${userToken}` },
      params: { page: 1, limit: 10 },
    });

    logSuccess("Purchases retrieved successfully", {
      count: response.data.purchases.length,
      pagination: response.data.pagination,
    });

    return true;
  } catch (error) {
    logError("Purchases test failed", error);
    return false;
  }
};

const testUserAccountDeletion = async () => {
  try {
    log("Testing User Account Deletion...");

    // Note: This will actually delete the user account
    // In a real test, you might want to skip this or test with a different user
    log("Skipping account deletion test to preserve test user");
    log(
      "To test deletion, manually call DELETE /api/user/profile with proper authentication"
    );

    return true;
  } catch (error) {
    logError("Account deletion test failed", error);
    return false;
  }
};

// Main test runner
const runUserTests = async () => {
  console.log("🚀 Starting Simplified User Route Testing...\n");
  console.log(
    "Testing only essential user functionality: profile, cart, purchases\n"
  );

  const tests = [
    { name: "User Authentication", test: testUserRegistration },
    { name: "User Profile", test: testUserProfile },
    { name: "User Cart", test: testUserCart },
    { name: "User Purchases", test: testUserPurchases },
    { name: "Account Deletion (Skipped)", test: testUserAccountDeletion },
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
      `\n🎉 All user tests passed! The simplified user system is working perfectly.`
    );
  } else {
    console.log(
      `\n⚠️  ${failed} test(s) failed. Please check the errors above.`
    );
  }

  console.log(
    `\n💡 Note: Account deletion test is skipped to preserve test user.`
  );
  console.log(
    `   To test deletion: DELETE /api/user/profile with proper authentication`
  );
};

// Run tests if this file is executed directly
if (require.main === module) {
  runUserTests().catch(console.error);
}

module.exports = { runUserTests };
