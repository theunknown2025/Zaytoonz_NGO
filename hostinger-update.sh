#!/bin/bash

# Hostinger VPS Update Script for Zaytoonz NGO
# Use this script to update your application after pushing changes to GitHub
# Run: bash hostinger-update.sh

set -e

echo "================================================================"
echo "  Zaytoonz NGO - Update Deployment"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Navigate to project directory
cd /var/www/zaytoonz-ngo

# Pull latest changes
echo -e "${YELLOW}[*] Pulling latest changes from GitHub...${NC}"
git fetch origin
git reset --hard origin/main
echo -e "${GREEN}[OK] Code updated${NC}"

# Install/update dependencies
echo -e "${YELLOW}[*] Installing/updating dependencies...${NC}"
npm install --production
echo -e "${GREEN}[OK] Dependencies updated${NC}"

# Build application
echo -e "${YELLOW}[*] Building Next.js application...${NC}"
export NEXT_PUBLIC_BASE_PATH=/test
npm run build
echo -e "${GREEN}[OK] Build completed${NC}"

# Restart PM2
echo -e "${YELLOW}[*] Restarting application...${NC}"
pm2 restart zaytoonz-test --update-env
pm2 save
echo -e "${GREEN}[OK] Application restarted${NC}"

# Check status
echo ""
echo -e "${GREEN}Deployment Status:${NC}"
pm2 status zaytoonz-test

echo ""
echo -e "${GREEN}[SUCCESS] Update complete!${NC}"
echo ""
echo "View logs: pm2 logs zaytoonz-test"
echo "Check status: pm2 status"

