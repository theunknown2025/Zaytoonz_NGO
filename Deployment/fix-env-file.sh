#!/bin/bash

# Fix .env.local file on VPS
# Replaces placeholder values with prompts for real values

set -e

echo "================================================================"
echo "  Fix .env.local File on VPS"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
ENV_FILE="$APP_DIR/.env.local"

cd "$APP_DIR"

echo "[*] Checking current .env.local..."
echo ""

if [ -f "$ENV_FILE" ]; then
    echo "Current .env.local contents:"
    echo "----------------------------------------"
    cat "$ENV_FILE" | grep -v "^#" | grep -v "^$" || echo "(empty or all comments)"
    echo "----------------------------------------"
    echo ""
    
    # Check for placeholder values
    if grep -q "your_supabase_url_here\|your_supabase_anon_key_here\|placeholder" "$ENV_FILE"; then
        echo -e "${RED}[ERROR] Found placeholder values in .env.local!${NC}"
        echo ""
        echo "These need to be replaced with actual values:"
        echo ""
        
        # Show what needs to be fixed
        grep -n "your_\|placeholder" "$ENV_FILE" || true
        
        echo ""
        echo -e "${YELLOW}[ACTION REQUIRED]${NC}"
        echo "You need to edit .env.local and replace placeholder values."
        echo ""
        echo "Run this command to edit:"
        echo "  nano $ENV_FILE"
        echo ""
        echo "Required values to update:"
        echo "  1. NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL"
        echo "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anon key"
        echo "  3. NEXT_PUBLIC_BASE_PATH=/beta (should already be correct)"
        echo ""
        echo "Example format:"
        echo "  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co"
        echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        echo ""
        
        # Create a backup
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✓${NC} Backup created: $ENV_FILE.backup.*"
        echo ""
        
        # Offer to create a template
        read -p "Would you like to create a template file you can edit? (y/n): " create_template
        if [ "$create_template" = "y" ] || [ "$create_template" = "Y" ]; then
            cat > "$ENV_FILE.template" << 'EOF'
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/beta

# Supabase Configuration
# REPLACE THESE WITH YOUR ACTUAL VALUES:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Node Environment
NODE_ENV=production
PORT=3001
HOSTNAME=localhost

# OpenAI Configuration (if using)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://zaytoonz.com/beta

# External Scraper Configuration (if using)
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=false
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
EOF
            echo -e "${GREEN}✓${NC} Template created: $ENV_FILE.template"
            echo ""
            echo "To use the template:"
            echo "  1. Edit the template: nano $ENV_FILE.template"
            echo "  2. Replace placeholder values with real ones"
            echo "  3. Copy to .env.local: cp $ENV_FILE.template $ENV_FILE"
        fi
        
        exit 1
    else
        echo -e "${GREEN}✓${NC} No placeholder values found"
        echo ""
        echo "Checking if values look valid..."
        
        # Check if Supabase URL looks valid
        SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL "$ENV_FILE" | cut -d'=' -f2 | tr -d ' ' | tr -d '"')
        if [[ "$SUPABASE_URL" == https://*.supabase.co ]] || [[ "$SUPABASE_URL" == http://* ]]; then
            echo -e "${GREEN}✓${NC} Supabase URL format looks valid"
        else
            echo -e "${RED}✗${NC} Supabase URL format may be invalid: $SUPABASE_URL"
        fi
        
        # Check if anon key looks valid (should be a JWT)
        ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY "$ENV_FILE" | cut -d'=' -f2 | tr -d ' ' | tr -d '"')
        if [[ "$ANON_KEY" == eyJ* ]]; then
            echo -e "${GREEN}✓${NC} Supabase anon key format looks valid"
        else
            echo -e "${RED}✗${NC} Supabase anon key format may be invalid"
        fi
    fi
else
    echo -e "${RED}[ERROR] .env.local file not found!${NC}"
    echo ""
    echo "Creating .env.local from template..."
    echo ""
    
    cat > "$ENV_FILE" << 'EOF'
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/beta

# Supabase Configuration
# ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Node Environment
NODE_ENV=production
PORT=3001
HOSTNAME=localhost

# OpenAI Configuration (if using)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://zaytoonz.com/beta

# External Scraper Configuration (if using)
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=false
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
EOF
    
    echo -e "${YELLOW}[ACTION REQUIRED]${NC}"
    echo ".env.local created with placeholder values."
    echo "You MUST edit it and add your actual Supabase credentials:"
    echo ""
    echo "  nano $ENV_FILE"
    echo ""
    exit 1
fi

echo ""
echo "================================================================"
echo -e "${GREEN}  .env.local file is configured${NC}"
echo "================================================================"

