# Eventia Backend Testing Guide

This guide will walk you through testing all the backend functionality step by step.

## 🚀 Prerequisites

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env` file:

   ```env
   MONGO_URI=mongodb://localhost:27017/eventia
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

3. **Start MongoDB**

   - Local: Start MongoDB service
   - Atlas: Ensure your cluster is running

4. **Start the Server**
   ```bash
   npm start
   ```

## 🧪 Testing Sequence

### Phase 1: Basic Server & Database Connection

#### 1.1 Test Server Health

```bash
curl http://localhost:5000/
```

**Expected Response:**

```json
"Eventia Backend is Running with Cloud DB!"
```

#### 1.2 Test Database Connection

Check your terminal where the server is running. You should see:

```
MongoDB Atlas Connected Successfully!
```

### Phase 2: Authentication System

#### 2.1 Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "User"
  }'
```

**Expected Response:**

```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "isApproved": true
  }
}
```

#### 2.2 Test User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "isApproved": true
  }
}
```

#### 2.3 Test Vendor Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wedding Photography Pro",
    "email": "photography@example.com",
    "password": "password123",
    "role": "Vendor",
    "businessRegistration": "base64_encoded_document_here"
  }'
```

**Expected Response:**

```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f...",
    "name": "Wedding Photography Pro",
    "email": "photography@example.com",
    "role": "Vendor",
    "isApproved": false
  }
}
```

**Note:** Vendor is not approved yet and needs admin approval.

### Phase 3: Admin Functions

#### 3.1 Create Admin User

```bash
node createAdmin.js
```

**Expected Output:**

```
Admin user created successfully!
Email: admin@eventia.com
Password: admin123
```

#### 3.2 Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eventia.com",
    "password": "admin123"
  }'
```

**Save the admin token for later use:**

```bash
export ADMIN_TOKEN="your_admin_jwt_token_here"
```

#### 3.3 Test Admin Dashboard

```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**

```json
{
  "users": {
    "total": 2,
    "vendors": {
      "total": 1,
      "pending": 1,
      "approved": 0
    }
  },
  "services": {
    "total": 0,
    "eventPlans": 0
  },
  "adminTasks": {
    "newContacts": 0,
    "pendingTestimonials": 0
  },
  "recentActivity": {
    "vendors": [...],
    "eventPlans": []
  }
}
```

#### 3.4 Approve Vendor

```bash
# First, get the vendor ID from the dashboard response
# Then approve the vendor
curl -X PUT http://localhost:5000/api/admin/approve-vendor/VENDOR_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "approve": true,
    "reason": "Business registration verified"
  }'
```

**Expected Response:**

```json
{
  "message": "Vendor approved",
  "reason": "Business registration verified"
}
```

### Phase 4: Event Planning System

#### 4.1 Login as Regular User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the user token:**

```bash
export USER_TOKEN="your_user_jwt_token_here"
```

#### 4.2 Create Event Plan

```bash
curl -X POST http://localhost:5000/api/event-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "eventType": "Wedding",
    "budget": 50000,
    "guestCount": 150,
    "preferredLocation": {
      "city": "Colombo",
      "district": "Western"
    },
    "eventDate": "2024-12-25T00:00:00.000Z",
    "notes": "Outdoor wedding ceremony with garden reception"
  }'
```

**Expected Response:**

```json
{
  "_id": "64f...",
  "userId": "64f...",
  "eventType": "Wedding",
  "budget": 50000,
  "guestCount": 150,
  "preferredLocation": {
    "city": "Colombo",
    "district": "Western"
  },
  "eventDate": "2024-12-25T00:00:00.000Z",
  "status": "Planning",
  "selectedVendors": [],
  "selectedPackages": [],
  "totalCost": 0,
  "notes": "Outdoor wedding ceremony with garden reception",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Save the event plan ID:**

```bash
export EVENT_PLAN_ID="your_event_plan_id_here"
```

#### 4.3 Get User's Event Plans

```bash
curl -X GET http://localhost:5000/api/event-plans/my-plans \
  -H "Authorization: Bearer $USER_TOKEN"
```

#### 4.4 Get Event Plan Details

```bash
curl -X GET http://localhost:5000/api/event-plans/$EVENT_PLAN_ID \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Phase 5: Vendor Service Management

#### 5.1 Login as Approved Vendor

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "photography@example.com",
    "password": "password123"
  }'
```

**Save the vendor token:**

```bash
export VENDOR_TOKEN="your_vendor_jwt_token_here"
```

#### 5.2 Create Vendor Service

```bash
curl -X POST http://localhost:5000/api/ads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -d '{
    "title": "Premium Wedding Photography Package",
    "description": "Complete wedding photography coverage including engagement shoot, wedding day, and reception",
    "eventType": "Wedding",
    "serviceCategory": "Photography",
    "location": {
      "city": "Colombo",
      "district": "Western"
    },
    "priceRange": {
      "min": 15000,
      "max": 50000
    },
    "capacity": 200,
    "images": ["photo1.jpg", "photo2.jpg"]
  }'
```

**Expected Response:**

```json
{
  "_id": "64f...",
  "title": "Premium Wedding Photography Package",
  "description": "Complete wedding photography coverage including engagement shoot, wedding day, and reception",
  "vendorId": "64f...",
  "eventType": "Wedding",
  "serviceCategory": "Photography",
  "location": {
    "city": "Colombo",
    "district": "Western"
  },
  "priceRange": {
    "min": 15000,
    "max": 50000
  },
  "capacity": 200,
  "images": ["photo1.jpg", "photo2.jpg"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Save the service ID:**

```bash
export SERVICE_ID="your_service_id_here"
```

#### 5.3 Test Vendor Dashboard

```bash
curl -X GET http://localhost:5000/api/vendor/dashboard \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

**Expected Response:**

```json
{
  "services": {
    "total": 1,
    "list": [...]
  },
  "earnings": {
    "total": 0,
    "thisMonth": 0
  },
  "bookings": {
    "pending": 0,
    "approved": 0,
    "completed": 0,
    "total": 0
  },
  "recentActivity": []
}
```

### Phase 6: Event Planning Integration

#### 6.1 Get Vendor Recommendations

```bash
curl -X GET http://localhost:5000/api/event-plans/$EVENT_PLAN_ID/recommendations \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected Response:**

```json
{
  "vendors": [
    {
      "_id": "64f...",
      "title": "Premium Wedding Photography Package",
      "description": "Complete wedding photography coverage...",
      "vendorId": {
        "_id": "64f...",
        "name": "Wedding Photography Pro",
        "email": "photography@example.com",
        "isApproved": true
      },
      "priceRange": {
        "min": 15000,
        "max": 50000
      }
    }
  ],
  "packages": []
}
```

#### 6.2 Add Vendor to Event Plan

```bash
curl -X POST http://localhost:5000/api/event-plans/$EVENT_PLAN_ID/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "vendorId": "VENDOR_ID_HERE",
    "serviceId": "SERVICE_ID_HERE",
    "price": 25000,
    "notes": "Premium photography package for wedding ceremony and reception"
  }'
