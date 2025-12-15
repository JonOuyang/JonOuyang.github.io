#!/bin/bash
echo "🔧 Emergency Dev Server Fix"
echo "=========================="

echo "1. Killing all Vite processes..."
pkill -9 -f "node.*vite"
sleep 1

echo "2. Clearing extended attributes..."
xattr -cr src/ 2>/dev/null || echo "  ⚠️  No src/ directory found"
xattr -cr public/ 2>/dev/null || echo "  ⚠️  No public/ directory found"

echo "3. Checking package.json..."
if [ $(cat package.json | wc -c) -eq 0 ]; then
    echo "  ⚠️  package.json corrupted! Restoring from git..."
    git checkout package.json
fi

echo "4. Clearing Vite cache..."
rm -rf node_modules/.vite

echo ""
echo "✅ Fix complete! Now run: npm run dev"
