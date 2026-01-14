# Admin Authentication API Setup

## Files Created

1. ✅ `backend/middleware/auth.js` - JWT authentication middleware
2. ✅ `backend/routes/admin/auth.js` - Admin authentication routes
3. ✅ `backend/utils/hashPassword.js` - Password hashing utility
4. ✅ `backend/server.js` - Updated with admin routes

## Admin Authentication Endpoints

### POST /api/admin/auth/login
Admin login endpoint

**Request:**
```json
{
  "email": "admin@rosebudglobal.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@rosebudglobal.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin",
    "avatar": null
  }
}
```

### GET /api/admin/auth/me
Get current admin user (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@rosebudglobal.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin",
    "avatar": null,
    "lastLogin": "2024-01-01T12:00:00.000Z",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### POST /api/admin/auth/logout
Logout (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### PUT /api/admin/auth/password
Change password (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "currentPassword": "Admin@123456",
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### POST /api/admin/auth/create
Create new admin user (super_admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "email": "newadmin@rosebudglobal.com",
  "password": "Password123!",
  "firstName": "New",
  "lastName": "Admin",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created",
  "userId": 2
}
```

## Generate Password Hash

To generate a password hash for the default admin user:

```bash
cd backend
node utils/hashPassword.js "Admin@123456"
```

Or with custom password:

```bash
node utils/hashPassword.js "YourPasswordHere"
```

## Next Steps

1. Install missing npm packages (see INSTALL_PACKAGES.md)
2. Create placeholder route files for other admin endpoints (dashboard, products, categories, orders, inquiries, customers, settings, upload)
3. Update database schema with actual admin password hash
4. Test authentication endpoints

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rosebudglobal.com","password":"Admin@123456"}'

# Get current user (replace TOKEN with actual token)
curl http://localhost:3000/api/admin/auth/me \
  -H "Authorization: Bearer TOKEN"
```
