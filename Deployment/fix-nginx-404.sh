#!/bin/bash

# Fix Nginx 404 Error for /beta path
# This script checks and fixes Nginx configuration issues

set -e

echo "================================================================"
echo "  Fix Nginx 404 Error - /beta Path"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DOMAIN="${DOMAIN:-zaytoonz.com}"
APP_PORT="${APP_PORT:-3001}"
COMING_SOON_PATH="${COMING_SOON_PATH:-/var/www/zaytoonz}"

# Determine nginx config file
if [[ "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NGINX_CONFIG="/etc/nginx/sites-available/zaytoonz-ip"
else
    NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
fi

echo "[*] Domain: $DOMAIN"
echo "[*] App Port: $APP_PORT"
echo "[*] Nginx Config: $NGINX_CONFIG"
echo ""

# Step 1: Check if app is running locally
echo "=== Step 1: Checking Local App ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT/beta" --max-time 5 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}[OK] App responds on localhost:$APP_PORT/beta (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}[ERROR] App NOT responding on localhost:$APP_PORT/beta (HTTP $HTTP_CODE)${NC}"
    echo "[*] This is the root cause of the 404 error"
    echo "[*] Checking PM2 status..."
    pm2 status
    echo ""
    echo "Try restarting the app:"
    echo "  pm2 restart zaytoonz-ngo --update-env"
    echo "  pm2 logs zaytoonz-ngo"
    exit 1
fi
echo ""

# Step 2: Check Nginx config exists
echo "=== Step 2: Checking Nginx Configuration ==="
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}[ERROR] Nginx config not found: $NGINX_CONFIG${NC}"
    echo "[*] Running nginx configuration script..."
    cd /var/www/zaytoonz-ngo
    bash Deployment/07-configure-nginx.sh
    exit 0
else
    echo -e "${GREEN}[OK] Nginx config exists${NC}"
fi
echo ""

# Step 3: Check if /beta location is configured
echo "=== Step 3: Checking /beta Location Block ==="
if grep -q "location /beta" "$NGINX_CONFIG"; then
    echo -e "${GREEN}[OK] /beta location block found${NC}"
    
    # Check if proxy_pass is correct
    if grep -q "proxy_pass http://localhost:$APP_PORT/beta" "$NGINX_CONFIG"; then
        echo -e "${GREEN}[OK] proxy_pass is correctly configured${NC}"
    else
        echo -e "${YELLOW}[!] proxy_pass might be incorrect${NC}"
        echo "[*] Current proxy_pass:"
        grep "proxy_pass" "$NGINX_CONFIG" | grep beta || echo "  Not found"
    fi
else
    echo -e "${RED}[ERROR] /beta location block NOT found!${NC}"
    echo "[*] Reconfiguring Nginx..."
    cd /var/www/zaytoonz-ngo
    bash Deployment/07-configure-nginx.sh
    exit 0
fi
echo ""

# Step 4: Check if config is enabled
echo "=== Step 4: Checking Nginx Site Enable ==="
if [ -L "/etc/nginx/sites-enabled/$DOMAIN" ] || [ -L "/etc/nginx/sites-enabled/zaytoonz-ip" ]; then
    echo -e "${GREEN}[OK] Nginx site is enabled${NC}"
else
    echo -e "${YELLOW}[!] Nginx site might not be enabled${NC}"
    echo "[*] Enabling site..."
    ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
fi
echo ""

# Step 5: Test Nginx configuration
echo "=== Step 5: Testing Nginx Configuration ==="
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}[OK] Nginx configuration is valid${NC}"
else
    echo -e "${RED}[ERROR] Nginx configuration has errors!${NC}"
    nginx -t
    exit 1
fi
echo ""

# Step 6: Reload Nginx
echo "=== Step 6: Reloading Nginx ==="
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[OK] Nginx reloaded${NC}"
else
    echo -e "${RED}[ERROR] Failed to reload Nginx${NC}"
    exit 1
fi
echo ""

# Step 7: Test external connection
echo "=== Step 7: Testing External Connection ==="
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/beta" --max-time 10 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}[SUCCESS] Domain responds: http://$DOMAIN/beta (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}[!] Domain returned HTTP $HTTP_CODE${NC}"
    echo "[*] Testing with verbose output..."
    curl -v "http://$DOMAIN/beta" 2>&1 | head -30
fi
echo ""

# Summary
echo "================================================================"
echo -e "${GREEN}  Nginx Fix Complete!${NC}"
echo "================================================================"
echo ""
echo "If you still see 404 errors:"
echo "  1. Check PM2 logs: pm2 logs zaytoonz-ngo"
echo "  2. Check Nginx logs: tail -f /var/log/nginx/error.log"
echo "  3. Verify app is running: pm2 status"
echo "  4. Test locally: curl http://localhost:$APP_PORT/beta"
echo ""
echo "Nginx Config Location: $NGINX_CONFIG"
echo "View config: cat $NGINX_CONFIG"
echo ""
