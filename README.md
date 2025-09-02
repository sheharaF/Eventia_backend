# Eventia Backend

A comprehensive backend system for the Eventia platform, supporting user browsing, vendor services, and event planning functionality.

## 🎯 **Core Features**

### **User Experience**

- **Browse & Search**: Users can browse vendor services and packages with advanced filtering
  - Filter by event type, service category, price range, location, and date
  - Pagination support for large listings
- **Cart Management**: Full cart functionality for selecting services and packages
  - Add/remove services and packages
  - Quantity management
  - Real-time cost calculation
- **Booking Process**: Simple checkout and booking confirmation
  - No payment gateway required
  - Event details collection
  - Booking status management

### **Vendor Experience**

- **Unified Posting**: Single form to post both services and packages
- **Service Management**: Full CRUD operations for vendor services
- **Package Management**: Create and manage all-in-one event packages
- **Dashboard**: Overview of earnings, bookings, and performance

### **Admin Experience**

- **Vendor Approval**: Manage vendor registrations and approvals
- **Content Moderation**: Approve/reject services, packages, and testimonials
- **System Monitoring**: Dashboard overview and system health checks

## 🏗️ **Architecture**

### **Technology Stack**

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with role-based access control
- **File Handling**: Multer for file uploads
- **Validation**: Built-in validation with error handling

### **Core Models**

- **User**: Authentication and profile management
- **Service (Ad)**: Individual vendor services
- **Event Package**: All-in-one event packages
- **Event Plan**: User cart and booking management
- **Location**: Geographic data for filtering

## 📁 **Project Structure**

```
backend/
├── models/              # Database models
│   ├── User.js         # User authentication & profiles
│   ├── Ads.js          # Vendor services
│   ├── EventPackage.js # Event packages
│   ├── EventPlan.js    # User cart & bookings
│   └── Location.js     # Geographic data
├── routes/              # API route handlers
│   ├── authRoutes.js   # Authentication (login/register)
│   ├── userRoutes.js   # User browsing & cart management
│   ├── vendorRoutes.js # Vendor dashboard & posting
│   ├── adminRoutes.js  # Admin management
│   ├── locationRoutes.js # Location data
│   └── eventPlanRoutes.js # Event planning
├── middleware/          # Authentication & authorization
├── uploads/             # File uploads
├── setupDatabase.js     # Initial data population
├── API_DOCUMENTATION.md # Complete API reference
└── README.md           # This file
```

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm start
```

### **Environment Variables**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventia
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 🗄️ **Database Setup**

### **Initial Population**

```bash
# Run the setup script to populate initial data
node setupDatabase.js
```

This will create:

- Location data (districts and cities)
- Event service categories
- Sample event packages

### **Collections Created**

- `users` - User accounts and profiles
- `ads` - Vendor services
- `eventpackages` - Event packages
- `eventplans` - User carts and bookings
- `locations` - Geographic data

## 🔐 **Authentication & Roles**

### **User Roles**

- **User**: Browse services, manage cart, make bookings
- **Vendor**: Post services/packages, manage dashboard
- **Admin**: System management and moderation

### **Protected Routes**

All user and vendor routes require JWT authentication:

```
Authorization: Bearer <jwt-token>
```

## 📱 **API Endpoints**

### **Core User Flow**

1. **Browse**: `GET /api/user/services` - Filter and search services
2. **Browse**: `GET /api/user/packages` - Filter and search packages
3. **Cart**: `GET /api/user/cart` - View current cart
4. **Add**: `POST /api/user/cart/services` - Add service to cart
5. **Add**: `POST /api/user/cart/packages` - Add package to cart
6. **Checkout**: `POST /api/user/cart/checkout` - Confirm booking

### **Vendor Operations**

1. **Post**: `POST /api/vendor/post` - Post service or package
2. **Manage**: `GET /api/vendor/services` - View posted services
3. **Manage**: `GET /api/vendor/packages` - View posted packages
4. **Dashboard**: `GET /api/vendor/dashboard` - Overview and stats

## 🧪 **Testing**

### **Manual Testing**

Use the provided testing scripts:

```bash
# Test user functionality
node user-test.js

# Test admin functionality
node admin-test.js

# Quick system test
node quick-test.js
```

### **API Testing**

Use tools like Postman or curl to test endpoints:

```bash
# Test service browsing
curl "http://localhost:5000/api/user/services?eventType=wedding&minPrice=1000"

# Test cart operations
curl -X POST "http://localhost:5000/api/user/cart/services" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"...","vendorId":"...","price":500}'
```

## 🔧 **Development**

### **Adding New Features**

1. Create/update models in `models/` directory
2. Add routes in appropriate route files
3. Update API documentation
4. Add tests for new functionality

### **Code Style**

- Use async/await for database operations
- Implement proper error handling
- Follow RESTful API conventions
- Add input validation where needed

## 🚀 **Deployment**

### **Production Considerations**

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Enable HTTPS
- Set up proper MongoDB security
- Configure CORS for production domains
- Set up monitoring and logging

### **Environment Variables**

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=very-strong-secret-key
CORS_ORIGIN=https://yourdomain.com
```

## 📚 **Documentation**

- **API Reference**: `API_DOCUMENTATION.md` - Complete endpoint documentation
- **Testing Guide**: `TESTING_GUIDE.md` - Testing instructions and examples
- **Setup Guide**: `SETUP_GUIDE.md` - Detailed setup instructions

## 🤝 **Contributing**

1. Follow the established code structure
2. Add tests for new functionality
3. Update documentation
4. Ensure all tests pass
5. Follow the commit message conventions

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For issues and questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Include error logs and reproduction steps

---

**Eventia Backend** - Powering seamless event planning experiences! 🎉
