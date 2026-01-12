# MySQL Setup Alternatives

## Issue: Homebrew MySQL Build Failed

You're encountering a build issue with Homebrew MySQL. Here are several alternatives:

## Option 1: Fix Xcode Command Line Tools (Recommended)

### Step 1: Install/Update Command Line Tools

```bash
# Remove old tools
sudo rm -rf /Library/Developer/CommandLineTools

# Install fresh
sudo xcode-select --install
```

Follow the GUI installer that appears.

### Step 2: Verify Installation

```bash
xcode-select -p
# Should show: /Library/Developer/CommandLineTools
```

### Step 3: Try MySQL Again

```bash
brew install mysql
brew services start mysql
```

## Option 2: Use MySQL Official Installer (Easier)

### Download MySQL Community Server

1. Go to: https://dev.mysql.com/downloads/mysql/
2. Download: **macOS (ARM64)** or **macOS (x86_64)** DMG
3. Install the package
4. During installation, set a root password (or leave blank)

### After Installation:

```bash
# MySQL is usually installed at:
/usr/local/mysql/bin/mysql --version

# Add to PATH (add to ~/.zshrc):
export PATH="/usr/local/mysql/bin:$PATH"

# Then create database:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rosebud_global;"
mysql -u root -p rosebud_global < database/schema.sql
```

## Option 3: Use Docker (If Available)

### Install Docker Desktop

1. Download: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop

### Run MySQL in Docker

```bash
# Start MySQL container
docker run -d --name mysql-rosebud \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=rosebud_global \
  -p 3306:3306 \
  mysql:8.0

# Wait 15 seconds for MySQL to initialize
sleep 15

# Import schema
docker exec -i mysql-rosebud mysql -uroot -ppassword rosebud_global < database/schema.sql

# Update .env file
# Change: DB_PASSWORD=password
```

## Option 4: Use XAMPP/MAMP (GUI MySQL)

### XAMPP (Free)

1. Download: https://www.apachefriends.org/
2. Install XAMPP
3. Start MySQL from XAMPP Control Panel
4. MySQL will be at: `/Applications/XAMPP/xamppfiles/bin/mysql`

```bash
# Add to PATH
export PATH="/Applications/XAMPP/xamppfiles/bin:$PATH"

# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS rosebud_global;"
mysql -u root rosebud_global < database/schema.sql
```

### MAMP (Free/Pro)

1. Download: https://www.mamp.info/
2. Install and start MAMP
3. Start MySQL from MAMP
4. Use phpMyAdmin (included) to create database and import schema

## Option 5: Use Cloud MySQL (Free Tier)

### Free MySQL Hosting Options:

1. **PlanetScale** (Free tier)
   - Sign up: https://planetscale.com
   - Create database
   - Get connection string
   - Update `.env` with connection details

2. **Railway** (Free tier)
   - Sign up: https://railway.app
   - Create MySQL service
   - Get connection string

3. **Aiven** (Free trial)
   - Sign up: https://aiven.io
   - Create MySQL service

## Option 6: Use SQLite for Testing (Simplest)

If you just want to test the API structure, we can temporarily use SQLite:

### Modify backend to use SQLite:

```bash
npm install sqlite3
```

Then we'd need to modify the database connection. This is a quick workaround for testing.

## Recommended: Option 2 (Official MySQL Installer)

The easiest path forward is:

1. **Download MySQL directly from MySQL website**
2. **Install the DMG package** (no build required)
3. **Set up database** using the commands above

This avoids Homebrew build issues entirely.

## Quick Setup After MySQL is Installed

Once MySQL is working, run:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rosebud_global;"

# Import schema
mysql -u root -p rosebud_global < database/schema.sql

# Test connection
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"

# Start server
npm run dev
```

## Which Option Should You Choose?

- **Quickest**: Option 2 (Official MySQL Installer)
- **Most Flexible**: Option 3 (Docker)
- **GUI Friendly**: Option 4 (XAMPP/MAMP)
- **No Local Install**: Option 5 (Cloud MySQL)
- **Just Testing**: Option 6 (SQLite - requires code changes)

Let me know which option you'd like to proceed with!
