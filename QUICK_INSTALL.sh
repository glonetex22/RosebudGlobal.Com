#!/bin/bash

# RoseBud Global Backend - Quick Install Script
# Run this script from the extracted backend folder

echo "🚀 RoseBud Global Backend - Quick Install"
echo "=========================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend folder"
    echo "   cd path/to/extracted/backend"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Step 2: Set up .env
if [ ! -f ".env" ]; then
    echo "📝 Step 2: Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and set your MySQL password if needed"
else
    echo "✅ .env file already exists"
fi
echo ""

# Step 3: Database setup
echo "🗄️  Step 3: Database setup"
echo ""
echo "Do you want to set up the database now? (y/n)"
read -r setup_db

if [ "$setup_db" = "y" ] || [ "$setup_db" = "Y" ]; then
    echo "Enter MySQL root password (press Enter if no password):"
    read -s mysql_password
    
    if [ -z "$mysql_password" ]; then
        mysql_cmd="mysql -u root"
    else
        mysql_cmd="mysql -u root -p$mysql_password"
    fi
    
    echo "Creating database..."
    $mysql_cmd -e "CREATE DATABASE IF NOT EXISTS rosebud_global;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Database created"
        echo "Importing schema..."
        $mysql_cmd rosebud_global < database/schema.sql 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Schema imported"
        else
            echo "❌ Schema import failed"
            echo "You can import manually: mysql -u root -p rosebud_global < database/schema.sql"
        fi
    else
        echo "❌ Database creation failed"
        echo "Please set up database manually"
    fi
else
    echo "⏭️  Skipping database setup"
    echo "You can set it up later with:"
    echo "  mysql -u root -p -e 'CREATE DATABASE rosebud_global;'"
    echo "  mysql -u root -p rosebud_global < database/schema.sql"
fi
echo ""

# Step 4: Test connection
echo "🔍 Step 4: Testing database connection..."
node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Database connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); console.log('⚠️  Please check your .env file and MySQL setup'); process.exit(1); });"

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. If database test failed, check your .env file and MySQL setup"
echo "2. Start the server: npm run dev"
echo "3. Test API: curl http://localhost:3000/health"
