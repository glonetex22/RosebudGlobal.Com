# 🎯 Get Started - Local Testing

## Current Status ✅
- ✅ Node.js v24.11.1 installed
- ✅ npm 11.6.2 installed
- ✅ Backend dependencies installed
- ✅ .env file configured
- ⚠️  MySQL needs to be installed

## Option 1: Install MySQL (Recommended)

### On Mac (using Homebrew):
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Set root password (optional, press Enter for no password)
mysql_secure_installation
```

### After MySQL is installed:

1. **Create database:**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rosebud_global;"
```

2. **Import schema:**
```bash
mysql -u root -p rosebud_global < database/schema.sql
```

3. **Update .env if you set a password:**
```bash
# Edit .env and set DB_PASSWORD=your_password
nano .env
```

4. **Test connection:**
```bash
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"
```

5. **Start server:**
```bash
npm run dev
```

## Option 2: Use Docker (Alternative)

If you prefer Docker:

```bash
# Install Docker Desktop for Mac
# Download from: https://www.docker.com/products/docker-desktop

# Start MySQL container
docker run -d --name mysql-rosebud \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=rosebud_global \
  -p 3306:3306 \
  mysql:8.0

# Wait 10 seconds
sleep 10

# Import schema
docker exec -i mysql-rosebud mysql -uroot -ppassword rosebud_global < database/schema.sql

# Update .env
# Change: DB_PASSWORD=password
```

## Option 3: Skip Database for Now (Test API Structure)

You can test the API structure without MySQL:

1. **Start server (will show DB error but server runs):**
```bash
npm run dev
```

2. **Test endpoints that don't need DB:**
```bash
curl http://localhost:3000/health
```

3. **Set up database later when ready**

## Quick Start Script

I've created a helper script:

```bash
./quick-start.sh
```

This will:
- Check for MySQL
- Set up database
- Test connection
- Start server

## After Database is Set Up

### 1. Start Backend Server
```bash
npm run dev
```

You should see:
```
🚀 RoseBud Global API server running on port 3000
✅ Database connected
```

### 2. Test API (in new terminal)
```bash
# Health check
curl http://localhost:3000/health

# Or run full test
./test-api.sh
```

### 3. Start Frontend (in new terminal)
```bash
cd ..  # Go to project root
python3 -m http.server 8000
```

Visit: **http://localhost:8000**

## Test API Endpoints

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

## Recommended Next Steps

1. **Install MySQL** (Option 1 above)
2. **Run quick-start.sh** or set up database manually
3. **Start backend**: `npm run dev`
4. **Start frontend**: `python3 -m http.server 8000` (from project root)
5. **Test features** through the frontend

## Need Help?

- Check `README.md` for detailed documentation
- Check `START_LOCAL.md` for troubleshooting
- Check `RUN_NOW.md` for quick commands
