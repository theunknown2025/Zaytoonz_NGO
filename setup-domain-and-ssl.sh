#!/bin/bash

set -e

# Configuration
DOMAIN="beta-zaytoonz.pro"
VPS_IP="76.13.57.178"
EMAIL="support@zaytoonz.com"
APP_DIR="/opt/zaytoonz-ngo"
COMPOSE_FILE="docker-compose-beta.yml"
NGINX_CONF="nginx-beta.conf"
RSA_KEY_SIZE=4096
DATA_PATH="./certbot"
STAGING=0  # Set to 1 for testing to avoid hitting request limits

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Domain & SSL Setup for ${DOMAIN}${NC}"
echo -e "${BLUE}========================================${NC}\n"

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

# Step 1: Verify DNS Configuration
echo -e "\n${YELLOW}Step 1: Verifying DNS Configuration${NC}"

DNS_RESULT=$(dig +short "$DOMAIN" | head -n1 || echo "")

if [ -z "$DNS_RESULT" ]; then
    print_error "DNS lookup failed for $DOMAIN"
    print_info "Please ensure DNS is configured correctly"
    print_info "Expected A record: $DOMAIN → $VPS_IP"
    exit 1
fi

if [ "$DNS_RESULT" = "$VPS_IP" ]; then
    print_success "DNS is correctly pointing to $VPS_IP"
else
    print_warning "DNS points to $DNS_RESULT, expected $VPS_IP"
    print_info "Continuing anyway, but SSL certificate may fail if DNS is incorrect"
fi

# Step 2: Ensure .env file exists
echo -e "\n${YELLOW}Step 2: Checking Environment Configuration${NC}"

if [ ! -f ".env.production" ]; then
    print_error ".env.production not found!"
    exit 1
fi

# Create .env symlink if it doesn't exist
if [ ! -f ".env" ]; then
    ln -sf .env.production .env
    print_success "Created .env symlink pointing to .env.production"
else
    print_info ".env file already exists"
fi

# Step 3: Ensure Docker containers are running
echo -e "\n${YELLOW}Step 3: Checking Docker Containers${NC}"

# Check if docker compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "docker-compose is not installed"
    exit 1
fi

# Use docker compose plugin if available
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Check if containers are running
if ! $DOCKER_COMPOSE -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    print_warning "Docker containers are not running. Starting them..."
    
    # Load environment variables
    set -a
    [ -f .env.production ] && source .env.production 2>/dev/null || true
    set +a
    
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d
    
    print_info "Waiting for containers to be ready..."
    sleep 10
else
    print_success "Docker containers are running"
fi

# Step 4: Setup Nginx Configuration
echo -e "\n${YELLOW}Step 4: Setting up Nginx Configuration${NC}"

if [ -f "setup-nginx-beta.sh" ]; then
    bash setup-nginx-beta.sh
    print_success "Nginx configuration created"
