# 🎯 Run Project Now - Quick Commands

## Current Status ✅
- ✅ Node.js & npm installed
- ✅ Dependencies installed  
- ✅ .env configured
- ⚠️  Need MySQL database

## Step 1: Set Up MySQL Database

### Option A: If you have MySQL installed

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rosebud_global;"

# Import schema
mysql -u root -p rosebud_global < database/schema.sql
```

### Option B: Use Docker (if MySQL not installed)

```bash
# Start MySQL in Docker
docker run -d --name mysql-rosebud \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=rosebud_global \
  -p 3306:3306 \
  mysql:8.0

# Wait 10 seconds for MySQL to start, then import schema
sleep 10
docker exec -i mysql-rosebud mysql -uroot -ppassword rosebud_global < database/schema.sql

# Update .env with Docker MySQL password
# DB_PASSWORD=password
```

### Option C: Use setup script

```bash
./setup-db.sh
```

## Step 2: Test Database Connection

```bash
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Database connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

## Step 3: Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
🚀 RoseBud Global API server running on port 3000
📡 Environment: development
🌐 CORS origins: http://localhost:8000,https://rosebudglobal.com,https://www.rosebudglobal.com
✅ Database connected
```

## Step 4: Test API (in new terminal)

```bash
# Health check
curl http://localhost:3000/health

# Or run full test suite
./test-api.sh
```

## Step 5: Start Frontend (in new terminal)

```bash
cd ..  # Go to project root
python3 -m http.server 8000
```

Visit: **http://localhost:8000**

## Quick Test Commands

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Products
```bash
curl http://localhost:3000/api/products
```

## All-in-One Setup (if MySQL is ready)

```bash
# 1. Test database
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ DB OK'); process.exit(0); }).catch(e => { console.error('❌ DB Error'); process.exit(1); });"

# 2. Start server (if DB test passes)
npm run dev
```

## Troubleshooting

**MySQL not found?**
- Install: `brew install mysql` (Mac)
- Or use Docker (see Option B above)

**Port 3000 in use?**
- Change PORT in `.env` to 3001
- Or: `lsof -ti:3000 | xargs kill`

**Database connection error?**
- Check MySQL is running
- Verify DB_PASSWORD in `.env`
- Test: `mysql -u root -p`
