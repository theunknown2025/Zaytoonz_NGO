#!/bin/bash

# Manual SSL Certificate Setup Script
# Interactive guide for setting up SSL certificates step by step

set -e

# Configuration
DOMAIN="beta-zaytoonz.pro"
VPS_IP="76.13.57.178"
EMAIL="support@zaytoonz.com"
APP_DIR="/opt/zaytoonz-ngo"
COMPOSE_FILE="docker-compose-beta.yml"
DATA_PATH="./certbot"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print status
print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_step() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Navigate to application directory
cd "$APP_DIR" || {
    print_error "Application directory not found: $APP_DIR"
    exit 1
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Manual SSL Certificate Setup${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Verify DNS
print_step "Step 1: Verifying DNS Configuration"

print_info "Checking DNS for $DOMAIN..."
DNS_RESULT=$(dig +short "$DOMAIN" 2>/dev/null | head -n1 || echo "")

if [ -z "$DNS_RESULT" ]; then
    print_error "DNS lookup failed for $DOMAIN"
    print_warning "Please ensure DNS is configured: $DOMAIN → $VPS_IP"
    read -p "Continue anyway? (y/N) " continue_dns
    if [ "$continue_dns" != "y" ] && [ "$continue_dns" != "Y" ]; then
        exit 1
    fi
elif [ "$DNS_RESULT" = "$VPS_IP" ]; then
    print_success "DNS is correctly pointing to $VPS_IP"
else
    print_warning "DNS points to $DNS_RESULT, expected $VPS_IP"
    read -p "Continue anyway? (y/N) " continue_dns
    if [ "$continue_dns" != "y" ] && [ "$continue_dns" != "Y" ]; then
        exit 1
    fi
fi

# Step 2: Check Environment
print_step "Step 2: Checking Environment Configuration"

if [ ! -f ".env.production" ]; then
    print_error ".env.production not found!"
    exit 1
fi

if [ ! -f ".env" ]; then
    print_info "Creating .env symlink..."
    ln -sf .env.production .env
    print_success ".env symlink created"
else
    print_info ".env file already exists"
fi

# Step 3: Check Nginx Config
print_step "Step 3: Checking Nginx Configuration"

if [ ! -f "nginx-beta.conf" ]; then
    print_warning "nginx-beta.conf not found"
    if [ -f "setup-nginx-beta.sh" ]; then
        print_info "Creating nginx configuration..."
        bash setup-nginx-beta.sh
        print_success "Nginx configuration created"
    else
        print_error "setup-nginx-beta.sh not found. Cannot create nginx config."
        exit 1
    fi
else
    print_success "nginx-beta.conf exists"
fi

# Step 4: Create Certbot Directories
print_step "Step 4: Creating Certbot Directories"

mkdir -p "$DATA_PATH/conf"
mkdir -p "$DATA_PATH/www"
chmod -R 755 "$DATA_PATH/"
print_success "Certbot directories created"

# Step 5: Download TLS Parameters
print_step "Step 5: Downloading TLS Parameters"

if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
    print_info "Downloading recommended TLS parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$DATA_PATH/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$DATA_PATH/conf/ssl-dhparams.pem"
    print_success "TLS parameters downloaded"
else
    print_info "TLS parameters already exist"
fi

# Step 6: Create Temporary Certificate
print_step "Step 6: Creating Temporary SSL Certificate"

print_info "This allows nginx to start before we get the real certificate..."
read -p "Continue? (Y/n) " continue_temp
if [ "$continue_temp" != "n" ] && [ "$continue_temp" != "N" ]; then
    mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
    
    print_info "Creating temporary certificate..."
    docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
      openssl req -x509 -nodes -newkey rsa:4096 -days 1\
        -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
        -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
        -subj '/CN=localhost'" certbot
    
    if [ -f "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" ]; then
        print_success "Temporary certificate created"
    else
        print_error "Failed to create temporary certificate"
        exit 1
    fi
else
    print_info "Skipping temporary certificate creation"
fi

# Step 7: Start Nginx
print_step "Step 7: Starting Nginx Container"

print_info "Starting nginx with temporary certificate..."
docker compose -f "$COMPOSE_FILE" up -d nginx

print_info "Waiting for nginx to start..."
sleep 10

# Check nginx status
NGINX_STATUS=$(docker compose -f "$COMPOSE_FILE" ps nginx 2>/dev/null | grep -c "Up" || echo "0")

if [ "$NGINX_STATUS" -gt 0 ]; then
    print_success "Nginx is running"
    
    # Test nginx config
    print_info "Testing nginx configuration..."
    if docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 | grep -q "successful"; then
        print_success "Nginx configuration is valid"
    else
        print_warning "Nginx configuration test had issues"
        print_info "Nginx logs:"
        docker compose -f "$COMPOSE_FILE" logs nginx --tail=10
    fi
else
    print_error "Nginx failed to start"
    print_info "Checking nginx logs..."
    docker compose -f "$COMPOSE_FILE" logs nginx --tail=30
    echo ""
    print_error "Please fix nginx issues before continuing"
    exit 1
fi

# Step 8: Delete Temporary Certificate
print_step "Step 8: Removing Temporary Certificate"

print_info "Removing temporary certificate to make way for real one..."
read -p "Continue? (Y/n) " continue_remove
if [ "$continue_remove" != "n" ] && [ "$continue_remove" != "N" ]; then
    docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
      rm -Rf /etc/letsencrypt/live/$DOMAIN && \
      rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
      rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot
    
    print_success "Temporary certificate removed"
else
    print_info "Keeping temporary certificate"
fi

# Step 9: Request Let's Encrypt Certificate
print_step "Step 9: Requesting Let's Encrypt Certificate"

print_info "This will request a real SSL certificate from Let's Encrypt"
print_info "Domain: $DOMAIN"
print_info "Email: $EMAIL"
echo ""
print_warning "Make sure:"
print_warning "  1. DNS is pointing to $VPS_IP"
print_warning "  2. Port 80 is accessible from internet"
print_warning "  3. Nginx is running and serving on port 80"
echo ""

read -p "Ready to request certificate? (Y/n) " continue_cert
if [ "$continue_cert" = "n" ] || [ "$continue_cert" = "N" ]; then
    print_info "Certificate request cancelled"
    exit 0
fi

print_info "Requesting certificate (this may take a minute)..."
CERT_RESULT=$(docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    -m $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot 2>&1)

if echo "$CERT_RESULT" | grep -q "Successfully received certificate"; then
    print_success "SSL certificate obtained successfully!"
    echo "$CERT_RESULT" | grep -E "Certificate is saved at|Congratulations"
else
    print_error "Failed to obtain SSL certificate"
    echo ""
    echo "$CERT_RESULT"
    echo ""
    print_info "Common issues:"
    print_info "  1. DNS not fully propagated - wait 5-30 minutes"
    print_info "  2. Port 80 not accessible - check firewall: ufw allow 80/tcp"
    print_info "  3. Nginx not running - check: docker compose -f $COMPOSE_FILE ps nginx"
    print_info "  4. Domain already has certificate - try with --force-renewal"
    exit 1
fi

# Step 10: Verify Certificate
print_step "Step 10: Verifying Certificate"

if [ -f "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" ]; then
    print_success "Certificate files exist"
    ls -lh "$DATA_PATH/conf/live/$DOMAIN/"
    
    # Check certificate details
    print_info "Certificate details:"
    docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
      openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -text -noout | grep -E 'Subject:|Issuer:|Not Before|Not After'" certbot
else
    print_error "Certificate files not found!"
    exit 1
fi

# Step 11: Reload Nginx
print_step "Step 11: Reloading Nginx with Real Certificate"

print_info "Testing nginx configuration..."
if docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 | grep -q "successful"; then
    print_success "Nginx configuration test passed"
    
    print_info "Reloading nginx..."
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload
    
    if [ $? -eq 0 ]; then
        print_success "Nginx reloaded successfully"
    else
        print_warning "Nginx reload had issues, trying restart..."
        docker compose -f "$COMPOSE_FILE" restart nginx
        sleep 5
        docker compose -f "$COMPOSE_FILE" ps nginx | grep -q "Up" && print_success "Nginx restarted" || print_error "Nginx restart failed"
    fi
else
    print_error "Nginx configuration test failed"
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -t
    exit 1
fi

# Step 12: Test SSL
print_step "Step 12: Testing SSL Configuration"

print_info "Testing HTTP to HTTPS redirect..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    print_success "HTTP redirects to HTTPS (status: $HTTP_STATUS)"
else
    print_warning "HTTP redirect test returned status: $HTTP_STATUS"
fi

print_info "Testing HTTPS connection..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k "https://$DOMAIN" 2>/dev/null || echo "000")

if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
    print_success "HTTPS is working (status: $HTTPS_STATUS)"
else
    print_warning "HTTPS test returned status: $HTTPS_STATUS"
fi

print_info "Testing SSL certificate validity..."
CERT_DATES=$(openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")

if [ -n "$CERT_DATES" ]; then
    print_success "SSL certificate is valid"
    echo "$CERT_DATES"
else
    print_warning "Could not verify certificate dates"
fi

# Final Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}SSL Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${GREEN}Your application is now accessible at:${NC}"
echo -e "  🌐 HTTP:  ${BLUE}http://${DOMAIN}${NC} (redirects to HTTPS)"
echo -e "  🔒 HTTPS: ${BLUE}https://${DOMAIN}${NC}"
echo -e "  📍 IP:    ${BLUE}http://${VPS_IP}${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Test your application: ${GREEN}https://${DOMAIN}${NC}"
echo -e "  2. Check browser for padlock icon"
echo -e "  3. Verify Supabase connection"
echo -e "  4. Test authentication features\n"

echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View nginx logs:    ${GREEN}docker compose -f $COMPOSE_FILE logs nginx -f${NC}"
echo -e "  Check certificate:   ${GREEN}docker compose -f $COMPOSE_FILE run --rm --entrypoint 'certbot certificates' certbot${NC}"
echo -e "  Renew certificate:   ${GREEN}docker compose -f $COMPOSE_FILE run --rm --entrypoint 'certbot renew' certbot${NC}"
echo -e "  Restart nginx:       ${GREEN}docker compose -f $COMPOSE_FILE restart nginx${NC}\n"

echo -e "${GREEN}✅ Manual SSL setup complete!${NC}\n"
