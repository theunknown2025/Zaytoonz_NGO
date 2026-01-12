#!/bin/bash
# Fix Nginx configuration for Python scraper proxy

echo "🔧 Fixing Nginx configuration for Python scraper..."

NGINX_CONFIG="/etc/nginx/sites-available/zaytoonz-ngo"

# Check if config exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "❌ Nginx config not found at $NGINX_CONFIG"
    exit 1
fi

# Backup the config
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo "✓ Backed up config"

# Check if /api/scraper/ location exists
if grep -q "location /api/scraper" "$NGINX_CONFIG"; then
    echo "✓ /api/scraper/ location already exists"
else
    echo "⚠️  /api/scraper/ location not found, adding it..."
    
    # Find the line with "# Handle Next.js API routes" and add scraper location BEFORE it
    if grep -q "# Handle Next.js API routes" "$NGINX_CONFIG"; then
        # Insert the scraper location block BEFORE the /api/ block
        sed -i '/# Handle Next.js API routes/i\
    # Python Scraper API - MUST come before /api/ location\
    location /api/scraper/ {\
        proxy_pass http://localhost:8000/;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_read_timeout 300s;\
        proxy_connect_timeout 75s;\
    }\
' "$NGINX_CONFIG"
        echo "✓ Added /api/scraper/ location block"
    else
        echo "⚠️  Could not find insertion point, please add manually"
    fi
fi

# Test Nginx config
echo ""
echo "🧪 Testing Nginx configuration..."
if nginx -t; then
    echo "✓ Nginx config is valid"
    echo ""
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    echo "✓ Nginx reloaded"
else
    echo "❌ Nginx config test failed!"
    echo "Restoring backup..."
    cp "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_CONFIG"
    exit 1
fi

echo ""
echo "✅ Done! Test with:"
echo "   curl http://localhost/api/scraper/api/scrape -X POST -H 'Content-Type: application/json' -d '{\"url\":\"https://example.com\",\"fields\":[\"title\"]}'"

