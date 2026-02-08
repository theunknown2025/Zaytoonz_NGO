#!/bin/bash
# Fix Build and Verify - Ensures correct build output

set -e

echo "🔧 Fix Build and Verify Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify source file
echo "📄 Step 1: Verifying source file (app/page.tsx)..."
if [ -f "app/page.tsx" ]; then
    if grep -q "ZaytoonzSMLanding" app/page.tsx && ! grep -q "LandingPage" app/page.tsx; then
        echo -e "${GREEN}✅ Source file is CORRECT${NC}"
    else
        echo -e "${RED}❌ Source file is INCORRECT!${NC}"
        echo "   Expected: ZaytoonzSMLanding"
        echo "   Found: LandingPage (should not be here)"
        exit 1
    fi
else
    echo -e "${RED}❌ Source file NOT FOUND!${NC}"
    exit 1
fi

echo ""

# Step 2: Remove stale build
echo "🧹 Step 2: Removing stale build cache..."
if [ -d ".next" ]; then
    echo "   Removing .next folder..."
    rm -rf .next
    echo -e "${GREEN}✅ Build cache cleared${NC}"
else
    echo -e "${YELLOW}⚠️  No .next folder found (this is OK for fresh build)${NC}"
fi

echo ""

# Step 3: Run build verification script
echo "🔍 Step 3: Running build verification..."
if [ -f "verify-build-output.js" ]; then
    node verify-build-output.js
else
    echo -e "${YELLOW}⚠️  verify-build-output.js not found, skipping verification${NC}"
fi

echo ""

# Step 4: Build
echo "🔨 Step 4: Building Next.js application..."
echo "   Running: npm run build"
npm run build

echo ""

# Step 5: Verify build output
echo "✅ Step 5: Verifying build output..."
if [ -f "verify-build-output.js" ]; then
    node verify-build-output.js
fi

echo ""
echo -e "${GREEN}✅ Build verification complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Check the output above to ensure build is correct"
echo "   2. If using Docker, rebuild the container:"
echo "      docker compose -f docker-compose.production.yml up -d --build nextjs"
echo "   3. Test the root page to verify SM page is showing"
