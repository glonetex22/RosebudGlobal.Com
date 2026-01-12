#!/bin/bash

echo "🔍 Finding MySQL installation..."

# Check common locations
MYSQL_PATHS=(
  "/usr/local/mysql/bin/mysql"
  "/Applications/XAMPP/xamppfiles/bin/mysql"
  "/opt/homebrew/bin/mysql"
  "/usr/bin/mysql"
)

MYSQL_FOUND=""

for path in "${MYSQL_PATHS[@]}"; do
  if [ -f "$path" ]; then
    MYSQL_FOUND="$path"
    echo "✅ Found MySQL at: $path"
    break
  fi
done

if [ -z "$MYSQL_FOUND" ]; then
  echo "❌ MySQL not found in common locations"
  echo ""
  echo "Please find MySQL installation and add to PATH:"
  echo "  export PATH=\"/path/to/mysql/bin:\$PATH\""
  exit 1
fi

# Get directory
MYSQL_DIR=$(dirname "$MYSQL_FOUND")
echo ""
echo "Adding to PATH..."
echo "export PATH=\"$MYSQL_DIR:\$PATH\"" >> ~/.zshrc
export PATH="$MYSQL_DIR:$PATH"

echo "✅ MySQL added to PATH"
echo ""
echo "Testing MySQL..."
mysql --version

echo ""
echo "✅ Setup complete! You can now use 'mysql' command"
