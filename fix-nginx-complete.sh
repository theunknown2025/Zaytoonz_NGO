#!/bin/bash

# Complete fix for nginx configuration issues
# Fixes placeholders, http2 directive, and handles certificate setup

set -e

DOMAIN="beta-zaytoonz.pro"
VPS_IP="76.13.57.178"
NGINX_CONF="nginx-beta.conf"
COMPOSE_FILE="docker-compose-beta.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_info() { echo -e "${BLUE}[i]${NC} $1"; }

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Complete Nginx Configuration Fix${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Check if nginx config exists
if [ ! -f "$NGINX_CONF" ]; then
    print_error "$NGINX_CONF not found"
    if [ -f "setup-nginx-beta.sh" ]; then
        print_info "Creating nginx configuration..."
        bash setup-nginx-beta.sh
    else
        print_error "setup-nginx-beta.sh not found!"
        exit 1
    fi
fi

# Step 2: Fix DOMAIN_PLACEHOLDER
print_info "Fixing DOMAIN_PLACEHOLDER..."
if grep -q "DOMAIN_PLACEHOLDER" "$NGINX_CONF"; then
    sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$NGINX_CONF"
    print_success "Domain placeholder replaced with $DOMAIN"
else
    print_info "No domain placeholder found (already fixed)"
fi

# Step 3: Fix VPS_IP_PLACEHOLDER
print_info "Fixing VPS_IP_PLACEHOLDER..."
if grep -q "VPS_IP_PLACEHOLDER" "$NGINX_CONF"; then
    sed -i "s/VPS_IP_PLACEHOLDER/${VPS_IP}/g" "$NGINX_CONF"
    print_success "IP placeholder replaced with $VPS_IP"
else
    print_info "No IP placeholder found (already fixed)"
fi

# Step 4: Fix deprecated http2 directive
print_info "Fixing deprecated http2 directive..."
if grep -q "listen.*ssl http2" "$NGINX_CONF"; then
    # Replace deprecated syntax
    sed -i 's/listen 443 ssl http2;/listen 443 ssl;/g' "$NGINX_CONF"
    sed -i 's/listen \[::\]:443 ssl http2;/listen [::]:443 ssl;/g' "$NGINX_CONF"
    
    # Add http2 on; after the listen directives in HTTPS server block
    # Find the HTTPS server block and add http2 on; after listen directives
    awk '
    /listen \[::\]:443 ssl;/ {
        print
        if (!http2_added) {
            print "        http2 on;"
            http2_added = 1
        }
        next
    }
    { print }
    ' "$NGINX_CONF" > "$NGINX_CONF.tmp" && mv "$NGINX_CONF.tmp" "$NGINX_CONF"
    
    print_success "HTTP/2 directive fixed"
else
    print_info "HTTP/2 directive already correct"
fi

# Step 5: Verify fixes
print_info "Verifying configuration..."
if grep -q "DOMAIN_PLACEHOLDER\|VPS_IP_PLACEHOLDER" "$NGINX_CONF"; then
    print_error "Some placeholders still exist!"
    grep "DOMAIN_PLACEHOLDER\|VPS_IP_PLACEHOLDER" "$NGINX_CONF"
    exit 1
else
    print_success "All placeholders replaced"
fi

# Step 6: Check certificate status
print_info "Checking certificate status..."
if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    print_success "Certificate exists"
    ls -lh certbot/conf/live/$DOMAIN/
else
    print_warning "Certificate not found yet"
    print_info "You'll need to create a temporary certificate or get a real one"
    
    # Option: Create temporary certificate
    read -p "Create temporary certificate now? (Y/n) " create_temp
    if [ "$create_temp" != "n" ] && [ "$create_temp" != "N" ]; then
        print_info "Creating temporary certificate..."
        mkdir -p certbot/conf/live/$DOMAIN
        
        docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
          openssl req -x509 -nodes -newkey rsa:4096 -days 1\
            -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
            -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
            -subj '/CN=localhost'" certbot
        
        if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
            print_success "Temporary certificate created"
        else
            print_error "Failed to create temporary certificate"
        fi
    fi
fi

# Step 7: Test nginx configuration
print_info "Testing nginx configuration..."
if docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 | grep -q "successful"; then
    print_success "Nginx configuration test passed!"
    
    # Reload nginx
    print_info "Reloading nginx..."
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload 2>/dev/null || \
    docker compose -f "$COMPOSE_FILE" restart nginx
    
    print_success "Nginx reloaded"
else
    print_error "Nginx configuration test failed"
    print_info "Testing configuration..."
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -t
    exit 1
fi

# Step 8: Show summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Fix Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

print_info "Configuration file: $NGINX_CONF"
print_info "Domain: $DOMAIN"
print_info "Certificate path: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"

echo ""
print_info "Next steps:"
echo "  1. If using temporary certificate, request real one:"
echo "     ${GREEN}docker compose -f $COMPOSE_FILE run --rm --entrypoint 'certbot certonly --webroot -w /var/www/certbot -m support@zaytoonz.com -d $DOMAIN --rsa-key-size 4096 --agree-tos --force-renewal' certbot${NC}"
echo ""
echo "  2. After getting real certificate, reload nginx:"
echo "     ${GREEN}docker compose -f $COMPOSE_FILE exec nginx nginx -s reload${NC}"
echo ""
echo "  3. Test your site:"
echo "     ${GREEN}curl -I https://$DOMAIN${NC}"
