# Eventia Backend Setup Guide

This guide will walk you through setting up the Eventia backend from scratch, including database setup, testing, and deployment.

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment

```bash
# Create .env file
echo "MONGO_URI=mongodb://localhost:27017/eventia
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000" > .env
```

### 3. Setup Database

```bash
node setupDatabase.js
```

### 4. Start Server

```bash
npm start
```

### 5. Run Quick Tests

```bash
npm install axios
node quick-test.js
```

## 📋 Detailed Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Step 1: Project Setup

```bash
# Clone or download the project
cd backend

# Install dependencies
npm install

# Install additional testing dependencies
npm install axios
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/eventia
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventia

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Step 3: Database Setup

#### Option A: Local MongoDB

1. **Install MongoDB**

   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS with Homebrew
   brew install mongodb-community

   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**

   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb

   # macOS
   brew services start mongodb-community

   # Windows
   # MongoDB runs as a service
   ```

3. **Verify Connection**
   ```bash
   mongo
   # Should open MongoDB shell
   ```

#### Option B: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account
3. Create a new cluster
4. Set up database access (username/password)
5. Set up network access (IP whitelist)
6. Get your connection string
7. Update your `.env` file

#### Populate Database

```bash
# Run the database setup script
node setupDatabase.js
```

This will create:

- 9 districts with cities (Western, Central, Southern, etc.)
- 4 event types (Wedding, Birthday, Corporate, Anniversary)
- Service categories for each event type
- Sample event packages

### Step 4: Start the Server

```bash
# Development mode
npm start

# Or with nodemon for development
npm install -g nodemon
nodemon index.js
```

You should see:

```
Server running on port 5000
MongoDB Atlas Connected Successfully!
```

### Step 5: Test the Backend

#### Quick Test

```bash
node quick-test.js
```

#### Manual Testing

```bash
# Test server health
curl http://localhost:5000/

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "User"
  }'
```

## 🧪 Testing Guide

### Automated Testing

1. **Install axios** (if not already installed)

   ```bash
   npm install axios
   ```

2. **Run quick tests**

   ```bash
   node quick-test.js
   ```

3. **Run comprehensive tests**
   Follow the [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### Manual Testing with Postman

1. **Import Collection**

   - Open Postman
   - Import the collection from `TESTING_GUIDE.md`

2. **Set Environment Variables**

   ```json
   {
     "baseUrl": "http://localhost:5000",
     "userToken": "",
     "vendorToken": "",
     "adminToken": ""
   }
   ```

3. **Test Endpoints**
   - Start with authentication
   - Test user registration
   - Test vendor registration
   - Test event planning

## 🔐 Admin Setup

### Create Admin User

```bash
node createAdmin.js
```

This creates:

- Email: `admin@eventia.com`
- Password: `admin123`

### Admin Workflow

1. **Login as admin**

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@eventia.com",
       "password": "admin123"
     }'
   ```

2. **Approve vendors**
   ```bash
   curl -X PUT http://localhost:5000/api/admin/approve-vendor/VENDOR_ID \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -d '{
       "approve": true,
       "reason": "Documents verified"
     }'
   ```

## 🗄️ Database Collections

The system automatically creates these collections:

| Collection      | Purpose                  | Key Fields                             |
| --------------- | ------------------------ | -------------------------------------- |
| `users`         | User accounts            | name, email, role, isApproved          |
| `eventplans`    | Event plans              | userId, eventType, budget, status      |
| `ads`           | Vendor services          | vendorId, title, eventType, priceRange |
| `eventpackages` | Pre-defined packages     | title, eventType, priceRange           |
| `eventservices` | Service categories       | eventType, serviceCategories           |
| `locations`     | Districts and cities     | district, cities                       |
| `testimonials`  | Customer reviews         | customerName, rating, isApproved       |
| `contacts`      | Contact form submissions | name, email, status                    |

## 🔍 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Check connection string in .env
echo $MONGO_URI

# Test connection manually
mongo mongodb://localhost:27017/eventia
```

#### 2. Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 PID

# Or change port in .env
PORT=5001
```

#### 3. JWT Secret Error

```bash
# Generate a new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env file
JWT_SECRET=your_new_secret_here
```

#### 4. CORS Issues

```bash
# Check CORS configuration in index.js
# Ensure frontend URL is allowed
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Or with more verbose logging
NODE_ENV=development npm start
```

## 📱 Frontend Integration

### API Base URL

```
http://localhost:5000/api
```

### Key Endpoints

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login

#### Event Planning

- `POST /event-plans` - Create event plan
- `GET /event-plans/my-plans` - Get user's plans
- `GET /event-plans/:id/recommendations` - Get vendor recommendations

#### Vendor Management

- `GET /vendor/dashboard` - Vendor dashboard
- `POST /ads` - Create vendor service

#### Public Data

- `GET /services` - Get event types
- `GET /locations` - Get districts and cities
- `GET /testimonials` - Get approved testimonials

### Example Frontend Integration

```javascript
// User registration
const registerUser = async (userData) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Registration failed:", error);
  }
};

// Create event plan
const createEventPlan = async (planData, token) => {
  try {
    const response = await fetch("http://localhost:5000/api/event-plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(planData),
    });
    return await response.json();
  } catch (error) {
    console.error("Event plan creation failed:", error);
  }
};
```

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
PORT=5000
CORS_ORIGIN=https://yourdomain.com
```

### Process Management

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start index.js --name "eventia-backend"

# Monitor
pm2 monit

# Logs
pm2 logs eventia-backend
```

### Security Considerations

- Use HTTPS in production
- Set up proper MongoDB indexes
- Enable rate limiting
- Set up monitoring and logging
- Regular security updates

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [README](./README.md)

## 🆘 Getting Help

1. **Check the documentation** above
2. **Review troubleshooting section**
3. **Check console logs** for errors
4. **Verify environment variables**
5. **Test database connection**

## 🎯 Next Steps

After successful setup:

1. **Test all endpoints** using the testing guide
2. **Create admin user** and test admin functions
3. **Test vendor workflow** (registration → approval → service creation)
4. **Test event planning** (create plan → get recommendations → select vendors)
5. **Integrate with frontend** using the API endpoints
6. **Deploy to production** following the deployment guide

---

**Happy Event Planning! 🎉**

If you encounter any issues, please check the troubleshooting section or create an issue in the repository.
