#!/bin/bash

# =============================================================================
# VPS Database Connection Fix Script
# =============================================================================
# This script fixes the database connection issue on your Hostinger VPS
# by creating the missing .env.local file with correct configuration
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     VPS Database Connection Fix Script                   ║"
echo "║     Zaytoonz NGO Platform                                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
APP_DIR="/var/www/zaytoonz-ngo"
ENV_FILE="$APP_DIR/.env.local"

# Step 1: Check if running on VPS
echo -e "${BLUE}[1/8] Checking environment...${NC}"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ ERROR: Application directory not found at $APP_DIR${NC}"
    echo "This script should be run on your VPS server."
    exit 1
fi
echo -e "${GREEN}✓ Application directory found${NC}"

# Step 2: Navigate to app directory
echo -e "\n${BLUE}[2/8] Navigating to application directory...${NC}"
cd "$APP_DIR" || exit 1
echo -e "${GREEN}✓ Changed to $APP_DIR${NC}"

# Step 3: Backup existing .env.local if it exists
echo -e "\n${BLUE}[3/8] Checking for existing .env.local...${NC}"
if [ -f "$ENV_FILE" ]; then
    BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}⚠ Found existing .env.local, creating backup...${NC}"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ No existing .env.local found (this is likely the problem!)${NC}"
fi

# Step 4: Create new .env.local file
echo -e "\n${BLUE}[4/8] Creating .env.local file...${NC}"
cat > "$ENV_FILE" << 'ENVEOF'
# =============================================================================
# Supabase Configuration - Supabase Cloud
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# =============================================================================
# OpenAI Configuration for Morchid AI
# =============================================================================
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# =============================================================================
# External Python Scraper Configuration
# =============================================================================
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# =============================================================================
# NLWeb Configuration
# =============================================================================
NLWEB_URL=http://localhost:8000

# =============================================================================
# NextAuth Configuration
# =============================================================================
NEXTAUTH_SECRET=generate-random-secret-below
NEXTAUTH_URL=http://168.231.87.171

# =============================================================================
# Environment
# =============================================================================
NODE_ENV=production
ENVEOF

echo -e "${GREEN}✓ Created .env.local file${NC}"

# Step 5: Generate secure NEXTAUTH_SECRET
echo -e "\n${BLUE}[5/8] Generating secure NEXTAUTH_SECRET...${NC}"
if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    sed -i "s/generate-random-secret-below/$SECRET/" "$ENV_FILE"
    echo -e "${GREEN}✓ Generated and set NEXTAUTH_SECRET${NC}"
else
    echo -e "${YELLOW}⚠ openssl not found, using random string${NC}"
    SECRET=$(date +%s | sha256sum | base64 | head -c 32)
    sed -i "s/generate-random-secret-below/$SECRET/" "$ENV_FILE"
fi

# Step 6: Set proper file permissions
echo -e "\n${BLUE}[6/8] Setting file permissions...${NC}"
chmod 600 "$ENV_FILE"
echo -e "${GREEN}✓ Set permissions to 600 (read/write for owner only)${NC}"

# Step 7: Rebuild the application
echo -e "\n${BLUE}[7/8] Rebuilding Next.js application...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"

if command -v npm &> /dev/null; then
    if npm run build; then
        echo -e "${GREEN}✓ Application built successfully${NC}"
    else
        echo -e "${RED}❌ Build failed. Check the errors above.${NC}"
        echo -e "${YELLOW}You may need to run 'npm install' first.${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ npm not found. Please install Node.js first.${NC}"
    exit 1
fi

# Step 8: Restart PM2 services
echo -e "\n${BLUE}[8/8] Restarting PM2 services...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart all
    pm2 save
    echo -e "${GREEN}✓ PM2 services restarted${NC}"
else
    echo -e "${YELLOW}⚠ PM2 not found. If you're using PM2, restart manually:${NC}"
    echo "  pm2 restart all"
    echo "  pm2 save"
fi

# Final summary
echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ✅ FIX COMPLETE!                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "📋 ${GREEN}What was fixed:${NC}"
echo "  1. ✓ Created .env.local with Supabase credentials"
echo "  2. ✓ Set secure NEXTAUTH_SECRET"
echo "  3. ✓ Rebuilt application with correct environment variables"
echo "  4. ✓ Restarted PM2 services"

echo -e "\n🧪 ${BLUE}Test your application:${NC}"
echo "  - Visit: http://168.231.87.171"
echo "  - Try logging in"
echo "  - Check PM2 logs: pm2 logs zaytoonz-ngo"

echo -e "\n📊 ${BLUE}Check status:${NC}"
echo "  pm2 status"
echo "  pm2 logs zaytoonz-ngo --lines 50"

echo -e "\n🔍 ${BLUE}Verify environment variables:${NC}"
echo "  cat $ENV_FILE"

echo -e "\n${YELLOW}⚠ IMPORTANT SECURITY NOTE:${NC}"
echo "  Your .env.local contains sensitive API keys."
echo "  - Never commit this file to Git"
echo "  - Keep file permissions at 600"
echo "  - Rotate keys periodically"

echo -e "\n${GREEN}✨ Your database should now be connected!${NC}"
echo ""

