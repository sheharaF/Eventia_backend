// Authentication Test Examples
// This file demonstrates how to test the role-based authentication system

const jwt = require("jsonwebtoken");

// Test tokens (replace with actual JWT_SECRET from your .env file)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Generate test tokens for different roles
function generateTestToken(userId, role) {
  return jwt.sign({ id: userId, role: role }, JWT_SECRET, { expiresIn: "2h" });
}

// Test cases
const testCases = [
  {
    name: "Admin Token",
    token: generateTestToken("admin123", "Admin"),
    expectedRole: "Admin",
    shouldAccessAdmin: true,
    shouldAccessVendor: false,
    shouldAccessUser: false,
  },
  {
    name: "Vendor Token",
    token: generateTestToken("vendor123", "Vendor"),
    expectedRole: "Vendor",
    shouldAccessAdmin: false,
    shouldAccessVendor: true,
    shouldAccessUser: false,
  },
  {
    name: "User Token",
    token: generateTestToken("user123", "User"),
    expectedRole: "User",
    shouldAccessAdmin: false,
    shouldAccessVendor: false,
    shouldAccessUser: true,
  },
  {
    name: "Invalid Token",
    token: "invalid.token.here",
    expectedRole: null,
    shouldAccessAdmin: false,
    shouldAccessVendor: false,
    shouldAccessUser: false,
  },
];

// Test middleware functions
function testMiddleware(middleware, token, expectedResult) {
  const req = {
    header: (name) => {
      if (name === "Authorization") {
        return `Bearer ${token}`;
      }
      return null;
    },
  };

  const res = {
    status: (code) => ({
      json: (data) => ({ statusCode: code, data }),
    }),
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  middleware(req, res, next);

  return {
    success: nextCalled === expectedResult,
    nextCalled,
    expectedResult,
  };
}

// Example usage for testing
console.log("=== Authentication Test Examples ===\n");

testCases.forEach((testCase) => {
  console.log(`Testing: ${testCase.name}`);
  console.log(`Token: ${testCase.token.substring(0, 20)}...`);
  console.log(`Expected Role: ${testCase.expectedRole}`);
  console.log("---");
});

console.log("\n=== API Testing Examples ===\n");

console.log("1. Test Admin Access:");
console.log(
  'curl -H "Authorization: Bearer <admin-token>" http://localhost:5000/api/admin/approve-vendor/123'
);

console.log("\n2. Test Vendor Access:");
console.log(
  'curl -H "Authorization: Bearer <vendor-token>" -X POST http://localhost:5000/api/ads'
);

console.log("\n3. Test Unauthorized Access:");
console.log(
  'curl -H "Authorization: Bearer <user-token>" http://localhost:5000/api/admin/approve-vendor/123'
);

console.log("\n4. Test Missing Token:");
console.log("curl http://localhost:5000/api/ads/user/my-ads");

console.log("\n=== Expected Responses ===\n");

console.log("✅ Valid Admin Token -> Admin Routes: 200 OK");
console.log("❌ User Token -> Admin Routes: 403 Forbidden");
console.log("❌ Invalid Token -> Any Protected Route: 401 Unauthorized");
console.log("❌ Missing Token -> Any Protected Route: 401 Unauthorized");
console.log("✅ Valid Vendor Token -> Vendor Routes: 200 OK");
console.log("❌ User Token -> Vendor Routes: 403 Forbidden");

module.exports = { generateTestToken, testCases };

