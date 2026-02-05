#!/bin/bash

# Quick Start App Script
# Starts the app immediately

set -e

echo "================================================================"
echo "  Start Application - Quick Fix"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
APP_NAME="${APP_NAME:-zaytoonz-ngo}"
PORT="${PORT:-3001}"

cd "$APP_DIR"

echo "[*] App Directory: $APP_DIR"
echo "[*] App Name: $APP_NAME"
echo "[*] Port: $PORT"
echo ""

# Step 1: Check if app is built
echo "=== Step 1: Checking Build ==="
if [ ! -d ".next" ]; then
    echo -e "${YELLOW}[!] App not built. Building now...${NC}"
    export NEXT_PUBLIC_BASE_PATH=/beta
    npm run build
    echo -e "${GREEN}[OK] Build completed${NC}"
else
    echo -e "${GREEN}[OK] App is built${NC}"
fi
echo ""

# Step 2: Check .env.local
echo "=== Step 2: Checking Environment ==="
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}[!] .env.local not found. Creating...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_BASE_PATH=/beta
NODE_ENV=production
PORT=$PORT
HOSTNAME=localhost
EOF
fi

# Ensure NEXT_PUBLIC_BASE_PATH is set
if ! grep -q "NEXT_PUBLIC_BASE_PATH=/beta" .env.local; then
    echo "[*] Setting NEXT_PUBLIC_BASE_PATH=/beta"
    if grep -q "NEXT_PUBLIC_BASE_PATH" .env.local; then
        sed -i 's|NEXT_PUBLIC_BASE_PATH=.*|NEXT_PUBLIC_BASE_PATH=/beta|g' .env.local
    else
        echo "NEXT_PUBLIC_BASE_PATH=/beta" >> .env.local
    fi
fi
echo -e "${GREEN}[OK] Environment configured${NC}"
echo ""

# Step 3: Start with PM2
echo "=== Step 3: Starting Application ==="

# Delete any existing process
pm2 delete "$APP_NAME" 2>/dev/null || true

# Try to start with ecosystem config first
if [ -f "ecosystem.production.config.js" ]; then
    echo "[*] Starting with ecosystem.production.config.js..."
    NEXT_PUBLIC_BASE_PATH=/beta PORT=$PORT pm2 start ecosystem.production.config.js --update-env
elif [ -f "ecosystem.test.config.js" ]; then
    echo "[*] Starting with ecosystem.test.config.js..."
    NEXT_PUBLIC_BASE_PATH=/beta PORT=$PORT pm2 start ecosystem.test.config.js --update-env
elif [ -f "server.js" ]; then
    echo "[*] Starting with server.js..."
    pm2 start server.js \
        --name "$APP_NAME" \
        --update-env \
        --env production \
        -- \
        NODE_ENV=production \
        PORT="$PORT" \
        NEXT_PUBLIC_BASE_PATH=/beta
else
    echo -e "${RED}[ERROR] No start script found!${NC}"
    exit 1
fi

sleep 3

# Step 4: Verify it started
echo ""
echo "=== Step 4: Verifying App Started ==="
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}[SUCCESS] App is running!${NC}"
    pm2 status "$APP_NAME"
else
    echo -e "${RED}[ERROR] App failed to start${NC}"
    echo "[*] Checking logs..."
    pm2 logs "$APP_NAME" --lines 20 --nostream
    exit 1
fi
echo ""

# Step 5: Save PM2 config
pm2 save
echo -e "${GREEN}[OK] PM2 configuration saved${NC}"
echo ""

# Step 6: Test connection
echo "=== Step 5: Testing Connection ==="
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://localhost:$PORT/beta" --max-time 5 || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}[SUCCESS] App responds on localhost:$PORT/beta (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "308" ]; then
    FINAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://localhost:$PORT/beta" --max-time 5 || echo "000")
    if [ "$FINAL_CODE" = "200" ]; then
        echo -e "${GREEN}[SUCCESS] App responds after redirect (HTTP $FINAL_CODE)${NC}"
    else
        echo -e "${YELLOW}[!] App returns redirect but final response is HTTP $FINAL_CODE${NC}"
    fi
else
    echo -e "${YELLOW}[!] App returned HTTP $HTTP_CODE${NC}"
    echo "[*] Check logs: pm2 logs $APP_NAME"
fi
echo ""

echo "================================================================"
echo -e "${GREEN}  App Started!${NC}"
echo "================================================================"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "Test your app:"
echo "  Local: curl http://localhost:$PORT/beta"
echo "  Domain: curl http://zaytoonz.com/beta"
echo ""
