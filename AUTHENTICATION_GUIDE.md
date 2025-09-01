# Authentication & Role-Based Access Control Guide

## Current Authentication Status

### ✅ **Working Correctly:**

- User model with proper role definitions (`User`, `Admin`, `Vendor`)
- JWT token generation with role information
- Basic admin middleware
- Vendor approval system
- Admin routes protection

### ❌ **Issues Fixed:**

- Missing role-based middleware (added `isVendor`, `isUser`, `isAuthenticated`, `hasRole`)
- Improved token extraction handling
- Added proper role validation

### 🔧 **Still Needs Implementation:**

## Route Protection Recommendations

### **Public Routes (No Authentication Required):**

- `GET /api/services/:eventType` - Service listings
- `GET /api/locations/*` - Location data
- `GET /api/ads/search` - Public ad search
- `GET /api/packages/*` - Package listings

### **Authenticated Routes (Any logged-in user):**

- `GET /api/ads/user-ads` - User's own ads
- `POST /api/ads` - Create new ad (Vendor only)
- `PUT /api/ads/:id` - Update ad (Owner only)
- `DELETE /api/ads/:id` - Delete ad (Owner only)

### **Role-Specific Routes:**

#### **Admin Only:**

- `PUT /api/admin/approve-vendor/:id` ✅ (Already protected)
- `GET /api/admin/vendors` - List all vendors
- `GET /api/admin/stats` - System statistics

#### **Vendor Only:**

- `POST /api/ads` - Create advertisements
- `PUT /api/ads/:id` - Update own ads
- `DELETE /api/ads/:id` - Delete own ads
- `GET /api/vendor/dashboard` - Vendor dashboard

#### **User Only:**

- `GET /api/user/bookmarks` - User bookmarks
- `POST /api/user/bookmark/:adId` - Bookmark ads
- `GET /api/user/profile` - User profile

## Implementation Examples

### **Using Individual Role Middleware:**

```javascript
// Admin only
router.get("/admin/stats", verifyToken, isAdmin, async (req, res) => {
  // Admin logic
});

// Vendor only
router.post("/ads", verifyToken, isVendor, async (req, res) => {
  // Vendor logic
});

// User only
router.get("/user/profile", verifyToken, isUser, async (req, res) => {
  // User logic
});
```

### **Using Flexible Role Middleware:**

```javascript
// Multiple roles allowed
router.get(
  "/dashboard",
  verifyToken,
  hasRole(["Admin", "Vendor"]),
  async (req, res) => {
    // Logic for both Admin and Vendor
  }
);

// Any authenticated user
router.get("/profile", verifyToken, isAuthenticated, async (req, res) => {
  // Logic for any logged-in user
});
```

## Security Best Practices

1. **Always verify tokens first** before checking roles
2. **Use specific role middleware** for sensitive operations
3. **Implement resource ownership checks** for user-specific data
4. **Log authentication attempts** for security monitoring
5. **Use HTTPS** in production
6. **Implement rate limiting** for authentication endpoints

## Testing Authentication

### **Test Cases to Implement:**

1. ✅ Valid admin token accessing admin routes
2. ❌ Invalid token accessing protected routes
3. ❌ User token accessing admin routes
4. ❌ Vendor token accessing user-only routes
5. ✅ Vendor token accessing vendor routes
6. ❌ Unapproved vendor accessing vendor routes

## Next Steps

1. **Add authentication to routes** that need protection
2. **Implement resource ownership validation**
3. **Add authentication testing**
4. **Set up proper error handling**
5. **Implement refresh token mechanism**
6. **Add rate limiting for auth endpoints**

