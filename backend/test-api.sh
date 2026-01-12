#!/bin/bash

# API Testing Script for RoseBud Global Backend

API_URL="http://localhost:3000"

echo "🧪 Testing RoseBud Global API"
echo "================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
curl -s "$API_URL/health" | jq '.' || curl -s "$API_URL/health"
echo ""
echo ""

# Test 2: Register User
echo "2️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }')

echo "$REGISTER_RESPONSE" | jq '.' || echo "$REGISTER_RESPONSE"

# Extract token if registration successful
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "⚠️  Registration may have failed or user already exists. Trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "password123"
    }')
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo ""
echo ""

# Test 3: Get Current User (if token exists)
if [ ! -z "$TOKEN" ]; then
  echo "3️⃣  Testing Get Current User (Authenticated)..."
  curl -s "$API_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || curl -s "$API_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"
  echo ""
  echo ""
fi

# Test 4: Get Products
echo "4️⃣  Testing Get Products..."
curl -s "$API_URL/api/products" | jq '.' || curl -s "$API_URL/api/products"
echo ""
echo ""

# Test 5: Create Inquiry
echo "5️⃣  Testing Create Inquiry..."
curl -s -X POST "$API_URL/api/inquiries" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test inquiry",
    "products": []
  }' | jq '.' || curl -s -X POST "$API_URL/api/inquiries" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test inquiry",
    "products": []
  }'

echo ""
echo ""
echo "✅ API Testing Complete!"
echo ""
echo "💡 Tip: Install 'jq' for better JSON formatting: brew install jq"