else
    print_warning "setup-nginx-beta.sh not found, creating nginx config manually..."
    
    # Create nginx configuration
    cat > "$NGINX_CONF" << NGINXEOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    upstream nextjs_backend {
        server nextjs:3000 max_fails=3 fail_timeout=30s;
    }

    upstream scraper_backend {
        server python-scraper:8000 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 80;
        listen [::]:80;
        server_name ${DOMAIN} ${VPS_IP};

        client_max_body_size 100M;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files \$uri =404;
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name ${DOMAIN} ${VPS_IP};

        ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_session_tickets off;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

        client_max_body_size 100M;

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        location /scraper-api/ {
            proxy_pass http://scraper_backend/;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 75s;
            proxy_send_timeout 600s;
            proxy_read_timeout 600s;
            proxy_cache_bypass \$http_upgrade;
        }

        location / {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 75s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
            proxy_busy_buffers_size 8k;
            proxy_cache_bypass \$http_upgrade;
        }

        location /_next/static/ {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location /public/ {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            expires 7d;
            add_header Cache-Control "public";
        }

        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
}
NGINXEOF
    
    print_success "Nginx configuration created: $NGINX_CONF"
fi

# Step 5: Ensure certbot directories exist
echo -e "\n${YELLOW}Step 5: Preparing SSL Certificate Directories${NC}"

mkdir -p "$DATA_PATH/conf"
mkdir -p "$DATA_PATH/www"
print_success "Certificate directories created"

# Step 6: Download TLS parameters if needed
if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
    print_info "Downloading recommended TLS parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$DATA_PATH/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$DATA_PATH/conf/ssl-dhparams.pem"
    print_success "TLS parameters downloaded"
else
    print_info "TLS parameters already exist"
fi

# Step 7: Check if certificate already exists
echo -e "\n${YELLOW}Step 6: Checking for Existing SSL Certificate${NC}"

if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
    print_warning "SSL certificate already exists for $DOMAIN"
    read -p "Do you want to renew/replace it? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
        print_info "Keeping existing certificate"
        SKIP_CERT=1
    else
        SKIP_CERT=0
    fi
else
    SKIP_CERT=0
fi

# Step 8: Create dummy certificate and start nginx
if [ "$SKIP_CERT" -eq 0 ]; then
    echo -e "\n${YELLOW}Step 7: Creating Temporary Certificate for Nginx${NC}"
    
    CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
    mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
    
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
      openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1\
        -keyout '$CERT_PATH/privkey.pem' \
        -out '$CERT_PATH/fullchain.pem' \
        -subj '/CN=localhost'" certbot
    
    print_success "Temporary certificate created"
    
    # Ensure nginx is running with dummy certificate
    echo -e "\n${YELLOW}Step 8: Starting Nginx with Temporary Certificate${NC}"
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d nginx
    
    print_info "Waiting for nginx to be ready..."
    sleep 10
    
    # Verify nginx is running
    NGINX_STATUS=$($DOCKER_COMPOSE -f "$COMPOSE_FILE" ps nginx 2>/dev/null | grep -c "Up" || echo "0")
    
    if [ "$NGINX_STATUS" -gt 0 ]; then
        print_success "Nginx is running"
        
        # Test nginx configuration
        print_info "Testing nginx configuration..."
        if $DOCKER_COMPOSE -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 | grep -q "successful"; then
            print_success "Nginx configuration is valid"
        else
            print_warning "Nginx configuration test had issues"
            print_info "Checking nginx logs..."
            $DOCKER_COMPOSE -f "$COMPOSE_FILE" logs nginx --tail=20
        fi
    else
        print_error "Nginx failed to start"
        echo ""
        print_info "Checking nginx logs for errors..."
        $DOCKER_COMPOSE -f "$COMPOSE_FILE" logs nginx --tail=30
        echo ""
        print_info "Checking if nginx container exists..."
        docker ps -a | grep nginx || print_error "Nginx container not found"
        echo ""
        print_info "Common issues:"
        print_info "  1. Port 80 or 443 already in use"
        print_info "  2. nginx-beta.conf file missing or invalid"
        print_info "  3. Volume mount issues"
        print_info "  4. Permission issues"
        echo ""
        print_info "Run diagnostic script: ./diagnose-nginx.sh"
        exit 1
    fi
fi

# Step 9: Request Let's Encrypt Certificate
if [ "$SKIP_CERT" -eq 0 ]; then
    echo -e "\n${YELLOW}Step 9: Requesting Let's Encrypt Certificate${NC}"
    
    # Delete temporary certificate
    print_info "Removing temporary certificate..."
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
      rm -Rf /etc/letsencrypt/live/$DOMAIN && \
      rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
      rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot
    
    # Prepare email argument
    if [ -z "$EMAIL" ]; then
        EMAIL_ARG="--register-unsafely-without-email"
    else
        EMAIL_ARG="-m $EMAIL"
    fi
    
    # Prepare staging argument
    if [ "$STAGING" != "0" ]; then
        STAGING_ARG="--staging"
        print_warning "Using Let's Encrypt staging environment (for testing)"
    else
        STAGING_ARG=""
    fi
    
    # Request certificate
    print_info "Requesting SSL certificate for $DOMAIN..."
    print_info "This may take a minute..."
    
    if $DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
      certbot certonly --webroot -w /var/www/certbot \
        $STAGING_ARG \
        $EMAIL_ARG \
        -d $DOMAIN \
        --rsa-key-size $RSA_KEY_SIZE \
        --agree-tos \
        --force-renewal" certbot; then
        
        print_success "SSL certificate obtained successfully!"
        
        # Reload nginx
        print_info "Reloading nginx with new certificate..."
        $DOCKER_COMPOSE -f "$COMPOSE_FILE" exec nginx nginx -s reload
        
        print_success "Nginx reloaded with SSL certificate"
    else
        print_error "Failed to obtain SSL certificate"
        echo ""
        print_info "Common issues:"
        print_info "  1. DNS not fully propagated (wait 5-30 minutes)"
        print_info "  2. Port 80 not accessible from internet"
        print_info "  3. Firewall blocking port 80"
        print_info "  4. Domain already has a certificate (try --force-renewal)"
        echo ""
        print_info "To check DNS: dig $DOMAIN +short"
        print_info "To check firewall: ufw status"
        exit 1
    fi
fi

# Step 10: Verify SSL Certificate
echo -e "\n${YELLOW}Step 10: Verifying SSL Configuration${NC}"

# Test HTTP redirect
print_info "Testing HTTP to HTTPS redirect..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" || echo "000")

if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    print_success "HTTP redirects to HTTPS correctly"
else
    print_warning "HTTP redirect test returned status: $HTTP_STATUS"
fi

# Test HTTPS
print_info "Testing HTTPS connection..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k "https://$DOMAIN" 2>/dev/null || echo "000")

if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
    print_success "HTTPS is working (status: $HTTPS_STATUS)"
else
    print_warning "HTTPS test returned status: $HTTPS_STATUS"
fi

# Step 11: Final Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${GREEN}Your application is now accessible at:${NC}"
echo -e "  🌐 HTTP:  ${BLUE}http://${DOMAIN}${NC} (redirects to HTTPS)"
echo -e "  🔒 HTTPS: ${BLUE}https://${DOMAIN}${NC}"
echo -e "  📍 IP:    ${BLUE}http://${VPS_IP}${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Test your application: ${GREEN}https://${DOMAIN}${NC}"
echo -e "  2. Check browser console for any errors"
echo -e "  3. Verify Supabase connection is working"
echo -e "  4. Test authentication (sign up/sign in)\n"

echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View logs:        ${GREEN}cd ${APP_DIR} && ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} logs -f${NC}"
echo -e "  Check status:   ${GREEN}cd ${APP_DIR} && ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} ps${NC}"
echo -e "  Restart nginx:  ${GREEN}cd ${APP_DIR} && ${DOCKER_COMPOSE} -f ${COMPOSE_FILE} restart nginx${NC}"
echo -e "  Renew SSL:      ${GREEN}cd ${APP_DIR} && ./init-ssl-beta.sh${NC}\n"

echo -e "${GREEN}✅ Domain and SSL setup complete!${NC}\n"
