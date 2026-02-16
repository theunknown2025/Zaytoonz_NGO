#!/bin/bash

set -e

DOMAIN="beta-zaytoonz.pro"
EMAIL="support@zaytoonz.com"
RSA_KEY_SIZE=4096
DATA_PATH="./certbot"
STAGING=0  # Set to 1 for testing to avoid hitting request limits
COMPOSE_FILE="docker-compose-beta.yml"

echo "🔒 Initializing SSL certificates for ${DOMAIN}"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: docker-compose is not installed."
    exit 1
fi

# Use docker compose plugin if available, otherwise use docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Check if certbot data already exists
if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
    echo "⚠️  Existing certificate data found for $DOMAIN"
    read -p "Continue and replace existing certificate? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
        echo "Aborted."
        exit 0
    fi
fi

# Download recommended TLS parameters if they don't exist
if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
    echo "📥 Downloading recommended TLS parameters..."
    mkdir -p "$DATA_PATH/conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$DATA_PATH/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$DATA_PATH/conf/ssl-dhparams.pem"
    echo "✅ TLS parameters downloaded"
fi

# Create dummy certificate for initial nginx startup
echo "🔧 Creating dummy certificate for $DOMAIN..."
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"

$DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1\
    -keyout '$CERT_PATH/privkey.pem' \
    -out '$CERT_PATH/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "✅ Dummy certificate created"

# Start nginx with dummy certificate
echo "🚀 Starting nginx with dummy certificate..."
$DOCKER_COMPOSE -f "$COMPOSE_FILE" up -d nginx

# Wait for nginx to be ready
echo "⏳ Waiting for nginx to be ready..."
sleep 5

# Delete dummy certificate
echo "🗑️  Deleting dummy certificate..."
$DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

# Request Let's Encrypt certificate
echo "📜 Requesting Let's Encrypt certificate for $DOMAIN..."

# Select appropriate email arg
if [ -z "$EMAIL" ]; then
    EMAIL_ARG="--register-unsafely-without-email"
else
    EMAIL_ARG="-m $EMAIL"
fi

# Enable staging mode if needed
if [ "$STAGING" != "0" ]; then
    STAGING_ARG="--staging"
    echo "⚠️  Using Let's Encrypt staging environment (for testing)"
else
    STAGING_ARG=""
fi

# Request certificate
$DOCKER_COMPOSE -f "$COMPOSE_FILE" run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    $EMAIL_ARG \
    -d $DOMAIN \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --force-renewal" certbot

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained successfully!"
    
    # Update nginx configuration with SSL paths (if needed)
    if [ -f "nginx-beta.conf" ]; then
        echo "✅ Nginx configuration already includes SSL paths"
    fi
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    $DOCKER_COMPOSE -f "$COMPOSE_FILE" exec nginx nginx -s reload
    
    echo ""
    echo "✅ SSL setup complete!"
    echo "🌐 Your site should now be accessible at: https://${DOMAIN}"
else
    echo "❌ Failed to obtain SSL certificate"
    echo "💡 Make sure:"
    echo "   1. Domain DNS is pointing to ${VPS_IP:-your server IP}"
    echo "   2. Ports 80 and 443 are open in firewall"
    echo "   3. Nginx container is running"
    exit 1
fi
