#!/bin/bash
# Fix nginx configuration on VPS
# Run this directly on your VPS

set -e

DOMAIN="beta-zaytoonz.pro"
NGINX_CONF="nginx-beta.conf"
COMPOSE_FILE="docker-compose-beta.yml"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "Fixing nginx configuration..."

# Check if file exists
if [ ! -f "$NGINX_CONF" ]; then
    echo -e "${RED}Error: $NGINX_CONF not found!${NC}"
    exit 1
fi

# Backup original
cp "$NGINX_CONF" "${NGINX_CONF}.backup"
echo "✓ Backup created: ${NGINX_CONF}.backup"

# Fix 1: Replace DOMAIN_PLACEHOLDER
echo "Fixing DOMAIN_PLACEHOLDER..."
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$NGINX_CONF"
echo "✓ Domain placeholder fixed"

# Fix 2: Fix deprecated http2 syntax
echo "Fixing deprecated HTTP/2 syntax..."
# Replace "listen 443 ssl http2;" with "listen 443 ssl;"
sed -i 's/listen 443 ssl http2;/listen 443 ssl;/g' "$NGINX_CONF"
sed -i 's/listen \[::\]:443 ssl http2;/listen [::]:443 ssl;/g' "$NGINX_CONF"

# Add http2 on; after listen [::]:443 ssl; if it doesn't exist
if ! grep -q "http2 on;" "$NGINX_CONF"; then
    # Find the line with "listen [::]:443 ssl;" and add http2 on; after it
    sed -i '/listen \[::\]:443 ssl;/a\        http2 on;' "$NGINX_CONF"
fi
echo "✓ HTTP/2 syntax fixed"

# Verify fixes
echo ""
echo "Verifying fixes..."
if grep -q "DOMAIN_PLACEHOLDER" "$NGINX_CONF"; then
    echo -e "${RED}✗ DOMAIN_PLACEHOLDER still exists!${NC}"
    exit 1
fi

if grep -q "listen.*ssl http2" "$NGINX_CONF"; then
    echo -e "${RED}✗ Deprecated http2 syntax still exists!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All fixes applied successfully${NC}"

# Test nginx configuration
echo ""
echo "Testing nginx configuration..."
if docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Nginx configuration is valid!${NC}"
    
    # Reload nginx
    echo "Reloading nginx..."
    if docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload 2>/dev/null; then
        echo -e "${GREEN}✓ Nginx reloaded successfully!${NC}"
    else
        echo "Restarting nginx..."
        docker compose -f "$COMPOSE_FILE" restart nginx
        sleep 3
        echo -e "${GREEN}✓ Nginx restarted${NC}"
    fi
else
    echo -e "${RED}✗ Nginx configuration test failed!${NC}"
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -t
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Fix Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your site should now be accessible at:"
echo "  https://${DOMAIN}"
