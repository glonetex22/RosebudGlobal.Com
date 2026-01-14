# Demo Admin User Setup & Testing Guide

## ✅ Setup Complete

Demo admin users have been created with the following credentials:

---

## 🔐 Login Credentials

### Demo User (Admin Access)
```
Email:    demo@rosebudglobal.com
Password: Demo@123456
Role:     Admin
```

**Permissions:**
- View/Edit/Create products
- View/Update orders
- View/Respond to inquiries
- View customers
- View dashboard & reports

### Super Admin (Full Access)
```
Email:    admin@rosebudglobal.com
Password: Admin@123456
Role:     Super Admin
```

**Permissions:**
- All Admin permissions
- Delete products
- Delete orders
- Manage admin users
- Access settings
- Process refunds

---

## 🚀 Starting the Servers

### Terminal 1 - Backend Server
```bash
cd backend
npm start
```
**Server runs on:** http://localhost:3000

### Terminal 2 - Admin Dashboard
```bash
cd admin
npm run dev
```
**Admin runs on:** http://localhost:3001

### Terminal 3 - Frontend Website (Optional)
```bash
cd /Users/carletonbedell/Downloads/RosebudGlobal.Com
python -m http.server 8000
```
**Website runs on:** http://localhost:8000

---

## ✅ Testing Checklist

### 1. LOGIN
- [ ] Navigate to http://localhost:3001/login
- [ ] Enter `demo@rosebudglobal.com` / `Demo@123456`
- [ ] Verify redirect to dashboard
- [ ] Test logout functionality
- [ ] Test with super admin credentials

### 2. DASHBOARD
- [ ] View stats cards (Products, Orders, Revenue, Customers, Inquiries, Low Stock)
- [ ] Verify sales chart displays correctly
- [ ] View recent orders table
- [ ] View top products list
- [ ] Check that data loads from API

### 3. PRODUCTS
- [ ] View product list page
- [ ] Test search functionality
- [ ] Test status filter
- [ ] Test category filter
- [ ] Create new product with images
- [ ] Edit existing product
- [ ] Update product status
- [ ] Test bulk actions (select multiple, activate/deactivate)
- [ ] Delete product (super admin only)
- [ ] Test pagination

### 4. ORDERS
- [ ] View order list
- [ ] Filter by status
- [ ] View order details
- [ ] Update order status
- [ ] Add tracking number
- [ ] View order items
- [ ] Test order search

### 5. INQUIRIES
- [ ] View inquiry list
- [ ] View inquiry details
- [ ] Respond to inquiry
- [ ] Convert inquiry to order
- [ ] Update inquiry status
- [ ] Filter inquiries

### 6. CATEGORIES
- [ ] View category list
- [ ] Create new category
- [ ] Edit category
- [ ] Delete category
- [ ] Test category hierarchy (parent/child)

### 7. CUSTOMERS
- [ ] View customer list
- [ ] View customer details
- [ ] View customer orders
- [ ] View customer addresses
- [ ] Search customers

### 8. SETTINGS
- [ ] View settings page
- [ ] Update settings (super admin only)
- [ ] Test settings persistence

---

## 🔧 Running the Demo User Script

If you need to recreate or update the demo users:

```bash
cd backend
node scripts/createDemoUser.js
```

This script will:
- Generate password hashes
- Create or update demo user
- Create or update super admin
- Display credentials for testing

---

## 📝 API Testing

### Test Login Endpoint
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@rosebudglobal.com",
    "password": "Demo@123456"
  }'
```

### Test Protected Endpoint (with token)
```bash
curl -X GET http://localhost:3000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚠️ Production Security Notes

**BEFORE DEPLOYING TO PRODUCTION:**

1. **Change Default Passwords**
   - Update `demo@rosebudglobal.com` password
   - Update `admin@rosebudglobal.com` password
   - Or delete demo user entirely

2. **Update JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   - Update `JWT_SECRET` in `.env` with generated value

3. **Environment Variables**
   - Never commit `.env` files to git
   - Use environment variables in hosting platform
   - Add `.env` to `.gitignore`

4. **HTTPS**
   - Always use HTTPS in production
   - Update CORS settings for production domain
   - Update API base URL in admin dashboard

5. **Database**
   - Use strong database passwords
   - Limit database user permissions
   - Enable SSL for database connections
   - Regular database backups

6. **Rate Limiting**
   - Implement rate limiting on login endpoints
   - Add CAPTCHA for login attempts
   - Monitor failed login attempts

---

## 🐛 Troubleshooting

### Login Not Working
- Check database connection in `.env`
- Verify `admin_users` table exists
- Check password hash format
- Verify JWT_SECRET is set

### API Errors
- Check backend server is running
- Verify CORS settings
- Check API routes are registered
- Review server logs

### Dashboard Not Loading
- Check API endpoints are accessible
- Verify authentication token is valid
- Check browser console for errors
- Verify API base URL in admin config

---

## 📚 Related Files

- `backend/scripts/createDemoUser.js` - Script to create demo users
- `backend/database/schema.sql` - Database schema with default users
- `backend/.env` - Environment variables
- `admin/src/services/api.js` - API service configuration

---

## ✨ Quick Start Commands

```bash
# 1. Start Backend
cd backend && npm start

# 2. Start Admin Dashboard (new terminal)
cd admin && npm run dev

# 3. Access Admin Dashboard
# Open http://localhost:3001/login
# Login with: demo@rosebudglobal.com / Demo@123456
```

---

**Last Updated:** $(date)
**Status:** ✅ Ready for Testing
