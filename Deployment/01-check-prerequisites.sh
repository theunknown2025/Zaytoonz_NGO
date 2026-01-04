#!/bin/bash

# Step 1: Check and Install Prerequisites
# Verifies that all required software is installed and installs if missing

set -e

echo "================================================================"
echo "  Step 1: Checking and Installing Prerequisites"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[ERROR] This script must be run as root${NC}"
    echo "Please run: sudo bash $0"
    exit 1
else
    echo -e "${GREEN}✓${NC} Running as root"
fi

echo ""
echo "[*] Updating package list..."
apt update -qq

MISSING_PACKAGES=0
INSTALLED_PACKAGES=0

check_and_install() {
    local package_name=$1
    local install_command=$2
    local check_command=$3
    
    if command -v "$check_command" &> /dev/null; then
        VERSION=$($check_command --version 2>&1 | head -n 1)
        echo -e "${GREEN}✓${NC} $package_name is installed: $VERSION"
        return 0
    else
        echo -e "${YELLOW}✗${NC} $package_name is NOT installed"
        echo -e "${BLUE}[*]${NC} Installing $package_name..."
        
        if eval "$install_command"; then
            echo -e "${GREEN}✓${NC} $package_name installed successfully"
            INSTALLED_PACKAGES=$((INSTALLED_PACKAGES + 1))
            return 0
        else
            echo -e "${RED}✗${NC} Failed to install $package_name"
            MISSING_PACKAGES=$((MISSING_PACKAGES + 1))
            return 1
        fi
    fi
}

echo ""
echo "[*] Checking required software..."
echo ""

# Check and install Node.js
if ! check_and_install "Node.js" \
    "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs" \
    "node"; then
    echo -e "${RED}[ERROR] Failed to install Node.js${NC}"
    exit 1
fi

# Verify Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}[WARNING] Node.js version should be 18 or higher (current: $(node --version))${NC}"
fi

# Check and install npm (usually comes with Node.js)
if ! check_and_install "npm" \
    "apt install -y npm" \
    "npm"; then
    echo -e "${RED}[ERROR] Failed to install npm${NC}"
    exit 1
fi

# Check and install PM2
if ! check_and_install "PM2" \
    "npm install -g pm2" \
    "pm2"; then
    echo -e "${RED}[ERROR] Failed to install PM2${NC}"
    exit 1
fi

# Check and install Nginx
if ! check_and_install "Nginx" \
    "apt install -y nginx && systemctl start nginx && systemctl enable nginx" \
    "nginx"; then
    echo -e "${RED}[ERROR] Failed to install Nginx${NC}"
    exit 1
fi

# Check and install Git
if ! check_and_install "Git" \
    "apt install -y git" \
    "git"; then
    echo -e "${RED}[ERROR] Failed to install Git${NC}"
    exit 1
fi

# Check and install Python 3 (required for scraper)
if ! check_and_install "Python 3" \
    "apt install -y python3 python3-pip python3-venv" \
    "python3"; then
    echo -e "${RED}[ERROR] Failed to install Python 3${NC}"
    exit 1
fi

echo ""
if [ $MISSING_PACKAGES -eq 0 ]; then
    if [ $INSTALLED_PACKAGES -gt 0 ]; then
        echo -e "${GREEN}[SUCCESS] All prerequisites are installed ($INSTALLED_PACKAGES package(s) were just installed)${NC}"
    else
        echo -e "${GREEN}[SUCCESS] All prerequisites are already installed${NC}"
    fi
    
    echo ""
    echo "[*] Installed versions:"
    echo "  Node.js: $(node --version)"
    echo "  npm: $(npm --version)"
    echo "  PM2: $(pm2 --version)"
    echo "  Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
    echo "  Git: $(git --version | cut -d' ' -f3)"
    echo "  Python: $(python3 --version)"
    
    exit 0
else
    echo -e "${RED}[ERROR] $MISSING_PACKAGES package(s) failed to install${NC}"
    exit 1
fi

