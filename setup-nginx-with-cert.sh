#!/bin/bash
# Setup Nginx with SSL Certificate
# This script creates a temporary certificate, starts nginx, then optionally gets real certificate

set -e

DOMAIN="beta-zaytoonz.pro"
EMAIL="support@zaytoonz.com"
COMPOSE_FILE="docker-compose-beta.yml"
DATA_PATH="./certbot"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_info() { echo -e "${BLUE}[i]${NC} $1"; }

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Nginx SSL Certificate Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Step 1: Create certbot directories
print_info "Step 1: Creating certbot directories..."
mkdir -p "${DATA_PATH}/conf/live/${DOMAIN}"
mkdir -p "${DATA_PATH}/www"
print_success "Directories created"

# Step 2: Check if certificate already exists
print_info "Step 2: Checking for existing certificate..."
if [ -f "${DATA_PATH}/conf/live/${DOMAIN}/fullchain.pem" ]; then
    print_warning "Certificate already exists"
    read -p "Replace with temporary certificate? (y/N) " replace_cert
    if [ "$replace_cert" != "y" ] && [ "$replace_cert" != "Y" ]; then
        print_info "Keeping existing certificate"
        SKIP_TEMP_CERT=1
    else
        SKIP_TEMP_CERT=0
    fi
else
    SKIP_TEMP_CERT=0
fi

# Step 3: Create temporary certificate
if [ "$SKIP_TEMP_CERT" -eq 0 ]; then
    print_info "Step 3: Creating temporary certificate..."
    
    if $DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
      openssl req -x509 -nodes -newkey rsa:4096 -days 1\
        -keyout '/etc/letsencrypt/live/${DOMAIN}/privkey.pem' \
        -out '/etc/letsencrypt/live/${DOMAIN}/fullchain.pem' \
        -subj '/CN=${DOMAIN}'" certbot; then
        print_success "Temporary certificate created"
    else
        print_error "Failed to create temporary certificate"
        exit 1
    fi
    
    # Verify certificate files exist
    if [ -f "${DATA_PATH}/conf/live/${DOMAIN}/fullchain.pem" ] && \
       [ -f "${DATA_PATH}/conf/live/${DOMAIN}/privkey.pem" ]; then
        print_success "Certificate files verified"
        ls -lh "${DATA_PATH}/conf/live/${DOMAIN}/"
    else
        print_error "Certificate files not found after creation!"
        exit 1
    fi
else
    print_info "Skipping temporary certificate creation"
fi

# Step 4: Start nginx
print_info "Step 4: Starting nginx container..."
$DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d nginx

print_info "Waiting for nginx to start..."
sleep 5

# Check nginx status
NGINX_STATUS=$($DOCKER_COMPOSE -f "$COMPOSE_FILE" ps nginx 2>/dev/null | grep -c "Up" || echo "0")

if [ "$NGINX_STATUS" -gt 0 ]; then
    print_success "Nginx container is running"
else
    print_error "Nginx container failed to start"
    print_info "Checking logs..."
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" logs nginx --tail=30
    exit 1
fi

# Step 5: Test nginx configuration
print_info "Step 5: Testing nginx configuration..."
if $DOCKER_COMPOSE -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 | grep -q "successful"; then
    print_success "Nginx configuration test passed!"
else
    print_error "Nginx configuration test failed!"
    print_info "Configuration errors:"
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" exec nginx nginx -t
    exit 1
fi

# Step 6: Verify nginx is serving
print_info "Step 6: Verifying nginx is serving requests..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    print_success "Nginx is serving requests (HTTP $HTTP_STATUS)"
else
    print_warning "Health check returned status: $HTTP_STATUS"
fi

# Step 7: Ask about real certificate
echo ""
print_info "Step 7: Real SSL Certificate"
echo ""
print_warning "Nginx is now running with a temporary certificate."
print_info "To get a real Let's Encrypt certificate, you need:"
echo "  1. DNS pointing to this server"
echo "  2. Port 80 accessible from internet"
echo "  3. Nginx running (which we just verified)"
echo ""

read -p "Get real Let's Encrypt certificate now? (y/N) " get_real_cert

if [ "$get_real_cert" = "y" ] || [ "$get_real_cert" = "Y" ]; then
    print_info "Removing temporary certificate..."
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
      rm -Rf /etc/letsencrypt/live/${DOMAIN} && \
      rm -Rf /etc/letsencrypt/archive/${DOMAIN} && \
      rm -Rf /etc/letsencrypt/renewal/${DOMAIN}.conf" certbot 2>/dev/null || true
    
    print_info "Requesting Let's Encrypt certificate..."
    print_warning "This may take a minute..."
    
    if $DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
      certbot certonly --webroot -w /var/www/certbot \
        -m ${EMAIL} \
        -d ${DOMAIN} \
        --rsa-key-size 4096 \
        --agree-tos \
        --force-renewal" certbot; then
        
        print_success "Real SSL certificate obtained!"
        
        # Reload nginx
        print_info "Reloading nginx with real certificate..."
        if $DOCKER_COMPOSE -f "$COMPOSE_FILE" exec nginx nginx -s reload 2>/dev/null; then
            print_success "Nginx reloaded successfully"
        else
            print_warning "Reload failed, restarting nginx..."
            $DOCKER_COMPOSE -f "$COMPOSE_FILE" restart nginx
            sleep 3
        fi
        
        # Test HTTPS
        print_info "Testing HTTPS connection..."
        HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k https://${DOMAIN} 2>/dev/null || echo "000")
        
        if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
            print_success "HTTPS is working (status: $HTTPS_STATUS)"
        else
            print_warning "HTTPS test returned status: $HTTPS_STATUS"
        fi
    else
        print_error "Failed to obtain real certificate"
        print_info "Common issues:"
        echo "  1. DNS not fully propagated"
        echo "  2. Port 80 not accessible from internet"
        echo "  3. Firewall blocking port 80"
        echo ""
        print_info "You can retry later with:"
        echo "  docker compose -f $COMPOSE_FILE run --rm --entrypoint 'certbot certonly --webroot -w /var/www/certbot -m $EMAIL -d $DOMAIN --rsa-key-size 4096 --agree-tos --force-renewal' certbot"
        exit 1
    fi
else
    print_info "Skipping real certificate. Nginx is running with temporary certificate."
    print_info "To get real certificate later, run:"
    echo "  docker compose -f $COMPOSE_FILE run --rm --entrypoint 'certbot certonly --webroot -w /var/www/certbot -m $EMAIL -d $DOMAIN --rsa-key-size 4096 --agree-tos --force-renewal' certbot"
fi

# Final summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

print_info "Nginx is running and accessible at:"
echo "  🌐 HTTP:  http://${DOMAIN}"
echo "  🔒 HTTPS: https://${DOMAIN}"
echo ""

print_info "Useful commands:"
echo "  View logs:    ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} logs nginx -f"
echo "  Test config:  ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} exec nginx nginx -t"
echo "  Reload:       ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} exec nginx nginx -s reload"
echo "  Restart:      ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} restart nginx"
echo ""
