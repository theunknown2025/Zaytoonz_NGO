#!/bin/bash
# Script to deploy Next.js app to /Test subdirectory on VPS
# Usage: ./deploy-test-to-vps.sh

set -e

echo "🚀 Deploying Zaytoonz NGO to /Test subdirectory on VPS..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on the VPS
if [ ! -d "/var/www/zaytoonz-ngo" ]; then
    echo -e "${YELLOW}⚠️  This script should be run on the VPS${NC}"
    echo "SSH into your VPS first: ssh root@168.231.87.171"
    exit 1
fi

APP_DIR="/var/www/zaytoonz-ngo"
cd $APP_DIR

# Set base path
export NEXT_PUBLIC_BASE_PATH=/Test

echo -e "${BLUE}📦 Building Next.js application with basePath=/Test...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"

# Check if ecosystem.test.config.js exists
if [ ! -f "ecosystem.test.config.js" ]; then
    echo -e "${YELLOW}⚠️  ecosystem.test.config.js not found. Creating it...${NC}"
    # Copy from template if exists, or create basic one
    if [ -f "ecosystem.production.config.js" ]; then
        cp ecosystem.production.config.js ecosystem.test.config.js
        # Update for test subdirectory
        sed -i "s/zaytoonz-ngo/zaytoonz-test/g" ecosystem.test.config.js
        sed -i "s/PORT: 3000/PORT: 3001/g" ecosystem.test.config.js
        sed -i "s/script: 'npm'/script: 'server.js'/g" ecosystem.test.config.js
        sed -i "/args: 'start'/d" ecosystem.test.config.js
        echo "NEXT_PUBLIC_BASE_PATH: '/Test'," >> ecosystem.test.config.js
    fi
fi

# Stop existing instance if running
echo -e "${BLUE}🛑 Stopping existing instance...${NC}"
pm2 delete zaytoonz-test 2>/dev/null || true

# Start with PM2
echo -e "${BLUE}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.test.config.js

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✓ Application started on port 3001${NC}"

# Check Nginx configuration
echo -e "${BLUE}🌐 Checking Nginx configuration...${NC}"
if nginx -t 2>/dev/null; then
    echo -e "${BLUE}🔄 Reloading Nginx...${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx configuration test failed${NC}"
    echo "Please update your Nginx config manually:"
    echo "  See: guidelines/nginx-test-subdirectory.conf"
fi

# Show status
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 PM2 Status:"
pm2 status zaytoonz-test
echo ""
echo "📝 View logs: pm2 logs zaytoonz-test"
echo "🌐 Access your app at: https://zaytoonz.com/Test"
echo ""