```

**Expected Response:**

```json
{
  "_id": "64f...",
  "selectedVendors": [
    {
      "vendorId": "64f...",
      "serviceId": "64f...",
      "price": 25000,
      "notes": "Premium photography package for wedding ceremony and reception"
    }
  ],
  "totalCost": 25000
}
```

### Phase 7: Testimonials and Contact

#### 7.1 Submit Testimonial

```bash
curl -X POST http://localhost:5000/api/testimonials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "customerName": "John Doe",
    "customerRole": "Groom",
    "eventType": "Wedding",
    "rating": 5,
    "testimonial": "Amazing photography service! Made our wedding day perfect with beautiful photos.",
    "vendorId": "VENDOR_ID_HERE"
  }'
```

#### 7.2 Submit Contact Form

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+94 71 123 4567",
    "subject": "Wedding Planning Inquiry",
    "message": "I am looking for wedding planning services for my upcoming wedding in December."
  }'
```

### Phase 8: Admin Content Moderation

#### 8.1 Approve Testimonial

```bash
curl -X PUT http://localhost:5000/api/testimonials/admin/TESTIMONIAL_ID_HERE/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "approve": true
  }'
```

#### 8.2 Update Contact Status

```bash
curl -X PUT http://localhost:5000/api/contact/admin/CONTACT_ID_HERE/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "In Progress",
    "adminNotes": "Assigned to wedding planning team"
  }'
```

## 🔍 Testing Tools

### 1. Postman Collection

Import this collection into Postman for easier testing:

```json
{
  "info": {
    "name": "Eventia Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "User Register",
          "request": {
            "method": "POST",
            "header": [],
            "url": "{{baseUrl}}/api/auth/register"
          }
        }
      ]
    }
  ]
}
```

### 2. Environment Variables for Postman

```json
{
  "baseUrl": "http://localhost:5000",
  "userToken": "",
  "vendorToken": "",
  "adminToken": "",
  "eventPlanId": "",
  "serviceId": "",
  "vendorId": ""
}
```

### 3. Test Scripts

Create test scripts for automated testing:

```bash
#!/bin/bash
# test-auth.sh

echo "Testing Authentication..."

# Test registration
echo "Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "User"
  }')

echo "Register response: $REGISTER_RESPONSE"

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Test protected route
echo "Testing protected route..."
curl -s -X GET http://localhost:5000/api/event-plans/my-plans \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Common Testing Issues

### 1. JWT Token Expired

**Error:** `"error": "Invalid token"`
**Solution:** Re-login to get a new token

### 2. MongoDB Connection Issues

**Error:** `"MongoDB Connection Failed"`
**Solution:** Check your `.env` file and MongoDB connection

### 3. CORS Issues

**Error:** CORS policy blocking requests
**Solution:** Check CORS configuration in `index.js`

### 4. Validation Errors

**Error:** `"error": "Validation failed"`
**Solution:** Check required fields in request body

## 📊 Testing Checklist

- [ ] Server starts successfully
- [ ] Database connects
- [ ] User registration works
- [ ] User login works
- [ ] Vendor registration works
- [ ] Admin creation works
- [ ] Admin can approve vendors
- [ ] Event plan creation works
- [ ] Vendor service creation works
- [ ] Vendor dashboard works
- [ ] Event plan recommendations work
- [ ] Vendor selection works
- [ ] Testimonials work
- [ ] Contact forms work
- [ ] Admin moderation works
- [ ] All protected routes require authentication
- [ ] Role-based access control works

## 🚀 Performance Testing

### Load Testing with Apache Bench

```bash
# Test registration endpoint
ab -n 100 -c 10 -p register_data.json -T application/json http://localhost:5000/api/auth/register

# Test login endpoint
ab -n 100 -c 10 -p login_data.json -T application/json http://localhost:5000/api/auth/login
```

### Memory Usage Monitoring

```bash
# Monitor Node.js process
node --inspect index.js

# Use Chrome DevTools for profiling
```

## 🎯 Next Steps

After successful testing:

1. **Frontend Integration**: Use the tested endpoints in your frontend
2. **Production Deployment**: Set up production environment
3. **Monitoring**: Add logging and monitoring
4. **Testing Automation**: Set up CI/CD with automated tests
5. **Documentation**: Update API docs based on testing results

---

**Happy Testing! 🧪✨**
