#!/bin/bash

echo "🗄️  Setting up RoseBud Global Database"
echo "======================================="
echo ""

# Check if MySQL is accessible
if ! command -v mysql &> /dev/null; then
  echo "⚠️  MySQL command not found in PATH"
  echo ""
  echo "Please choose an option:"
  echo "1. MySQL is installed but not in PATH (add to PATH)"
  echo "2. Install MySQL: brew install mysql (Mac)"
  echo "3. Use MySQL from XAMPP/MAMP"
  echo "4. Use Docker: docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql"
  echo ""
  echo "Or manually create the database:"
  echo "  - Database name: rosebud_global"
  echo "  - Import file: database/schema.sql"
  exit 1
fi

echo "Enter MySQL root password (press Enter if no password):"
read -s MYSQL_PASSWORD

if [ -z "$MYSQL_PASSWORD" ]; then
  MYSQL_CMD="mysql -u root"
else
  MYSQL_CMD="mysql -u root -p$MYSQL_PASSWORD"
fi

echo ""
echo "Creating database..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS rosebud_global;" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Database created"
else
  echo "❌ Failed to create database. Check your MySQL credentials."
  exit 1
fi

echo "Importing schema..."
$MYSQL_CMD rosebud_global < database/schema.sql 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Schema imported successfully"
  echo ""
  echo "🎉 Database setup complete!"
else
  echo "❌ Failed to import schema"
  exit 1
fi
