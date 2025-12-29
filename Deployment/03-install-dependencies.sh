#!/bin/bash

# Step 3: Install Dependencies
# Installs npm dependencies

set -e

echo "================================================================"
echo "  Step 3: Installing Dependencies"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
INSTALL_MODE="${INSTALL_MODE:-production}"

cd "$APP_DIR"

echo "[*] Installation mode: $INSTALL_MODE"
echo "[*] Installing dependencies..."
echo ""

if [ "$INSTALL_MODE" = "production" ]; then
    npm install --production
else
    npm install
fi

echo ""
echo -e "${GREEN}[SUCCESS] Dependencies installed${NC}"

# Show installed versions
echo ""
echo "[*] Installed versions:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Next.js: $(npm list next --depth=0 2>/dev/null | grep next | cut -d'@' -f2 || echo 'not found')"

