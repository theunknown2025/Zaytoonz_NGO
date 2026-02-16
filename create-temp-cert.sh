#!/bin/bash

# Quick script to create temporary SSL certificate for nginx testing

set -e

DOMAIN="beta-zaytoonz.pro"
COMPOSE_FILE="docker-compose-beta.yml"

echo "🔧 Creating temporary SSL certificate for $DOMAIN..."

# Create directory
mkdir -p certbot/conf/live/$DOMAIN

# Create temporary certificate
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1\
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot

if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Temporary certificate created successfully!"
    echo ""
    echo "You can now:"
    echo "  1. Test nginx: docker compose -f $COMPOSE_FILE exec nginx nginx -t"
    echo "  2. Start nginx: docker compose -f $COMPOSE_FILE up -d nginx"
    echo "  3. Request real certificate: ./manual-ssl-setup.sh"
else
    echo "❌ Failed to create temporary certificate"
    exit 1
fi
