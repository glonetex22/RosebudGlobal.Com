# 🚀 Extract and Run - Quick Start Guide

## Step 1: Extract the ZIP File

Extract `rosebud-global-backend.zip` to your desired location.

## Step 2: Install Dependencies

Open terminal in the extracted folder and run:

```bash
npm install
```

## Step 3: Set Up MySQL Database

### Option A: If MySQL is Already Installed

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rosebud_global;"

# Import schema
mysql -u root -p rosebud_global < database/schema.sql
```

### Option B: Install MySQL First

**Mac:**
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Install the DMG package
3. Then run Option A commands above

**Windows:**
1. Download MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Install MySQL
3. Use MySQL Workbench or Command Prompt to:
   - Create database: `rosebud_global`
   - Import `database/schema.sql`

## Step 4: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   - Set `DB_PASSWORD=` (your MySQL password, or leave empty if no password)
   - `JWT_SECRET` is already set (you can regenerate if needed)

## Step 5: Test Database Connection

```bash
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Database connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

## Step 6: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 RoseBud Global API server running on port 3000
✅ Database connected
```

## Step 7: Test the API

Open a new terminal and run:

```bash
# Health check
curl http://localhost:3000/health

# Or use the test script
./test-api.sh
```

## Troubleshooting

### "Module not found"
- Run: `npm install`

### "Database connection error"
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `rosebud_global` exists

### "Port 3000 already in use"
- Change `PORT=3001` in `.env`
- Or kill the process: `lsof -ti:3000 | xargs kill` (Mac/Linux)

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/products` - Get products
- `POST /api/orders` - Create order (requires auth)
- `POST /api/inquiries` - Create inquiry

See `README.md` for full API documentation.

## Need Help?

Check these files:
- `README.md` - Full documentation
- `GET_STARTED.md` - Detailed setup guide
- `MYSQL_SETUP_ALTERNATIVES.md` - MySQL installation options
