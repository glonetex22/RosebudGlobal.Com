#!/bin/bash

echo "🍎 MySQL Setup for macOS"
echo "========================"
echo ""
echo "This script helps you set up MySQL using the official installer"
echo ""

# Check if MySQL is already installed
if command -v mysql &> /dev/null; then
  echo "✅ MySQL found: $(mysql --version)"
  read -p "Do you want to use existing MySQL? (y/n): " use_existing
  if [ "$use_existing" = "y" ]; then
    MYSQL_CMD="mysql"
  else
    MYSQL_CMD=""
  fi
elif [ -f "/usr/local/mysql/bin/mysql" ]; then
  echo "✅ MySQL found at /usr/local/mysql/bin/mysql"
  export PATH="/usr/local/mysql/bin:$PATH"
  MYSQL_CMD="mysql"
else
  echo "⚠️  MySQL not found"
  echo ""
  echo "Please install MySQL first:"
  echo "1. Download from: https://dev.mysql.com/downloads/mysql/"
  echo "2. Install the DMG package"
  echo "3. Run this script again"
  echo ""
  exit 1
fi

if [ ! -z "$MYSQL_CMD" ]; then
  echo ""
  echo "Setting up database..."
  echo "Enter MySQL root password (press Enter if no password):"
  read -s MYSQL_PASSWORD
  
  if [ -z "$MYSQL_PASSWORD" ]; then
    MYSQL_CMD_FULL="$MYSQL_CMD -u root"
  else
    MYSQL_CMD_FULL="$MYSQL_CMD -u root -p$MYSQL_PASSWORD"
  fi
  
  echo "Creating database..."
  $MYSQL_CMD_FULL -e "CREATE DATABASE IF NOT EXISTS rosebud_global;" 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "✅ Database created"
    echo "Importing schema..."
    $MYSQL_CMD_FULL rosebud_global < database/schema.sql 2>/dev/null
    if [ $? -eq 0 ]; then
      echo "✅ Schema imported successfully"
      echo ""
      echo "🎉 Database setup complete!"
      echo ""
      echo "Next steps:"
      echo "1. Update .env if you set a password: DB_PASSWORD=your_password"
      echo "2. Test connection: node -e \"require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });\""
      echo "3. Start server: npm run dev"
    else
      echo "❌ Schema import failed"
      exit 1
    fi
  else
    echo "❌ Database creation failed"
    exit 1
  fi
fi
