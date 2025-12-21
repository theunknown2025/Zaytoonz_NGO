#!/bin/bash

# ================================================================
# Setup Environment Variables on Hostinger VPS
# This script configures the .env.local file on your VPS
# ================================================================

echo "🔧 Setting up environment variables on VPS..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_DIR="/var/www/zaytoonz-ngo"
ENV_FILE="$APP_DIR/.env.local"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root: sudo bash setup-vps-env.sh${NC}"
    exit 1
fi

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Application directory not found: $APP_DIR${NC}"
    echo "Please clone your repository first:"
    echo "  cd /var/www"
    echo "  git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git zaytoonz-ngo"
    exit 1
fi

cd "$APP_DIR"
echo -e "${GREEN}✓ Changed to application directory${NC}"

# Create .env.local file
echo ""
echo -e "${BLUE}📝 Creating .env.local file...${NC}"
echo ""

cat > "$ENV_FILE" << 'EOF'
# ================================================================
# Supabase Configuration (Self-hosted on Hostinger VPS)
# ================================================================
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# ================================================================
# OpenAI Configuration for Morchid AI LLM
# ================================================================
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# ================================================================
# External Scraper Configuration
# ================================================================
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# ================================================================
# NextAuth Configuration
# ================================================================
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# ================================================================
# Environment
# ================================================================
NODE_ENV=production
EOF

echo -e "${GREEN}✓ Created .env.local file${NC}"

# Set proper permissions
chmod 600 "$ENV_FILE"
chown www-data:www-data "$ENV_FILE"
echo -e "${GREEN}✓ Set proper permissions${NC}"

# Display the file
echo ""
echo "================================================"
echo "📄 Environment Variables Configured"
echo "================================================"
cat "$ENV_FILE"
echo "================================================"

# Generate NEXTAUTH_SECRET if not set
if grep -q "your-nextauth-secret-here" "$ENV_FILE"; then
    echo ""
    echo -e "${YELLOW}🔐 Generating NEXTAUTH_SECRET...${NC}"
    SECRET=$(openssl rand -base64 32)
    sed -i "s/your-nextauth-secret-here/$SECRET/" "$ENV_FILE"
    echo -e "${GREEN}✓ Generated NEXTAUTH_SECRET${NC}"
fi

# Update NEXTAUTH_URL based on domain
echo ""
echo -e "${YELLOW}🌐 Do you have a domain name? (y/n)${NC}"
read -p "> " HAS_DOMAIN

if [ "$HAS_DOMAIN" = "y" ] || [ "$HAS_DOMAIN" = "Y" ]; then
    echo -e "${YELLOW}Enter your domain name (e.g., example.com):${NC}"
    read -p "> " DOMAIN
    sed -i "s|http://localhost:3000|https://$DOMAIN|g" "$ENV_FILE"
    echo -e "${GREEN}✓ Updated NEXTAUTH_URL to https://$DOMAIN${NC}"
else
    echo -e "${YELLOW}Enter your VPS IP address:${NC}"
    read -p "> " VPS_IP
    sed -i "s|http://localhost:3000|http://$VPS_IP|g" "$ENV_FILE"
    echo -e "${GREEN}✓ Updated NEXTAUTH_URL to http://$VPS_IP${NC}"
fi

# Install dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build the application
echo ""
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build
echo -e "${GREEN}✓ Application built${NC}"

# Restart PM2
echo ""
echo -e "${BLUE}🔄 Restarting application with PM2...${NC}"
pm2 restart zaytoonz-ngo || pm2 start npm --name "zaytoonz-ngo" -- start
pm2 save
echo -e "${GREEN}✓ Application restarted${NC}"

# Show status
echo ""
echo "================================================"
echo "📊 Application Status"
echo "================================================"
pm2 status

echo ""
echo "================================================"
echo "📋 Recent Logs"
echo "================================================"
pm2 logs zaytoonz-ngo --lines 20 --nostream

echo ""
echo "================================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Your application is now configured with:"
echo "  • Supabase: http://localhost:8000"
echo "  • OpenAI API: Configured"
echo "  • Environment: Production"
echo ""
echo "Access your application at:"
if [ "$HAS_DOMAIN" = "y" ] || [ "$HAS_DOMAIN" = "Y" ]; then
    echo "  https://$DOMAIN"
else
    echo "  http://$VPS_IP"
fi
echo ""
echo "To view logs:"
echo "  pm2 logs zaytoonz-ngo"
echo ""
echo "To restart:"
echo "  pm2 restart zaytoonz-ngo"
echo ""

