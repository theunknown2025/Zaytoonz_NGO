#!/bin/bash

# Verification script to check if all required files exist on VPS
# Run this on your VPS: bash verify-files-on-vps.sh

set -e

echo "================================================================"
echo "  Verifying Required Files on VPS"
echo "================================================================"
echo ""

cd /var/www/zaytoonz-ngo

# Check critical files
echo "[*] Checking critical files..."
MISSING_FILES=0

check_file() {
    if [ -f "$1" ]; then
        echo "  ✓ $1 exists"
    else
        echo "  ✗ $1 MISSING!"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
}

# Check auth files
check_file "app/lib/auth.ts"
check_file "app/lib/auth-utils.ts"
check_file "app/components/UploadButton.tsx"

# Check config files
check_file "tsconfig.json"
check_file "next.config.js"
check_file ".env.local"

echo ""
if [ $MISSING_FILES -eq 0 ]; then
    echo "[OK] All critical files exist"
else
    echo "[ERROR] $MISSING_FILES file(s) are missing!"
    echo ""
    echo "To fix, run:"
    echo "  git fetch origin"
    echo "  git reset --hard origin/main"
    exit 1
fi

# Verify tsconfig.json path alias
echo ""
echo "[*] Verifying tsconfig.json configuration..."
if grep -q '"@/\*": \["\./\*"\]' tsconfig.json; then
    echo "  ✓ Path alias configured correctly"
else
    echo "  ✗ Path alias may be misconfigured"
fi

# Check if files are in git
echo ""
echo "[*] Checking if files are tracked in git..."
if git ls-files --error-unmatch app/lib/auth.ts > /dev/null 2>&1; then
    echo "  ✓ app/lib/auth.ts is tracked in git"
else
    echo "  ✗ app/lib/auth.ts is NOT tracked in git"
fi

if git ls-files --error-unmatch app/components/UploadButton.tsx > /dev/null 2>&1; then
    echo "  ✓ app/components/UploadButton.tsx is tracked in git"
else
    echo "  ✗ app/components/UploadButton.tsx is NOT tracked in git"
fi

# Check git status
echo ""
echo "[*] Checking git status..."
git status --short

echo ""
echo "================================================================"
echo "  Verification Complete"
echo "================================================================"

