# Quick Start Guide - Local Testing

## Prerequisites Check

1. **Node.js** (v14+): `node --version`
2. **npm**: `npm --version`
3. **MySQL**: `mysql --version`

## Step-by-Step Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up MySQL Database

#### Option A: If MySQL is installed locally

1. **Start MySQL** (if not running):
   ```bash
   # Mac (Homebrew)
   brew services start mysql
   
   # Or check if running
   mysql.server status
   ```

2. **Create Database**:
   ```bash
   mysql -u root -p
   ```
   Then in MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS rosebud_global;
   USE rosebud_global;
   exit;
   ```

3. **Import Schema**:
   ```bash
   mysql -u root -p rosebud_global < database/schema.sql
   ```

#### Option B: Using phpMyAdmin or MySQL Workbench

1. Create database: `rosebud_global`
2. Import `database/schema.sql` file

### Step 3: Configure .env File

Edit `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here  # Leave empty if no password
DB_NAME=rosebud_global

JWT_SECRET=0c7222c9dc95ab2df372d067f81a7bd17c03d341bbe9fb61898efa75879e0cd4d2ef654e251b7820652cbea04c3e0282a43cae8a3f9ab98101ff22eae15821cd

GOOGLE_CLIENT_ID=987747973266-qv46fe166areqnf3p2b6uhl8imt9d6ok.apps.googleusercontent.com
PAYPAL_CLIENT_ID=AeeEJxL75ee5MYIcWJdn6P2ijEhQOTn-fqPgkQazj5xDHRJZ7_W4ibVCOkx52DzgHxQu2uueJzXR33kr

PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:8000,https://rosebudglobal.com,https://www.rosebudglobal.com
```

### Step 4: Test Database Connection

```bash
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Database connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

### Step 5: Start Backend Server

```bash
npm run dev
```

Server will start on: `http://localhost:3000`

### Step 6: Start Frontend (in another terminal)

```bash
cd ..  # Go back to root directory
python3 -m http.server 8000
```

Frontend will be on: `http://localhost:8000`

## Testing the API

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Test User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### Test Get Products

```bash
curl http://localhost:3000/api/products
```

### Test Authenticated Endpoint (with token)

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues

### MySQL Not Found
- Install MySQL: `brew install mysql` (Mac)
- Or use MySQL from XAMPP/MAMP
- Or use Docker: `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql`

### Port 3000 Already in Use
- Change PORT in `.env` to another port (e.g., 3001)
- Or kill the process: `lsof -ti:3000 | xargs kill`

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Database connection successful
- [ ] Health endpoint returns success
- [ ] User registration works
- [ ] User login works
- [ ] Get products works
- [ ] Authenticated endpoints work with token
- [ ] Frontend can connect to backend API
