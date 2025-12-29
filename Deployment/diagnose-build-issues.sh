#!/bin/bash

# Comprehensive Build Diagnostic Script
# Run this on your VPS to identify why npm run build is failing

set -e

echo "================================================================"
echo "  Build Diagnostic Tool"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
cd "$APP_DIR"

echo "[*] Checking environment..."
echo ""

# 1. Check Node.js and npm versions
echo "=== 1. Node.js Environment ==="
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
    NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}✗${NC} Node.js version should be 18 or higher!"
    fi
else
    echo -e "${RED}✗${NC} Node.js not found!"
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm: $(npm --version)"
else
    echo -e "${RED}✗${NC} npm not found!"
fi
echo ""

# 2. Check disk space
echo "=== 2. Disk Space ==="
df -h / | tail -1 | awk '{print "Available: " $4 " / Total: " $2}'
AVAILABLE=$(df / | tail -1 | awk '{print $4}')
if [ "$AVAILABLE" -lt 1048576 ]; then  # Less than 1GB
    echo -e "${RED}✗${NC} Low disk space! Build may fail."
else
    echo -e "${GREEN}✓${NC} Sufficient disk space"
fi
echo ""

# 3. Check memory
echo "=== 3. Memory ==="
free -h | grep Mem | awk '{print "Total: " $2 ", Available: " $7}'
echo ""

# 4. Check if .env.local exists and has valid values
echo "=== 4. Environment Variables ==="
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    # Check for placeholder values
    if grep -q "your_supabase_url_here\|your_supabase_anon_key_here\|placeholder" .env.local; then
        echo -e "${RED}✗${NC} .env.local contains placeholder values!"
        echo "  These will cause build errors."
        echo "  Please update with actual values."
    else
        echo -e "${GREEN}✓${NC} No placeholder values found"
    fi
    
    # Check NEXT_PUBLIC_BASE_PATH
    if grep -q "NEXT_PUBLIC_BASE_PATH" .env.local; then
        BASE_PATH=$(grep NEXT_PUBLIC_BASE_PATH .env.local | cut -d'=' -f2)
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_BASE_PATH: $BASE_PATH"
    else
        echo -e "${YELLOW}!${NC} NEXT_PUBLIC_BASE_PATH not set in .env.local"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found!"
    echo "  Create it with: nano .env.local"
fi
echo ""

# 5. Check critical files
echo "=== 5. Critical Files ==="
MISSING=0
for file in "app/lib/auth.ts" "app/lib/supabase.ts" "app/components/UploadButton.tsx" "package.json" "next.config.js" "tsconfig.json"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file MISSING!"
        MISSING=$((MISSING + 1))
    fi
done
if [ $MISSING -gt 0 ]; then
    echo -e "${RED}Error: $MISSING critical file(s) missing!${NC}"
    echo "  Run: git pull origin main"
fi
echo ""

# 6. Check node_modules
echo "=== 6. Dependencies ==="
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
    MODULE_COUNT=$(find node_modules -type d -maxdepth 1 | wc -l)
    echo "  Installed packages: $MODULE_COUNT"
    
    # Check for key packages
    if [ -d "node_modules/next" ]; then
        NEXT_VERSION=$(cat node_modules/next/package.json | grep '"version"' | cut -d'"' -f4)
        echo -e "${GREEN}✓${NC} Next.js: $NEXT_VERSION"
    else
        echo -e "${RED}✗${NC} Next.js not installed!"
    fi
else
    echo -e "${RED}✗${NC} node_modules not found!"
    echo "  Run: npm install"
fi
echo ""

# 7. Check Git status
echo "=== 7. Git Status ==="
if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git branch --show-current)
    echo "  Branch: $CURRENT_BRANCH"
    
    # Check if up to date
    git fetch origin --quiet 2>/dev/null || true
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "")
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo -e "${GREEN}✓${NC} Code is up to date"
    else
        echo -e "${YELLOW}!${NC} Code may be outdated"
        echo "  Run: git pull origin main"
    fi
else
    echo -e "${RED}✗${NC} Not a git repository!"
fi
echo ""

# 8. Check for build cache issues
echo "=== 8. Build Cache ==="
if [ -d ".next" ]; then
    echo -e "${YELLOW}!${NC} .next directory exists (old build)"
    echo "  Size: $(du -sh .next | cut -f1)"
    echo "  Consider: rm -rf .next"
else
    echo -e "${GREEN}✓${NC} No old build cache"
fi
echo ""

# 9. Check TypeScript configuration
echo "=== 9. TypeScript Configuration ==="
if [ -f "tsconfig.json" ]; then
    if grep -q '"@/\*": \["\./\*"\]' tsconfig.json; then
        echo -e "${GREEN}✓${NC} Path alias configured correctly"
    else
        echo -e "${RED}✗${NC} Path alias may be misconfigured"
    fi
else
    echo -e "${RED}✗${NC} tsconfig.json not found!"
fi
echo ""

# 10. Test build with verbose output
echo "=== 10. Attempting Build (Dry Run) ==="
echo "[*] Setting environment variables..."
export NEXT_PUBLIC_BASE_PATH=/test
export NODE_ENV=production

echo "[*] Running: npm run build"
echo ""
echo "----------------------------------------"
echo "BUILD OUTPUT:"
echo "----------------------------------------"

# Run build and capture output
npm run build 2>&1 | tee /tmp/build-output.log

BUILD_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "----------------------------------------"

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS] Build completed!${NC}"
else
    echo -e "${RED}[ERROR] Build failed with exit code: $BUILD_EXIT_CODE${NC}"
    echo ""
    echo "=== Common Error Patterns ==="
    
    # Check for specific error patterns
    if grep -q "Module not found" /tmp/build-output.log; then
        echo -e "${RED}✗${NC} Module not found error"
        echo "  Solution: Check file paths and imports"
        grep "Module not found" /tmp/build-output.log | head -3
    fi
    
    if grep -q "Invalid URL" /tmp/build-output.log; then
        echo -e "${RED}✗${NC} Invalid URL error"
        echo "  Solution: Check .env.local for placeholder values"
        grep "Invalid URL" /tmp/build-output.log | head -3
    fi
    
    if grep -q "Cannot find module" /tmp/build-output.log; then
        echo -e "${RED}✗${NC} Cannot find module"
        echo "  Solution: Run 'npm install'"
        grep "Cannot find module" /tmp/build-output.log | head -3
    fi
    
    if grep -q "Dynamic server usage" /tmp/build-output.log; then
        echo -e "${YELLOW}!${NC} Dynamic server usage warning"
        echo "  This is usually OK, but check if routes need 'export const dynamic'"
    fi
    
    if grep -q "ENOENT" /tmp/build-output.log; then
        echo -e "${RED}✗${NC} File not found error"
        echo "  Solution: Check if all files are pulled from git"
        grep "ENOENT" /tmp/build-output.log | head -3
    fi
    
    echo ""
    echo "Full build log saved to: /tmp/build-output.log"
    echo "View with: cat /tmp/build-output.log"
fi

echo ""
echo "================================================================"
echo "  Diagnostic Complete"
echo "================================================================"

