#!/bin/bash

# Quick diagnostic script for nginx issues

set -e

COMPOSE_FILE="docker-compose-beta.yml"

echo "🔍 Diagnosing Nginx Issues..."
echo ""

# Check if nginx container exists
echo "1. Checking nginx container status:"
docker ps -a | grep nginx || echo "   No nginx container found"
echo ""

# Check nginx logs
echo "2. Recent nginx logs:"
docker compose -f "$COMPOSE_FILE" logs nginx --tail=50 2>&1 | tail -20 || echo "   Cannot retrieve logs"
echo ""

# Check if nginx config file exists
echo "3. Checking nginx configuration file:"
if [ -f "nginx-beta.conf" ]; then
    echo "   ✓ nginx-beta.conf exists"
    echo "   File size: $(wc -l < nginx-beta.conf) lines"
    
    # Check for syntax errors
    echo "   Testing nginx config syntax..."
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1 || echo "   Cannot test config (container not running)"
else
    echo "   ✗ nginx-beta.conf not found!"
fi
echo ""

# Check port availability
echo "4. Checking port availability:"
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep -E ":80|:443" || echo "   Ports 80 and 443 appear free"
elif command -v ss &> /dev/null; then
    ss -tulpn | grep -E ":80|:443" || echo "   Ports 80 and 443 appear free"
else
    echo "   Cannot check ports (netstat/ss not available)"
fi
echo ""

# Check docker compose services
echo "5. Docker compose services status:"
docker compose -f "$COMPOSE_FILE" ps
echo ""

# Check volumes
echo "6. Checking volumes:"
docker compose -f "$COMPOSE_FILE" config | grep -A 5 "nginx:" | grep -E "volumes:|certbot" || echo "   Volume configuration check"
echo ""

# Check if certbot directories exist
echo "7. Checking certbot directories:"
if [ -d "certbot/conf" ]; then
    echo "   ✓ certbot/conf exists"
    ls -la certbot/conf/ | head -5
else
    echo "   ✗ certbot/conf not found"
fi
echo ""

# Check nginx container details
echo "8. Nginx container details:"
docker inspect zaytoonz-nginx-beta 2>/dev/null | grep -E "Status|State|Error" || echo "   Container not found or inspect failed"
echo ""

echo "✅ Diagnosis complete!"
echo ""
echo "Common fixes:"
echo "  1. Check nginx logs: docker compose -f $COMPOSE_FILE logs nginx"
echo "  2. Verify nginx-beta.conf exists and is valid"
echo "  3. Ensure ports 80 and 443 are not in use by another service"
echo "  4. Check if certbot directories are properly mounted"
