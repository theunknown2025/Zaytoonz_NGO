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
BASE_PATH="${BASE_PATH:-/test}"

cd "$APP_DIR"

echo "[*] Application name: $APP_NAME"
echo "[*] Port: $PORT"
echo "[*] Base path: $BASE_PATH"
echo ""

# Create PM2 log directory
echo "[*] Setting up PM2 logs..."
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2

# Stop existing instance if running
echo "[*] Stopping existing PM2 instance (if any)..."
pm2 delete "$APP_NAME" 2>/dev/null || true

# Start with ecosystem config if exists, otherwise use server.js
if [ -f "ecosystem.test.config.js" ]; then
    echo "[*] Starting with ecosystem.test.config.js..."
    pm2 start ecosystem.test.config.js
else
    echo "[*] Starting with server.js..."
    pm2 start server.js \
        --name "$APP_NAME" \
        --update-env \
        --env production \
        -- \
        NODE_ENV=production \
        PORT="$PORT" \
        NEXT_PUBLIC_BASE_PATH="$BASE_PATH"
fi

# Save PM2 configuration
pm2 save

echo ""
echo -e "${GREEN}[SUCCESS] PM2 configured${NC}"

# Show PM2 status
echo ""
echo "[*] PM2 Status:"
pm2 status "$APP_NAME"

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

