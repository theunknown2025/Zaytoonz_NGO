#!/bin/bash
# Quick fix for nginx SSL configuration
# Run this on your VPS after getting SSL certificate

set -e

DOMAIN="beta-zaytoonz.pro"
NGINX_CONF="nginx-beta.conf"
COMPOSE_FILE="docker-compose-beta.yml"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Fixing Nginx SSL Configuration${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if nginx config exists
if [ ! -f "$NGINX_CONF" ]; then
    echo -e "${RED}Error: $NGINX_CONF not found!${NC}"
    exit 1
fi

# Fix DOMAIN_PLACEHOLDER
echo -e "${YELLOW}[1/3] Fixing domain placeholder...${NC}"
if grep -q "DOMAIN_PLACEHOLDER" "$NGINX_CONF"; then
    sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$NGINX_CONF"
    echo -e "${GREEN}✓ Replaced DOMAIN_PLACEHOLDER with $DOMAIN${NC}"
else
    echo -e "${GREEN}✓ No placeholder found (already fixed)${NC}"
fi

# Fix deprecated http2 syntax (if exists)
echo -e "${YELLOW}[2/3] Fixing HTTP/2 directive...${NC}"
if grep -q "listen.*ssl http2" "$NGINX_CONF"; then
    # Replace deprecated syntax
    sed -i 's/listen 443 ssl http2;/listen 443 ssl;/g' "$NGINX_CONF"
    sed -i 's/listen \[::\]:443 ssl http2;/listen [::]:443 ssl;/g' "$NGINX_CONF"
    
    # Add http2 on; after the listen [::]:443 ssl; line if it doesn't exist
    if ! grep -q "http2 on;" "$NGINX_CONF"; then
        sed -i '/listen \[::\]:443 ssl;/a\        http2 on;' "$NGINX_CONF"
    fi
    
    echo -e "${GREEN}✓ Fixed deprecated HTTP/2 syntax${NC}"
else
    echo -e "${GREEN}✓ HTTP/2 directive already correct${NC}"
fi

# Verify certificate path
echo -e "${YELLOW}[3/3] Verifying certificate path...${NC}"
if grep -q "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$NGINX_CONF"; then
    echo -e "${GREEN}✓ Certificate path is correct${NC}"
else
    echo -e "${RED}✗ Certificate path might be incorrect!${NC}"
    echo -e "${YELLOW}Expected: /etc/letsencrypt/live/$DOMAIN/fullchain.pem${NC}"
fi

# Test nginx configuration
echo -e "\n${YELLOW}Testing nginx configuration...${NC}"
if docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Nginx configuration is valid!${NC}"
    
    # Reload nginx
    echo -e "${YELLOW}Reloading nginx...${NC}"
    if docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload 2>/dev/null; then
        echo -e "${GREEN}✓ Nginx reloaded successfully!${NC}"
    else
        echo -e "${YELLOW}Reload failed, restarting nginx...${NC}"
        docker compose -f "$COMPOSE_FILE" restart nginx
        sleep 3
        echo -e "${GREEN}✓ Nginx restarted${NC}"
    fi
else
    echo -e "${RED}✗ Nginx configuration test failed!${NC}"
    echo -e "${YELLOW}Checking errors...${NC}"
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -t
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Fix Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"
echo -e "Your site should now be accessible at: ${BLUE}https://${DOMAIN}${NC}\n"
