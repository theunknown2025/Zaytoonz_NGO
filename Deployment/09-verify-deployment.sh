#!/bin/bash

# Step 9: Verify Deployment
# Verifies that the deployment is working correctly

set -e

echo "================================================================"
echo "  Step 9: Verifying Deployment"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_NAME="${APP_NAME:-zaytoonz-test}"
VPS_IP="${VPS_IP:-72.62.176.80}"
DOMAIN="${DOMAIN:-$VPS_IP}"
APP_PORT="${APP_PORT:-3001}"

echo "[*] Running verification checks..."
echo ""

# Check PM2 status
echo "[*] Checking PM2 status..."
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}  ✓${NC} PM2 app is running"
    pm2 status "$APP_NAME" | grep "$APP_NAME"
else
    echo -e "${RED}  ✗${NC} PM2 app is not running"
    echo "[*] Check logs: pm2 logs $APP_NAME"
fi

echo ""

# Check Nginx status
echo "[*] Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}  ✓${NC} Nginx is running"
else
    echo -e "${RED}  ✗${NC} Nginx is not running"
fi

echo ""

# Check if app responds locally
echo "[*] Testing local application..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT/beta" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}  ✓${NC} Application responds on localhost:$APP_PORT/beta"
else
    echo -e "${YELLOW}  !${NC} Application may not be responding correctly"
    echo "[*] Test manually: curl http://localhost:$APP_PORT/beta"
fi

echo ""

# Check if domain responds (if accessible)
echo "[*] Testing domain (if accessible)..."
if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/beta" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}  ✓${NC} Domain responds: http://$DOMAIN/beta"
else
    echo -e "${YELLOW}  !${NC} Domain may not be accessible yet"
    echo "[*] This is normal if DNS hasn't propagated"
fi

echo ""
echo "================================================================"
echo -e "${GREEN}  Deployment Verification Complete${NC}"
echo "================================================================"
echo ""
echo "Access your application:"
echo "  Coming Soon: http://$DOMAIN"
echo "  Your App:    http://$DOMAIN/beta"
echo ""
echo "Useful commands:"
echo "  pm2 logs $APP_NAME          # View application logs"
echo "  pm2 status                  # Check PM2 status"
echo "  systemctl status nginx      # Check Nginx status"
echo "  tail -f /var/log/nginx/error.log  # View Nginx errors"

