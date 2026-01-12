#!/bin/bash

echo "🚀 RoseBud Global - Quick Start"
echo "================================"
echo ""

# Check if MySQL is available
if command -v mysql &> /dev/null; then
  echo "✅ MySQL found"
  MYSQL_AVAILABLE=true
elif [ -f "/usr/local/mysql/bin/mysql" ]; then
  echo "✅ MySQL found at /usr/local/mysql/bin/mysql"
  export PATH="/usr/local/mysql/bin:$PATH"
  MYSQL_AVAILABLE=true
elif [ -f "/Applications/XAMPP/xamppfiles/bin/mysql" ]; then
  echo "✅ MySQL found at /Applications/XAMPP/xamppfiles/bin/mysql"
  export PATH="/Applications/XAMPP/xamppfiles/bin:$PATH"
  MYSQL_AVAILABLE=true
else
  echo "⚠️  MySQL not found in PATH"
  MYSQL_AVAILABLE=false
fi

# Set up database
if [ "$MYSQL_AVAILABLE" = true ]; then
  echo ""
  echo "Setting up database..."
  echo "Enter MySQL root password (press Enter if no password):"
  read -s MYSQL_PASSWORD
  
  if [ -z "$MYSQL_PASSWORD" ]; then
    MYSQL_CMD="mysql -u root"
  else
    MYSQL_CMD="mysql -u root -p$MYSQL_PASSWORD"
  fi
  
  echo "Creating database..."
  $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS rosebud_global;" 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "✅ Database created"
    echo "Importing schema..."
    $MYSQL_CMD rosebud_global < database/schema.sql 2>/dev/null
    if [ $? -eq 0 ]; then
      echo "✅ Schema imported"
    else
      echo "❌ Schema import failed"
      exit 1
    fi
  else
    echo "❌ Database creation failed"
    exit 1
  fi
else
  echo ""
  echo "⚠️  Please set up MySQL database manually:"
  echo "   1. Install MySQL: brew install mysql"
  echo "   2. Or use Docker: docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:8.0"
  echo "   3. Then run: mysql -u root -p < database/schema.sql"
  echo ""
  read -p "Press Enter to continue anyway (you can set up DB later)..."
fi

# Test database connection
echo ""
echo "Testing database connection..."
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Database connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 Setup complete! Starting server..."
  echo ""
  npm run dev
else
  echo ""
  echo "⚠️  Database connection failed. Please check your .env file and MySQL setup."
  echo "   You can start the server anyway with: npm run dev"
fi
