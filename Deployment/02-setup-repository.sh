#!/bin/bash

# Step 2: Setup Repository
# Clones or updates the repository from GitHub

set -e

echo "================================================================"
echo "  Step 2: Setting Up Repository"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
REPO_URL="${REPO_URL:-https://github.com/theunknown2025/Zaytoonz_NGO.git}"
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
BRANCH="${BRANCH:-main}"

echo "[*] Repository URL: $REPO_URL"
echo "[*] Target directory: $APP_DIR"
echo "[*] Branch: $BRANCH"
echo ""

# Check if directory exists
if [ -d "$APP_DIR" ]; then
    echo "[*] Directory exists. Updating repository..."
    cd "$APP_DIR"
    
    # Check if it's a git repository
    if [ -d ".git" ]; then
        echo "[*] Pulling latest changes..."
        git fetch origin
        git reset --hard "origin/$BRANCH"
        echo -e "${GREEN}[OK] Repository updated${NC}"
    else
        echo -e "${RED}[ERROR] Directory exists but is not a git repository${NC}"
        echo "[*] Removing directory and cloning fresh..."
        cd /
        rm -rf "$APP_DIR"
        git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
        echo -e "${GREEN}[OK] Repository cloned${NC}"
    fi
else
    echo "[*] Directory does not exist. Cloning repository..."
    mkdir -p "$(dirname "$APP_DIR")"
    git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
    echo -e "${GREEN}[OK] Repository cloned${NC}"
fi

cd "$APP_DIR"

# Verify critical files exist
echo ""
echo "[*] Verifying critical files..."
MISSING_FILES=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}  ✓${NC} $1"
    else
        echo -e "${RED}  ✗${NC} $1 MISSING!"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
}

check_file "app/lib/auth.ts"
check_file "app/components/UploadButton.tsx"
check_file "package.json"
check_file "next.config.js"
check_file "tsconfig.json"

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}[ERROR] $MISSING_FILES critical file(s) are missing!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[SUCCESS] Repository setup complete${NC}"
echo "[*] Current commit: $(git rev-parse --short HEAD)"
echo "[*] Current branch: $(git branch --show-current)"

