#!/bin/bash

# Step 8: Setup SSL/HTTPS (Optional)
# Installs SSL certificate using Certbot

set -e

echo "================================================================"
echo "  Step 8: Setting Up SSL/HTTPS (Optional)"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DOMAIN="${DOMAIN:-zaytoonz.com}"
SKIP_SSL="${SKIP_SSL:-false}"

if [ "$SKIP_SSL" = "true" ]; then
    echo "[*] SSL setup skipped (SKIP_SSL=true)"
    exit 0
fi

echo "[*] Domain: $DOMAIN"
echo "[*] This step will install SSL certificate using Certbot"
echo ""

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "[*] Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Check if SSL already exists
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${YELLOW}[INFO] SSL certificate already exists for $DOMAIN${NC}"
    echo "[*] To renew: certbot renew"
    exit 0
fi

echo "[*] Obtaining SSL certificate..."
echo -e "${YELLOW}[NOTE] You will be prompted for:${NC}"
echo "  - Email address"
echo "  - Agreement to terms of service"
echo "  - Redirect HTTP to HTTPS (recommended: Yes)"
echo ""

certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}[SUCCESS] SSL certificate installed${NC}"
    
    # Test auto-renewal
    echo "[*] Testing auto-renewal..."
    certbot renew --dry-run
    
    echo ""
    echo "[*] SSL certificate will auto-renew before expiration"
else
    echo ""
    echo -e "${YELLOW}[WARNING] SSL certificate installation may have failed${NC}"
    echo "[*] You can run this step manually later:"
    echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

