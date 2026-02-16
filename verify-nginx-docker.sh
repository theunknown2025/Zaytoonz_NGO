#!/bin/bash

# Verify Nginx Configuration for Docker Deployment

set -e

COMPOSE_FILE="docker-compose-beta.yml"
NGINX_CONF="nginx-beta.conf"
DOMAIN="beta-zaytoonz.pro"

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
echo -e "${BLUE}Nginx Docker Configuration Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check 1: Nginx config file exists
print_info "1. Checking nginx configuration file..."
if [ -f "$NGINX_CONF" ]; then
    print_success "nginx-beta.conf exists"
else
    print_error "nginx-beta.conf not found!"
    print_info "Creating it..."
    if [ -f "setup-nginx-beta.sh" ]; then
        bash setup-nginx-beta.sh
    else
        print_error "Cannot create nginx config. setup-nginx-beta.sh not found."
        exit 1
    fi
fi

# Check 2: No placeholders
print_info "2. Checking for placeholders..."
if grep -q "DOMAIN_PLACEHOLDER\|VPS_IP_PLACEHOLDER" "$NGINX_CONF"; then
    print_error "Placeholders found in nginx config!"
    grep "DOMAIN_PLACEHOLDER\|VPS_IP_PLACEHOLDER" "$NGINX_CONF"
    print_info "Run: ./fix-nginx-complete.sh to fix this"
    exit 1
else
    print_success "No placeholders found"
fi

# Check 3: Docker service names are used
print_info "3. Checking Docker service names..."
if grep -q "nextjs:3000\|python-scraper:8000" "$NGINX_CONF"; then
    print_success "Using Docker service names (nextjs, python-scraper)"
else
    print_warning "Not using Docker service names"
    if grep -q "localhost\|127.0.0.1" "$NGINX_CONF"; then
        print_error "Found localhost/127.0.0.1 - should use Docker service names!"
        print_info "In Docker, use service names: nextjs, python-scraper"
    fi
fi

# Check 4: HTTP/2 syntax
print_info "4. Checking HTTP/2 directive..."
if grep -q "listen.*ssl http2" "$NGINX_CONF"; then
    print_error "Deprecated http2 syntax found!"
    print_info "Should use: listen 443 ssl; and http2 on; separately"
    exit 1
elif grep -q "http2 on;" "$NGINX_CONF"; then
    print_success "HTTP/2 directive is correct"
else
    print_warning "HTTP/2 not explicitly enabled (optional)"
fi

# Check 5: SSL certificate paths
print_info "5. Checking SSL certificate paths..."
if grep -q "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$NGINX_CONF"; then
    print_success "SSL certificate path is correct"
else
    print_warning "SSL certificate path might be incorrect"
    grep "ssl_certificate" "$NGINX_CONF" | head -2
fi

# Check 6: Docker Compose configuration
print_info "6. Checking Docker Compose nginx service..."
if grep -q "nginx-beta.conf:/etc/nginx/nginx.conf" "$COMPOSE_FILE"; then
    print_success "Docker Compose mounts nginx-beta.conf correctly"
else
    print_error "Docker Compose nginx volume mount not found!"
    print_info "Should have: ./nginx-beta.conf:/etc/nginx/nginx.conf:ro"
fi

# Check 7: Network configuration
print_info "7. Checking Docker network..."
if grep -q "zaytoonz-network" "$COMPOSE_FILE"; then
    print_success "Docker network configured"
    
    # Check if nginx and nextjs are on same network
    if grep -A 10 "nginx:" "$COMPOSE_FILE" | grep -q "zaytoonz-network" && \
       grep -A 10 "nextjs:" "$COMPOSE_FILE" | grep -q "zaytoonz-network"; then
        print_success "Nginx and Next.js are on the same network"
    else
        print_warning "Network configuration might be incorrect"
    fi
else
    print_error "Docker network not found!"
fi

# Check 8: Certificate volumes
print_info "8. Checking certificate volumes..."
if grep -q "certbot/conf:/etc/letsencrypt" "$COMPOSE_FILE"; then
    print_success "Certbot volume mounted correctly"
else
    print_warning "Certbot volume mount might be missing"
fi

# Check 9: Test nginx config syntax (if container is running)
print_info "9. Testing nginx configuration syntax..."
if docker compose -f "$COMPOSE_FILE" ps nginx 2>/dev/null | grep -q "Up"; then
    if docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 | grep -q "successful"; then
        print_success "Nginx configuration test passed!"
    else
        print_error "Nginx configuration test failed!"
        docker compose -f "$COMPOSE_FILE" exec nginx nginx -t
        exit 1
    fi
else
    print_warning "Nginx container not running - cannot test config"
    print_info "Start nginx first: docker compose -f $COMPOSE_FILE up -d nginx"
fi

# Check 10: Verify upstream connectivity
print_info "10. Checking upstream services..."
if docker compose -f "$COMPOSE_FILE" ps nextjs 2>/dev/null | grep -q "Up"; then
    print_success "Next.js container is running"
else
    print_warning "Next.js container is not running"
fi

if docker compose -f "$COMPOSE_FILE" ps python-scraper 2>/dev/null | grep -q "Up"; then
    print_success "Python scraper container is running"
else
    print_warning "Python scraper container is not running (optional)"
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Verification Complete${NC}"
echo -e "${GREEN}========================================${NC}\n"

print_info "Configuration file: $NGINX_CONF"
print_info "Docker Compose file: $COMPOSE_FILE"
print_info "Domain: $DOMAIN"

echo ""
print_info "Key points for Docker deployment:"
echo "  ✓ Using Docker service names (nextjs, python-scraper)"
echo "  ✓ All containers on same network (zaytoonz-network)"
echo "  ✓ Nginx config mounted as read-only"
echo "  ✓ Certificate volumes properly mounted"

echo ""
print_info "If nginx is not working:"
echo "  1. Check logs: docker compose -f $COMPOSE_FILE logs nginx"
echo "  2. Test config: docker compose -f $COMPOSE_FILE exec nginx nginx -t"
echo "  3. Restart nginx: docker compose -f $COMPOSE_FILE restart nginx"
