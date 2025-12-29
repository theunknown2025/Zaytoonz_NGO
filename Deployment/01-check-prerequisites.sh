#!/bin/bash

# Step 1: Check Prerequisites
# Verifies that all required software is installed

set -e

echo "================================================================"
echo "  Step 1: Checking Prerequisites"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MISSING_PACKAGES=0

check_command() {
    if command -v "$1" &> /dev/null; then
        VERSION=$($1 --version 2>&1 | head -n 1)
        echo -e "${GREEN}✓${NC} $1 is installed: $VERSION"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        MISSING_PACKAGES=$((MISSING_PACKAGES + 1))
        return 1
    fi
}

echo "[*] Checking required software..."
echo ""

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${YELLOW}[WARNING] Node.js version should be 18 or higher${NC}"
    fi
fi

# Check npm
check_command npm

# Check PM2
check_command pm2

# Check Nginx
check_command nginx

# Check Git
check_command git

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}[WARNING] Not running as root. Some operations may require sudo.${NC}"
else
    echo -e "${GREEN}✓${NC} Running as root"
fi

echo ""
if [ $MISSING_PACKAGES -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS] All prerequisites are installed${NC}"
    exit 0
else
    echo -e "${RED}[ERROR] $MISSING_PACKAGES package(s) are missing${NC}"
    echo ""
    echo "To install missing packages, run:"
    echo "  apt update && apt install -y nodejs npm nginx git"
    echo "  npm install -g pm2"
    exit 1
fi

