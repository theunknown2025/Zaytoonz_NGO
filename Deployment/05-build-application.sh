#!/bin/bash

# Step 5: Build Application
# Builds the Next.js application

set -e

echo "================================================================"
echo "  Step 5: Building Application"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
BASE_PATH="${BASE_PATH:-/test}"

cd "$APP_DIR"

echo "[*] Base path: $BASE_PATH"
echo "[*] Clearing previous build..."
rm -rf .next
rm -rf node_modules/.cache

echo ""
echo "[*] Building Next.js application..."
echo "  This may take a few minutes..."
echo ""

# Set base path and build
export NEXT_PUBLIC_BASE_PATH="$BASE_PATH"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}[SUCCESS] Build completed successfully!${NC}"
    
    # Check build output
    if [ -d ".next" ]; then
        echo "[*] Build output directory created: .next"
        echo "[*] Build size: $(du -sh .next | cut -f1)"
    fi
else
    echo ""
    echo -e "${RED}[ERROR] Build failed!${NC}"
    echo "[*] Check the error messages above"
    exit 1
fi

