# Eventia Backend

A comprehensive event planning platform backend built with Node.js, Express, and MongoDB. This backend supports both User and Vendor interfaces with role-based access control.

## 🚀 Features

### User Frontend Support

- **Landing Page**: Hero section, event planning services, vendor listings, testimonials, contact form
- **Event Planning Form**: Budget, event type, guest count, location, date inputs
- **Event Plan Cart**: Selected vendors and packages management
- **Authentication**: Registration and login with role-based access

### Vendor Frontend Support

- **Vendor Dashboard**: Services overview, bookings, earnings tracking
- **Vendor Registration**: Business registration document upload with approval system
- **Service Management**: Add, edit, remove services with media support

### Admin Features

- **Vendor Approval System**: Review and approve/reject vendor applications
- **System Monitoring**: User statistics, event plan tracking, contact management
- **Content Moderation**: Testimonial approval, contact form management

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcrypt, Google OAuth
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: Built-in input validation
- **Security**: CORS, role-based middleware

## 📁 Project Structure

```
backend/
├── models/                 # Database models
│   ├── User.js           # User, Vendor, Admin models
│   ├── EventPlan.js      # Event planning and cart
│   ├── EventService.js   # Event service categories
│   ├── EventPackage.js   # Pre-defined packages
│   ├── Ads.js            # Vendor services
│   ├── Location.js       # Districts and cities
│   ├── Testimonial.js    # Customer testimonials
│   └── Contact.js        # Contact form submissions
├── routes/                # API endpoints
│   ├── authRoutes.js     # Authentication (login/register)
│   ├── eventPlanRoutes.js # Event planning
│   ├── vendorRoutes.js   # Vendor dashboard
│   ├── adminRoutes.js    # Admin management
│   ├── adRoutes.js       # Service management
│   ├── packageRoutes.js  # Package management
│   ├── serviceRoutes.js  # Service categories
│   ├── locationRoutes.js # Location management
│   ├── testimonialRoutes.js # Testimonials
│   └── contactRoutes.js  # Contact forms
├── middleware/            # Authentication & authorization
│   └── authMiddleware.js # JWT verification & role checks
├── uploads/              # File uploads
├── Admin/                # Admin scripts
├── index.js              # Main server file
├── package.json          # Dependencies
└── .env                  # Environment variables
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/eventia
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventia

JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Start the Server

```bash
# Development mode
npm start

# Or with nodemon for development
npm install -g nodemon
nodemon index.js
```

The server will start on `http://localhost:5000`

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Add it to your `.env` file

### Option 2: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/eventia` in your `.env`

### Database Collections

The system will automatically create these collections when you first use the API:

- `users` - User accounts (User, Vendor, Admin)
- `eventplans` - User event plans and cart
- `ads` - Vendor services
- `eventpackages` - Pre-defined packages
- `eventservices` - Service categories by event type
- `locations` - Districts and cities
- `testimonials` - Customer testimonials
- `contacts` - Contact form submissions

## 🧪 Testing

### Quick Testing

```bash
# Install axios for testing
npm install axios

# Populate database with sample data for admin testing
node populateForAdmin.js

# Run comprehensive tests
node quick-test.js

# Test admin functionality specifically (requires existing data)
node admin-test.js

# Test user functionality including cart and purchases
node user-test.js
```

### Testing Coverage

- **Basic Functionality**: Server health, database connection, authentication
- **User Operations**: Registration, login, profile management, cart operations, purchases
- **Vendor Operations**: Registration, service management, dashboard
- **Admin Operations**: Management of existing vendors, services, and testimonials
- **API Integration**: All endpoints tested with proper authentication

### Test Scripts

- `quick-test.js` - Tests basic user and vendor functionality
- `admin-test.js` - Tests admin management operations (requires existing data)
- `user-test.js` - Tests comprehensive user functionality including cart and purchases
- `populateForAdmin.js` - Creates sample data for admin testing
- `setupDatabase.js` - Populates database with locations and event services

## 📱 Frontend Integration

### API Base URL

```
http://localhost:5000/api
```

### Key Endpoints for Frontend

#### Landing Page

- `GET /testimonials` - Get approved testimonials
- `GET /services` - Get event types and services
- `POST /contact` - Submit contact form

#### Event Planning

- `POST /event-plans` - Create event plan
- `GET /event-plans/my-plans` - Get user's plans
- `GET /event-plans/:id/recommendations` - Get vendor recommendations

#### Vendor Dashboard

- `GET /vendor/dashboard` - Dashboard overview
- `GET /vendor/services` - Manage services
- `GET /vendor/bookings` - View bookings

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: User, Vendor, Admin permissions
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Request data validation and sanitization
- **CORS Protection**: Cross-origin resource sharing configuration
- **Vendor Approval**: Business registration verification system

## 📊 API Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Check your `MONGO_URI` in `.env`
   - Ensure MongoDB is running
   - Check network connectivity for Atlas

2. **JWT Secret Error**

   - Ensure `JWT_SECRET` is set in `.env`
   - Use a strong, unique secret

3. **Port Already in Use**

   - Change `PORT` in `.env`
   - Kill existing processes on port 5000

4. **CORS Issues**
   - Check CORS configuration in `index.js`
   - Ensure frontend URL is allowed

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the troubleshooting section

## 🚀 Deployment

### Production Considerations

- Use environment variables for sensitive data
- Enable HTTPS in production
- Set up proper MongoDB indexes
- Configure rate limiting
- Set up monitoring and logging
- Use PM2 or similar process manager

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
PORT=5000
CORS_ORIGIN=https://yourdomain.com
```

---

**Happy Event Planning! 🎉**
