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
echo -e "${GREEN}[SUCCESS] Node.js dependencies installed${NC}"

# Install Python scraper dependencies
echo ""
echo "[*] Setting up Python scraper dependencies..."
SCRAPER_DIR="$APP_DIR/python_scraper"

if [ -d "$SCRAPER_DIR" ]; then
    cd "$SCRAPER_DIR"
    
    # Check if Python 3 is available
    if command -v python3 &> /dev/null; then
        echo "[*] Python 3 found: $(python3 --version)"
        
        # Create virtual environment if it doesn't exist
        if [ ! -d "venv" ]; then
            echo "[*] Creating Python virtual environment..."
            python3 -m venv venv
        fi
        
        # Activate venv and install requirements
        echo "[*] Installing Python scraper requirements..."
        source venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        
        echo -e "${GREEN}[SUCCESS] Python scraper dependencies installed${NC}"
    else
        echo -e "${YELLOW}[WARNING] Python 3 not found. Skipping scraper dependencies.${NC}"
        echo "  Install Python 3 to enable scraper functionality."
    fi
else
    echo -e "${YELLOW}[WARNING] Scraper directory not found: $SCRAPER_DIR${NC}"
fi

# Show installed versions
echo ""
echo "[*] Installed versions:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Next.js: $(npm list next --depth=0 2>/dev/null | grep next | cut -d'@' -f2 || echo 'not found')"
if command -v python3 &> /dev/null; then
    echo "  Python: $(python3 --version)"
fi

