# Backend Setup Instructions

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Database

### Option A: Using MySQL Command Line

1. Login to MySQL:
```bash
mysql -u root -p
```

2. Create database:
```sql
CREATE DATABASE rosebud_global;
USE rosebud_global;
```

3. Exit MySQL:
```sql
exit;
```

4. Import schema:
```bash
mysql -u root -p rosebud_global < database/schema.sql
```

### Option B: Using phpMyAdmin (Hostinger)

1. Log into phpMyAdmin via Hostinger control panel
2. Create new database: `rosebud_global`
3. Import `database/schema.sql` file

## Step 3: Configure Environment Variables

The `.env` file should already exist (from `cp .env.example .env`).

### Edit the .env file with your settings:

**On Mac/Linux:**
```bash
nano .env
# or
open -e .env
# or use any text editor
```

**On Windows:**
```bash
notepad .env
```

### Required Settings:

1. **Database Configuration:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rosebud_global
```

2. **Generate JWT Secret:**
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` in your `.env` file:
```env
JWT_SECRET=paste-generated-secret-here
```

3. **OAuth Client IDs** (already configured):
```env
GOOGLE_CLIENT_ID=987747973266-qv46fe166areqnf3p2b6uhl8imt9d6ok.apps.googleusercontent.com
PAYPAL_CLIENT_ID=AeeEJxL75ee5MYIcWJdn6P2ijEhQOTn-fqPgkQazj5xDHRJZ7_W4ibVCOkx52DzgHxQu2uueJzXR33kr
```

### Complete .env Example:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=rosebud_global

# JWT Secret Key (generate using command above)
JWT_SECRET=your-generated-secret-here

# OAuth Client IDs
GOOGLE_CLIENT_ID=987747973266-qv46fe166areqnf3p2b6uhl8imt9d6ok.apps.googleusercontent.com
PAYPAL_CLIENT_ID=AeeEJxL75ee5MYIcWJdn6P2ijEhQOTn-fqPgkQazj5xDHRJZ7_W4ibVCOkx52DzgHxQu2uueJzXR33kr

# Payment Gateway (optional)
STRIPE_SECRET_KEY=

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Origins
CORS_ORIGINS=http://localhost:8000,https://rosebudglobal.com,https://www.rosebudglobal.com
```

## Step 4: Test Database Connection

```bash
node -e "require('dotenv').config(); const pool = require('./config/db'); pool.getConnection().then(() => { console.log('✅ Database connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

## Step 5: Start the Server

### Development (with auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server should start on `http://localhost:3000`

## Step 6: Test the API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "success": true,
  "message": "RoseBud Global API is running",
  "timestamp": "..."
}
```

## Troubleshooting

### MySQL Connection Error
- Make sure MySQL is running: `mysql.server start` (Mac) or check MySQL service (Windows)
- Verify database credentials in `.env`
- Ensure database `rosebud_global` exists

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 3000

### Module Not Found
- Run `npm install` to install dependencies

## Next Steps

1. ✅ Dependencies installed
2. ✅ Database created
3. ✅ Schema imported
4. ⚠️  **Edit `.env` file with your database credentials**
5. ⚠️  **Generate and add JWT_SECRET**
6. ✅ Start server
7. ✅ Test API
