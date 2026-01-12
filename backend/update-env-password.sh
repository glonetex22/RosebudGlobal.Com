#!/bin/bash

echo "🔐 Update MySQL Password in .env"
echo "================================"
echo ""

echo "Enter your MySQL root password:"
read -s mysql_password

if [ -z "$mysql_password" ]; then
  echo "⚠️  No password entered. MySQL requires a password."
  echo "   You may need to reset MySQL password or create a new user."
  exit 1
fi

# Update .env file
if [ -f ".env" ]; then
  # Use sed to update DB_PASSWORD
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^DB_PASSWORD=.*/DB_PASSWORD=$mysql_password/" .env
  else
    # Linux
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$mysql_password/" .env
  fi
  
  echo "✅ .env file updated with password"
  echo ""
  echo "Testing connection..."
  node -e "require('dotenv').config(); require('./config/db').getConnection().then(() => { console.log('✅ Database connected!'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"
else
  echo "❌ .env file not found"
  exit 1
fi
