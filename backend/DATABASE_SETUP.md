# RoseBud Global Database Setup Guide

## Database Schema Setup

### Step 1: Create Database

1. Log into your Hostinger MySQL database (via phpMyAdmin or command line)
2. Create a new database:
   ```sql
   CREATE DATABASE rosebud_global CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Step 2: Import Schema

#### Option A: Using MySQL Command Line
```bash
mysql -u your_username -p rosebud_global < backend/database/schema.sql
```

#### Option B: Using phpMyAdmin
1. Log into phpMyAdmin
2. Select the `rosebud_global` database
3. Go to the "Import" tab
4. Choose the file `backend/database/schema.sql`
5. Click "Go" to import

### Step 3: Update Environment Variables

Add these variables to `backend/.env`:

```env
# MySQL Database (Hostinger)
DB_HOST=your_hostinger_mysql_host
DB_PORT=3306
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=rosebud_global

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Admin Default Password (change after first login)
DEFAULT_ADMIN_PASSWORD=Admin@123456
```

### Step 4: Set Admin Password

After importing the schema, you need to set the admin user password.

1. Generate a bcrypt hash for your password (password: Admin@123456)
2. Update the admin_users table:
   ```sql
   UPDATE admin_users 
   SET password = '$2b$10$YOUR_BCRYPT_HASH_HERE' 
   WHERE email = 'admin@rosebudglobal.com';
   ```

Or use Node.js to generate the hash:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('Admin@123456', 10);
console.log(hash);
```

### Step 5: Verify Connection

Test the database connection:
```bash
cd backend
node -e "require('./config/db.js');"
```

## Database Tables

The schema includes the following tables:

1. **admin_users** - CMS admin users
2. **categories** - Product categories
3. **products** - Product catalog
4. **product_images** - Product images
5. **customers** - Customer accounts
6. **customer_addresses** - Customer shipping/billing addresses
7. **orders** - Order records
8. **order_items** - Order line items
9. **inquiries** - Customer inquiries
10. **inquiry_items** - Inquiry product items
11. **reviews** - Product reviews
12. **newsletter_subscribers** - Newsletter subscribers
13. **settings** - Site settings
14. **activity_logs** - Admin activity logs

## Default Data

The schema includes default data for:
- 1 Super Admin user (admin@rosebudglobal.com)
- 6 Product categories
- 9 Site settings

**IMPORTANT:** Update the admin password hash before using in production!
