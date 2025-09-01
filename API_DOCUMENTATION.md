## Admin Routes

### Dashboard & Overview

- `GET /api/admin/dashboard` - Get admin dashboard overview with statistics
- `GET /api/admin/stats` - Get system statistics over different periods
- `GET /api/admin/system-health` - Get system health and performance metrics

### Vendor Management

- `GET /api/admin/vendors` - Get all vendors with pagination and filters
- `GET /api/admin/vendors/:id` - Get detailed vendor information
- `PUT /api/admin/approve-vendor/:id` - Approve or reject a vendor
- `POST /api/admin/bulk-approve-vendors` - Bulk approve/reject multiple vendors

### Event Plan Management

- `GET /api/admin/event-plans` - Get all event plans with pagination

### Testimonial Management

- `GET /api/admin/testimonials` - Get all testimonials for admin review
- `PUT /api/admin/testimonials/:id/approve` - Approve or reject testimonials

### Service Management

- `GET /api/admin/services` - Get all services for admin review
- `PUT /api/admin/services/:id/toggle` - Toggle service active/inactive status

### User Management

- `DELETE /api/admin/users/:id` - Delete users (with safety checks)

**Note**: Admin routes focus on **managing existing data** (vendors, services, testimonials, event plans) rather than creating new ones. The admin system provides oversight, approval, and status management capabilities.

## User Routes

### Profile Management

- `GET /api/user/profile` - Get user profile (returns: id, name, email, role, phone, address, isApproved, timestamps)
- `PUT /api/user/profile` - Update user details (name, phone, address) with validation
- `DELETE /api/user/profile` - Delete user account (with safety checks for active event plans)

### Cart & Purchases

- `GET /api/user/cart` - View user's current cart (planning stage event plan)
- `GET /api/user/purchases` - View user's purchase history (confirmed/completed event plans)
