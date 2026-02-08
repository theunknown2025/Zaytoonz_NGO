#!/bin/bash
# Diagnostic script to check why LandingPage shows instead of SM page

echo "🔍 Root Page Diagnostic Script"
echo "================================"
echo ""

cd /opt/zaytoonz-ngo

echo "1️⃣  Checking app/page.tsx file..."
echo "-----------------------------------"
if [ -f "app/page.tsx" ]; then
    echo "✅ File exists"
    echo ""
    echo "Content:"
    cat app/page.tsx
    echo ""
    echo ""
    
    # Check what component is imported
    if grep -q "ZaytoonzSMLanding" app/page.tsx; then
        echo "✅ CORRECT: Imports ZaytoonzSMLanding"
    else
        echo "❌ WRONG: Does NOT import ZaytoonzSMLanding"
    fi
    
    if grep -q "LandingPage" app/page.tsx; then
        echo "❌ WRONG: Imports LandingPage (should NOT be here)"
    else
        echo "✅ CORRECT: Does NOT import LandingPage"
    fi
else
    echo "❌ File does NOT exist!"
fi

echo ""
echo "2️⃣  Checking if .next build exists..."
echo "-----------------------------------"
if [ -d ".next" ]; then
    echo "✅ .next directory exists"
    echo "Size: $(du -sh .next | cut -f1)"
    echo ""
    
    # Check built page
    if [ -f ".next/server/app/page.js" ]; then
        echo "✅ Built page exists: .next/server/app/page.js"
        echo ""
        echo "Checking built content (first 50 lines):"
        head -50 .next/server/app/page.js | grep -E "ZaytoonzSMLanding|LandingPage|export" || echo "No matches found"
    else
        echo "❌ Built page does NOT exist"
    fi
    
    # Check route manifest
    if [ -f ".next/routes-manifest.json" ]; then
        echo ""
        echo "Routes manifest:"
        cat .next/routes-manifest.json | grep -A 5 '"pages"' | head -20
    fi
else
    echo "ℹ️  .next directory does NOT exist (needs build)"
fi

echo ""
echo "3️⃣  Checking Docker container..."
echo "-----------------------------------"
if docker ps | grep -q "zaytoonz-nextjs"; then
    echo "✅ Container is running"
    
    # Check what's in the container
    echo ""
    echo "Checking app/page.tsx in container:"
    docker exec zaytoonz-nextjs cat /app/app/page.tsx 2>/dev/null | head -20 || echo "Cannot read file"
    
    echo ""
    echo "Checking .next in container:"
    docker exec zaytoonz-nextjs ls -la /app/.next/server/app/ 2>/dev/null | head -10 || echo "Cannot list directory"
    
    echo ""
    echo "Checking built page in container:"
    docker exec zaytoonz-nextjs cat /app/.next/server/app/page.js 2>/dev/null | grep -E "ZaytoonzSMLanding|LandingPage" | head -5 || echo "No matches found"
else
    echo "❌ Container is NOT running"
fi

echo ""
echo "4️⃣  Testing actual HTTP response..."
echo "-----------------------------------"
echo "Testing root URL:"
curl -s http://localhost:3001 | grep -o -E "zaytoonz-sm-root|LandingPage|Fueling Social Impact" | head -5 || echo "No matches found"

echo ""
echo "5️⃣  Checking environment variables..."
echo "-----------------------------------"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    if grep -q "NEXT_PUBLIC_BASE_PATH" .env; then
        echo "⚠️  NEXT_PUBLIC_BASE_PATH is set:"
        grep "NEXT_PUBLIC_BASE_PATH" .env
        echo "   (This might affect routing if set to /app or similar)"
    else
        echo "✅ NEXT_PUBLIC_BASE_PATH is not set (correct)"
    fi
else
    echo "❌ .env file does NOT exist"
fi

echo ""
echo "6️⃣  Checking Git status..."
echo "-----------------------------------"
echo "Current branch:"
git branch --show-current 2>/dev/null || echo "Not a git repo"
echo ""
echo "Last commit:"
git log -1 --oneline 2>/dev/null || echo "Cannot get git info"
echo ""
echo "File status:"
git status app/page.tsx 2>/dev/null || echo "Cannot get git status"

echo ""
echo "================================"
echo "✅ Diagnostic complete!"
echo ""
echo "If app/page.tsx shows ZaytoonzSMLanding but you still see LandingPage:"
echo "1. Remove .next folder: rm -rf .next"
echo "2. Rebuild: docker compose -f docker-compose.production.yml up -d --build nextjs"
