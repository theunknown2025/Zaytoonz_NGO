#!/bin/bash

# Quick Fix PM2 - Start the app if it's not running
# This is a simple script to check and start PM2 app

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_NAME="${APP_NAME:-zaytoonz-ngo}"
APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"

echo "================================================================"
echo "  Quick Fix PM2 - $APP_NAME"
echo "================================================================"
echo ""

cd "$APP_DIR"

# Check current PM2 status
echo "[*] Checking PM2 status..."
pm2 status

echo ""
echo "[*] Looking for app: $APP_NAME"

# Check if app is running
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}[OK] App '$APP_NAME' is already running!${NC}"
    pm2 status "$APP_NAME"
    exit 0
fi

echo -e "${YELLOW}[!] App '$APP_NAME' is not running${NC}"
echo ""

# Check if app exists but is stopped
if pm2 list | grep -q "$APP_NAME"; then
    echo "[*] App exists but is stopped. Restarting..."
    pm2 restart "$APP_NAME" --update-env
    sleep 2
    
    if pm2 list | grep -q "$APP_NAME.*online"; then
        echo -e "${GREEN}[SUCCESS] App restarted!${NC}"
        pm2 status "$APP_NAME"
        exit 0
    else
        echo -e "${RED}[ERROR] Failed to restart app${NC}"
        echo "[*] Checking logs..."
        pm2 logs "$APP_NAME" --lines 10 --nostream
        exit 1
    fi
fi

# App doesn't exist, need to start it
echo "[*] App doesn't exist. Starting with ecosystem config..."

# Check for ecosystem configs
if [ -f "ecosystem.production.config.js" ]; then
    echo "[*] Using ecosystem.production.config.js..."
    NEXT_PUBLIC_BASE_PATH=/beta PORT=3001 pm2 start ecosystem.production.config.js --update-env
elif [ -f "ecosystem.test.config.js" ]; then
    echo "[*] Using ecosystem.test.config.js..."
    NEXT_PUBLIC_BASE_PATH=/beta PORT=3001 pm2 start ecosystem.test.config.js --update-env
elif [ -f "server.js" ]; then
    echo "[*] Using server.js..."
    pm2 start server.js \
        --name "$APP_NAME" \
        --update-env \
        --env production \
        -- \
        NODE_ENV=production \
        PORT=3001 \
        NEXT_PUBLIC_BASE_PATH=/beta
else
    echo -e "${RED}[ERROR] No start script found!${NC}"
    echo "[*] Expected: ecosystem.production.config.js, ecosystem.test.config.js, or server.js"
    exit 1
fi

sleep 2

# Verify it started
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}[SUCCESS] App started!${NC}"
    pm2 status "$APP_NAME"
    pm2 save
    echo ""
    echo "[*] Testing local connection..."
    sleep 2
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/beta" --max-time 5 || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        echo -e "${GREEN}[OK] App responds on http://localhost:3001/beta (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${YELLOW}[!] App may not be responding correctly (HTTP $HTTP_CODE)${NC}"
        echo "[*] Check logs: pm2 logs $APP_NAME"
    fi
else
    echo -e "${RED}[ERROR] Failed to start app${NC}"
    echo "[*] Checking logs..."
    pm2 logs "$APP_NAME" --lines 20 --nostream
    exit 1
fi

echo ""
echo "================================================================"
echo -e "${GREEN}  PM2 Fix Complete!${NC}"
echo "================================================================"
echo ""
echo "App Status:"
pm2 status "$APP_NAME"
echo ""
echo "Useful commands:"
echo "  pm2 logs $APP_NAME              # View logs"
echo "  pm2 restart $APP_NAME            # Restart"
echo "  pm2 status                       # Check status"
echo ""
