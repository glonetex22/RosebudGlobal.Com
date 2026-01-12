# 🚀 Start Local Testing - Step by Step

## Current Status ✅

- ✅ Node.js v24.11.1 installed
- ✅ npm 11.6.2 installed  
- ✅ Dependencies installed
- ✅ .env file exists
- ⚠️  MySQL setup needed

## Quick Start Commands

### 1. Set Up Database

**Option A: If MySQL is installed (but not in PATH):**
```bash
# Find MySQL (common locations on Mac)
/usr/local/mysql/bin/mysql --version
# or
/Applications/XAMPP/xamppfiles/bin/mysql --version
```

**Option B: Use the setup script:**
```bash
./setup-db.sh
```

**Option C: Manual setup:**
```bash
# If MySQL is accessible
mysql -u root -p
# Then in MySQL:
CREATE DATABASE IF NOT EXISTS rosebud_global;
USE rosebud_global;
source database/schema.sql;
exit;
```

**Option D: Use Docker (if MySQL not installed):**
```bash
docker run -d --name mysql-rosebud \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=rosebud_global \
  -p 3306:3306 \
  mysql:8.0

# Wait a few seconds, then import schema
docker exec -i mysql-rosebud mysql -uroot -ppassword rosebud_global < database/schema.sql
```

### 2. Verify .env Configuration

Check your `.env` file has:
- ✅ `DB_PASSWORD=` (empty if no password, or your MySQL password)
- ✅ `JWT_SECRET=` (should have the generated secret)

### 3. Test Database Connection

```bash
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Database connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

### 4. Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 RoseBud Global API server running on port 3000
✅ Database connected
```

### 5. Test API (in another terminal)

```bash
# Simple health check
curl http://localhost:3000/health

# Or run the test script
./test-api.sh
```

### 6. Start Frontend (in another terminal)

```bash
cd ..  # Go to project root
python3 -m http.server 8000
```

Visit: `http://localhost:8000`

## Testing Endpoints

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

### Get Current User (replace TOKEN)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### "MySQL not found"
- Install: `brew install mysql` (Mac)
- Or use Docker (see Option D above)
- Or use XAMPP/MAMP MySQL

### "Database connection error"
- Check MySQL is running: `brew services list` (Mac)
- Verify credentials in `.env`
- Test connection: `mysql -u root -p`

### "Port 3000 already in use"
- Change PORT in `.env` to 3001
- Or kill process: `lsof -ti:3000 | xargs kill`

### "Module not found"
- Run: `npm install`

## Next Steps After Setup

1. ✅ Backend running on port 3000
2. ✅ Frontend running on port 8000
3. ✅ Database connected
4. ⚠️  Update frontend to use backend API (currently uses localStorage)
5. ⚠️  Test OAuth flows
6. ⚠️  Test order creation
7. ⚠️  Test inquiry submission
