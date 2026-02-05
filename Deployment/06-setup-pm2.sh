#!/bin/bash

# Step 6: Setup PM2
# Configures and starts the application with PM2

set -e

echo "================================================================"
echo "  Step 6: Setting Up PM2"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
APP_NAME="${APP_NAME:-zaytoonz-test}"
PORT="${PORT:-3001}"
BASE_PATH="${BASE_PATH:-/beta}"

cd "$APP_DIR"

echo "[*] Application name: $APP_NAME"
echo "[*] Port: $PORT"
echo "[*] Base path: $BASE_PATH"
echo ""

# Create PM2 log directory
echo "[*] Setting up PM2 logs..."
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2

# Stop existing instances if running
echo "[*] Stopping existing PM2 instances (if any)..."
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 delete "python-scraper" 2>/dev/null || true

# Check for ecosystem configs (prefer production config with scraper, fallback to test)
if [ -f "ecosystem.production.config.js" ]; then
    echo "[*] Starting with ecosystem.production.config.js (includes scraper)..."
    pm2 start ecosystem.production.config.js
elif [ -f "ecosystem.test.config.js" ]; then
    echo "[*] Starting with ecosystem.test.config.js..."
    pm2 start ecosystem.test.config.js
else
    echo "[*] Starting Next.js app with server.js..."
    pm2 start server.js \
        --name "$APP_NAME" \
        --update-env \
        --env production \
        -- \
        NODE_ENV=production \
        PORT="$PORT" \
        NEXT_PUBLIC_BASE_PATH="$BASE_PATH"
    
    # Try to start Python scraper if directory exists
    SCRAPER_DIR="$APP_DIR/python_scraper"
    if [ -d "$SCRAPER_DIR" ] && [ -f "$SCRAPER_DIR/venv/bin/uvicorn" ]; then
        echo "[*] Starting Python scraper..."
        cd "$SCRAPER_DIR"
        pm2 start venv/bin/uvicorn \
            --name "python-scraper" \
            --interpreter none \
            -- \
            api_wrapper:app --host 0.0.0.0 --port 8000 --workers 2
        cd "$APP_DIR"
    fi
fi

# Save PM2 configuration
pm2 save

echo ""
echo -e "${GREEN}[SUCCESS] PM2 configured${NC}"

# Show PM2 status
echo ""
echo "[*] PM2 Status:"
pm2 status

# Setup PM2 startup (if not already done)
echo ""
echo "[*] Setting up PM2 startup..."
STARTUP_CMD=$(pm2 startup 2>/dev/null | grep -oP 'sudo.*' || echo "")
if [ ! -z "$STARTUP_CMD" ]; then
    echo -e "${YELLOW}[ACTION REQUIRED] Run this command to enable PM2 on boot:${NC}"
    echo "  $STARTUP_CMD"
fi

echo ""
echo "[*] View logs with: pm2 logs $APP_NAME"

