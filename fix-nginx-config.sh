#!/bin/bash

# Quick script to fix nginx configuration issues

set -e

DOMAIN="beta-zaytoonz.pro"
VPS_IP="76.13.57.178"
NGINX_CONF="nginx-beta.conf"

echo "🔧 Fixing Nginx Configuration..."

# Check if nginx config exists
if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ nginx-beta.conf not found. Creating it..."
    if [ -f "setup-nginx-beta.sh" ]; then
        bash setup-nginx-beta.sh
    else
        echo "❌ setup-nginx-beta.sh not found!"
        exit 1
    fi
fi

# Fix DOMAIN_PLACEHOLDER if it exists
if grep -q "DOMAIN_PLACEHOLDER" "$NGINX_CONF"; then
    echo "🔧 Replacing DOMAIN_PLACEHOLDER with $DOMAIN..."
    sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$NGINX_CONF"
    echo "✅ Domain placeholder replaced"
fi

# Fix VPS_IP_PLACEHOLDER if it exists
if grep -q "VPS_IP_PLACEHOLDER" "$NGINX_CONF"; then
    echo "🔧 Replacing VPS_IP_PLACEHOLDER with $VPS_IP..."
    sed -i "s/VPS_IP_PLACEHOLDER/${VPS_IP}/g" "$NGINX_CONF"
    echo "✅ IP placeholder replaced"
fi

# Fix deprecated http2 directive (change "listen 443 ssl http2" to "listen 443 ssl" and add "http2 on;")
if grep -q "listen.*ssl http2" "$NGINX_CONF"; then
    echo "🔧 Fixing deprecated http2 directive..."
    # Replace "listen 443 ssl http2;" with "listen 443 ssl;"
    sed -i 's/listen 443 ssl http2;/listen 443 ssl;/g' "$NGINX_CONF"
    sed -i 's/listen \[::\]:443 ssl http2;/listen [::]:443 ssl;/g' "$NGINX_CONF"
    
    # Add "http2 on;" after server_name in HTTPS server block
    sed -i '/server_name.*443 ssl;/,/server_name/a\        http2 on;' "$NGINX_CONF" 2>/dev/null || \
    sed -i '/listen \[::\]:443 ssl;/a\        http2 on;' "$NGINX_CONF"
    
    echo "✅ HTTP/2 directive fixed"
fi

# Verify the fixes
echo ""
echo "🔍 Verifying configuration..."
if grep -q "DOMAIN_PLACEHOLDER\|VPS_IP_PLACEHOLDER" "$NGINX_CONF"; then
    echo "⚠️  Warning: Some placeholders still exist"
    grep "DOMAIN_PLACEHOLDER\|VPS_IP_PLACEHOLDER" "$NGINX_CONF"
else
    echo "✅ No placeholders found"
fi

# Check if certificate path is correct
if grep -q "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$NGINX_CONF"; then
    echo "✅ Certificate path is correct"
else
    echo "⚠️  Warning: Certificate path might be incorrect"
    grep "ssl_certificate" "$NGINX_CONF" | head -2
fi

echo ""
echo "✅ Nginx configuration fixed!"
echo ""
echo "Next steps:"
echo "  1. Test nginx config: docker compose -f docker-compose-beta.yml exec nginx nginx -t"
echo "  2. If test passes, reload nginx: docker compose -f docker-compose-beta.yml exec nginx nginx -s reload"
