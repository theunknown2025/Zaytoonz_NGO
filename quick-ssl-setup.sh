#!/bin/bash
# Quick SSL Certificate Setup for beta-zaytoonz.pro
# Run this script on your VPS (Linux server)

set -e

DOMAIN="beta-zaytoonz.pro"
EMAIL="support@zaytoonz.com"
COMPOSE_FILE="docker-compose-beta.yml"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Quick SSL Setup for ${DOMAIN}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run with sudo${NC}"
    echo -e "${YELLOW}Usage: sudo bash quick-ssl-setup.sh${NC}"
    exit 1
fi

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Step 1: Verify DNS
echo -e "${YELLOW}[1/5] Verifying DNS...${NC}"
DNS_RESULT=$(dig +short "$DOMAIN" 2>/dev/null | head -n1 || echo "")
if [ -z "$DNS_RESULT" ]; then
    echo -e "${RED}⚠ DNS lookup failed. Make sure DNS is configured.${NC}"
    read -p "Continue anyway? (y/N) " continue_dns
    if [ "$continue_dns" != "y" ] && [ "$continue_dns" != "Y" ]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ DNS resolves to: $DNS_RESULT${NC}"
fi

# Step 2: Create certbot directories
echo -e "${YELLOW}[2/5] Setting up certbot directories...${NC}"
mkdir -p ./certbot/conf
mkdir -p ./certbot/www
echo -e "${GREEN}✓ Directories created${NC}"

# Step 3: Create temporary certificate
echo -e "${YELLOW}[3/5] Creating temporary certificate...${NC}"
mkdir -p ./certbot/conf/live/$DOMAIN
$DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1\
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot 2>/dev/null || true
echo -e "${GREEN}✓ Temporary certificate created${NC}"

# Step 4: Start nginx
echo -e "${YELLOW}[4/5] Starting nginx...${NC}"
$DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d nginx
sleep 5
echo -e "${GREEN}✓ Nginx started${NC}"

# Step 5: Request real certificate
echo -e "${YELLOW}[5/5] Requesting Let's Encrypt certificate...${NC}"
echo -e "${BLUE}This may take a minute...${NC}"

# Remove temporary certificate
$DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot 2>/dev/null || true

# Request certificate
if $DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    -m $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot; then
    
    echo -e "${GREEN}✓ SSL certificate obtained!${NC}"
    
    # Reload nginx
    echo -e "${YELLOW}Reloading nginx...${NC}"
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" exec nginx nginx -s reload
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ SSL Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    echo -e "Your site is now available at: ${BLUE}https://${DOMAIN}${NC}\n"
else
    echo -e "\n${RED}❌ Failed to obtain SSL certificate${NC}\n"
    echo -e "${YELLOW}Common issues:${NC}"
    echo -e "  1. DNS not fully propagated (wait 5-30 minutes)"
    echo -e "  2. Port 80 not accessible from internet"
    echo -e "  3. Firewall blocking port 80"
    echo -e "\n${YELLOW}Check:${NC}"
    echo -e "  - DNS: dig $DOMAIN +short"
    echo -e "  - Firewall: sudo ufw status"
    echo -e "  - Nginx logs: $DOCKER_COMPOSE -f $COMPOSE_FILE logs nginx"
    exit 1
fi
