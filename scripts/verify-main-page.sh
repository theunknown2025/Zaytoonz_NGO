#!/bin/bash

# Script to verify which page is served at root
# Run this on your VPS to check what's actually being served

set -e

echo "=== Verifying Main Page Configuration ==="
echo ""

APP_DIR="/var/www/zaytoonz-ngo"
cd "$APP_DIR"

echo "1. Checking app/page.tsx (root page code):"
if [ -f "app/page.tsx" ]; then
    echo "   ✓ File exists"
    echo "   Content preview:"
    head -20 app/page.tsx | grep -E "(redirect|ZaytoonzSMLanding|LandingPage|export default)" || echo "   (No matches found)"
else
    echo "   ✗ File not found!"
fi

echo ""
echo "2. Checking app/social/page.tsx:"
if [ -f "app/social/page.tsx" ]; then
    echo "   ✓ File exists"
    echo "   Content preview:"
    cat app/social/page.tsx | grep -E "(ZaytoonzSMLanding|LandingPage|export default)" || echo "   (No matches found)"
else
    echo "   ✗ File not found!"
fi

echo ""
echo "3. Testing HTTP response from Next.js container:"
if docker ps | grep -q "zaytoonz-nextjs"; then
    echo "   Testing root (/) endpoint:"
    curl -s -I http://localhost:3002/ | head -5 || echo "   ✗ Cannot connect to Next.js"
    
    echo ""
    echo "   Testing /social endpoint:"
    curl -s -I http://localhost:3002/social | head -5 || echo "   ✗ Cannot connect to Next.js"
    
    echo ""
    echo "   Testing /app endpoint:"
    curl -s -I http://localhost:3002/app | head -5 || echo "   ✗ Cannot connect to Next.js"
else
    echo "   ✗ Next.js container is not running"
fi

echo ""
echo "4. Checking Next.js build output:"
if [ -d ".next" ]; then
    echo "   ✓ .next directory exists"
    if [ -f ".next/server/app/page.js" ] || [ -f ".next/server/app/page.js.map" ]; then
        echo "   ✓ Root page built successfully"
    else
        echo "   ⚠ Root page build files not found"
    fi
else
    echo "   ✗ .next directory not found (app not built)"
fi

echo ""
echo "5. Checking Docker container logs (last 20 lines):"
if docker ps | grep -q "zaytoonz-nextjs"; then
    echo "   Recent Next.js logs:"
    docker logs zaytoonz-nextjs --tail 20 2>&1 | grep -E "(ready|error|page|route)" || echo "   (No relevant log entries)"
else
    echo "   ✗ Next.js container is not running"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "To test manually:"
echo "  curl -L http://localhost:3002/"
echo "  curl -L http://localhost:3002/social"
echo "  curl -L http://localhost:3002/app"
