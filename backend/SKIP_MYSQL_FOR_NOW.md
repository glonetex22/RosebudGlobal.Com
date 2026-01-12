# Skip MySQL Setup for Now - Test API Structure

Since MySQL isn't installed yet, you can still test the API structure without the database.

## Option 1: Test API Without Database (Quick Test)

The server will start but show database connection errors. You can still test the API endpoints that don't require database.

### Start Server (will show DB error but runs):
```bash
cd ~/Downloads/RosebudGlobal.Com/backend
npm run dev
```

### Test Health Endpoint:
```bash
curl http://localhost:3000/health
```

This will work even without MySQL!

## Option 2: Install MySQL (Recommended)

### Easiest: Official MySQL Installer

1. **Download MySQL:**
   - Go to: https://dev.mysql.com/downloads/mysql/
   - Select: **macOS** → **ARM64** (for M1/M2 Mac) or **x86_64** (for Intel Mac)
   - Download the **DMG Archive** (not the source code)

2. **Install:**
   - Open the DMG file
   - Run the installer
   - During setup, you can set a root password or leave it blank

3. **After Installation:**
   ```bash
   # Add MySQL to PATH (add to ~/.zshrc)
   export PATH="/usr/local/mysql/bin:$PATH"
   
   # Reload shell
   source ~/.zshrc
   
   # Then create database
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rosebud_global;"
   mysql -u root -p rosebud_global < database/schema.sql
   ```

## Option 3: Use Cloud MySQL (No Local Install)

### Free Options:

1. **PlanetScale** (Free tier)
   - Sign up: https://planetscale.com
   - Create database
   - Get connection string
   - Update `.env` with connection details

2. **Railway** (Free tier)
   - Sign up: https://railway.app
   - Create MySQL service
   - Get connection string

## Option 4: Use Docker (If You Have It)

```bash
# Check if Docker is installed
docker --version

# If yes, run MySQL in Docker:
docker run -d --name mysql-rosebud \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=rosebud_global \
  -p 3306:3306 \
  mysql:8.0

# Wait 15 seconds, then import schema
sleep 15
docker exec -i mysql-rosebud mysql -uroot -ppassword rosebud_global < database/schema.sql

# Update .env: DB_PASSWORD=password
```

## For Now: Test Without Database

You can start the server and test the API structure:

```bash
cd ~/Downloads/RosebudGlobal.Com/backend
npm run dev
```

The server will show a database connection error, but it will still run. You can test:
- `GET /health` - Will work
- Other endpoints will fail without database, but you can see the API structure

## Recommended Next Step

**Install MySQL using the official installer** (Option 2 above) - it's the easiest and most reliable method.

After MySQL is installed, come back and run the database setup commands.
