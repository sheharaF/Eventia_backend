# Eventia Backend API Documentation

## Overview

This API provides endpoints for the Eventia platform, supporting user browsing, vendor services, and event planning functionality.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Routes

### Authentication Routes (`/api/auth`)

- `POST /auth/register` - User registration (User, Vendor, Admin)
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login

### User Routes (`/api/user`)

#### Profile Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user details (name, phone, address)

#### Browse & Search

- `GET /api/user/services` - Browse vendor services with filtering
  - Query params: `eventType`, `serviceCategory`, `minPrice`, `maxPrice`, `location`, `date`, `page`, `limit`
- `GET /api/user/packages` - Browse event packages with filtering
  - Query params: `eventType`, `minPrice`, `maxPrice`, `location`, `page`, `limit`

#### Cart Management

- `GET /api/user/cart` - View user's current cart
- `POST /api/user/cart/services` - Add service to cart
- `POST /api/user/cart/packages` - Add package to cart
- `DELETE /api/user/cart/services/:serviceId` - Remove service from cart
- `DELETE /api/user/cart/packages/:packageId` - Remove package from cart
- `POST /api/user/cart/checkout` - Confirm booking/checkout

#### Bookings

- `GET /api/user/bookings` - View user's confirmed bookings

### Vendor Routes (`/api/vendor`)

#### Dashboard & Management

- `GET /api/vendor/dashboard` - Get vendor dashboard overview
- `PUT /api/vendor/profile` - Update vendor profile

#### Post Services & Packages

- `POST /api/vendor/post` - Post service or package (combined form)
  - Body: `type` ('service' or 'package'), `title`, `description`, `price`, `eventType`, etc.

#### Manage Services

- `GET /api/vendor/services` - Get vendor's services
- `PUT /api/vendor/services/:id` - Update service
- `DELETE /api/vendor/services/:id` - Delete service

#### Manage Packages

- `GET /api/vendor/packages` - Get vendor's packages
- `PUT /api/vendor/packages/:id` - Update package
- `DELETE /api/vendor/packages/:id` - Delete package

#### Bookings

- `GET /api/vendor/bookings` - Get vendor's bookings

### Admin Routes (`/api/admin`)

- `POST /api/admin/register` - Admin registration
- `GET /api/admin/dashboard` - Admin dashboard overview
- `GET /api/admin/vendors` - List all vendors
- `PUT /api/admin/vendors/:id/approve` - Approve vendor
- `GET /api/admin/services` - List all services
- `PUT /api/admin/services/:id/toggle` - Toggle service status
- `GET /api/admin/testimonials` - List testimonials
- `PUT /api/admin/testimonials/:id/approve` - Approve testimonial
- `GET /api/admin/system-health` - System health check
- `POST /api/admin/bulk-approve-vendors` - Bulk approve vendors

### Location Routes (`/api/locations`)

- `GET /api/locations` - Get all locations (districts and cities)

### Event Planning Routes (`/api/event-plans`)

- `POST /api/event-plans` - Create new event plan
- `GET /api/event-plans/recommendations` - Get vendor recommendations

## Data Models

### User

- `name`, `email`, `password`, `role`, `phone`, `address`, `isApproved`

### Service (Ad)

- `title`, `description`, `price`, `eventType`, `serviceCategory`, `location`, `capacity`, `images`, `vendorId`

### Event Package

- `title`, `description`, `price`, `eventType`, `services`, `location`, `capacity`, `images`, `vendorId`

### Event Plan

- `userId`, `eventType`, `budget`, `guestCount`, `preferredLocation`, `eventDate`, `status`, `selectedVendors`, `selectedPackages`, `totalCost`

## Filtering & Search

### Service Filtering

- **Event Type**: Filter by specific event type (wedding, birthday, corporate, etc.)
- **Service Category**: Filter by service category (catering, photography, decoration, etc.)
- **Price Range**: Filter by minimum and maximum price
- **Location**: Filter by city or district
- **Date**: Filter by available dates
- **Pagination**: Support for page-based pagination

### Package Filtering

- **Event Type**: Filter by specific event type
- **Price Range**: Filter by minimum and maximum price
- **Location**: Filter by city or district
- **Pagination**: Support for page-based pagination

## Cart & Booking Flow

1. **Browse**: Users browse services and packages with filtering
2. **Add to Cart**: Users add selected services/packages to cart
3. **Cart Management**: Users can view, modify, and remove items from cart
4. **Checkout**: Users provide event details and confirm booking
5. **Booking Confirmation**: Cart status changes to "Confirmed"

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

## Success Responses

Most endpoints return success responses with data:

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

## Pagination

List endpoints support pagination with the following response format:

```json
{
  "data": [...],
  "pagination": {
    "current": 1,
    "total": 5,
    "hasNext": false,
    "hasPrev": false,
    "totalCount": 25
  }
}
```
