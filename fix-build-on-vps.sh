#!/bin/bash

# Quick fix script for build issues on VPS
# Run this on your VPS if you get "Module not found" errors

set -e

echo "================================================================"
echo "  Fixing Build Issues on VPS"
echo "================================================================"
echo ""

cd /var/www/zaytoonz-ngo

# Step 1: Pull latest changes
echo "[*] Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/main
echo "[OK] Code updated"
echo ""

# Step 2: Verify auth.ts file exists
echo "[*] Verifying required files..."
if [ ! -f "app/lib/auth.ts" ]; then
    echo "[ERROR] app/lib/auth.ts not found!"
    echo "[*] Checking if file exists in different location..."
    find . -name "auth.ts" -type f
    exit 1
else
    echo "[OK] app/lib/auth.ts exists"
fi
echo ""

# Step 3: Clear build cache
echo "[*] Clearing build cache..."
rm -rf .next
rm -rf node_modules/.cache
echo "[OK] Cache cleared"
echo ""

# Step 4: Reinstall dependencies (in case of issues)
echo "[*] Reinstalling dependencies..."
npm install --production
echo "[OK] Dependencies installed"
echo ""

# Step 5: Verify files exist
echo "[*] Verifying required files..."
if [ ! -f "app/lib/auth.ts" ]; then
    echo "[ERROR] app/lib/auth.ts not found! Pulling from git..."
    git checkout app/lib/auth.ts 2>/dev/null || echo "[ERROR] File not in git!"
fi

if [ ! -f "app/components/UploadButton.tsx" ]; then
    echo "[ERROR] app/components/UploadButton.tsx not found! Pulling from git..."
    git checkout app/components/UploadButton.tsx 2>/dev/null || echo "[ERROR] File not in git!"
fi

# Step 6: Verify tsconfig.json
echo "[*] Verifying tsconfig.json..."
if ! grep -q '"@/\*": \["\./\*"\]' tsconfig.json; then
    echo "[WARNING] Path alias may be misconfigured in tsconfig.json"
fi

# Step 7: Build with basePath
echo "[*] Building application..."
export NEXT_PUBLIC_BASE_PATH=/test
npm run build
echo ""
echo "[SUCCESS] Build completed successfully!"

