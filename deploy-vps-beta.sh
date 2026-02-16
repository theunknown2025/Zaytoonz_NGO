#!/bin/bash

set -e

# Configuration
VPS_IP="76.13.57.178"
DOMAIN="beta-zaytoonz.pro"
EMAIL="support@zaytoonz.com"
APP_DIR="/opt/zaytoonz-ngo"
GIT_REPO_URL=""  # Will be set by user or detected

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Zaytoonz NGO - VPS Deployment Script${NC}"
echo -e "${GREEN}Domain: ${DOMAIN}${NC}"
echo -e "${GREEN}VPS IP: ${VPS_IP}${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Step 1: Update system packages
echo -e "\n${YELLOW}Step 1: Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
print_status "System packages updated"

# Step 2: Install required packages
echo -e "\n${YELLOW}Step 2: Installing required packages...${NC}"
REQUIRED_PACKAGES="curl wget git ufw software-properties-common apt-transport-https ca-certificates gnupg lsb-release"

for package in $REQUIRED_PACKAGES; do
    if ! dpkg -l | grep -q "^ii  $package "; then
        apt-get install -y -qq "$package"
        print_status "Installed $package"
    else
        print_status "$package already installed"
    fi
done

# Step 3: Install Docker
echo -e "\n${YELLOW}Step 3: Installing Docker...${NC}"
if ! command_exists docker; then
    # Add Docker's official GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    print_status "Docker installed"
else
    print_status "Docker already installed"
fi

# Step 4: Install Docker Compose (standalone if not using plugin)
if ! command_exists docker-compose && ! docker compose version &>/dev/null; then
    echo -e "\n${YELLOW}Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
else
    print_status "Docker Compose already available"
fi

# Step 5: Configure firewall
echo -e "\n${YELLOW}Step 4: Configuring firewall...${NC}"
if command_exists ufw; then
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    print_status "Firewall configured (SSH, HTTP, HTTPS)"
else
    print_warning "UFW not available, please configure firewall manually"
fi

# Step 6: Create application directory
echo -e "\n${YELLOW}Step 5: Setting up application directory...${NC}"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Step 7: Clone or update repository
echo -e "\n${YELLOW}Step 6: Setting up repository...${NC}"
if [ -d ".git" ]; then
    print_status "Repository exists, pulling latest changes..."
    git pull origin main || git pull origin master
else
    if [ -z "$GIT_REPO_URL" ]; then
        echo -e "${YELLOW}Enter your Git repository URL (or press Enter to skip and copy files manually):${NC}"
        read -r GIT_REPO_URL
    fi
    
    if [ -n "$GIT_REPO_URL" ]; then
        print_status "Cloning repository..."
        git clone "$GIT_REPO_URL" .
    else
        print_warning "No repository URL provided. Please copy your project files to $APP_DIR"
    fi
fi

# Step 8: Create necessary directories
echo -e "\n${YELLOW}Step 7: Creating necessary directories...${NC}"
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p logs
print_status "Directories created"

# Step 9: Set up environment file with interactive credential collection
echo -e "\n${YELLOW}Step 8: Configuring environment variables...${NC}"

# Function to prompt for required value
prompt_required() {
    local var_name=$1
    local prompt_text=$2
    local default_value=$3
    local value=""
    
    while [ -z "$value" ]; do
        if [ -n "$default_value" ]; then
            echo -e "${YELLOW}${prompt_text} [default: ${default_value}]:${NC} "
            read -r value
            if [ -z "$value" ]; then
                value="$default_value"
            fi
        else
            echo -e "${YELLOW}${prompt_text} (required):${NC} "
            read -r value
        fi
        
        if [ -z "$value" ]; then
            print_error "This field is required. Please enter a value."
        fi
    done
    echo "$value"
}

# Function to prompt for optional value
prompt_optional() {
    local var_name=$1
    local prompt_text=$2
    local default_value=$3
    local value=""
    
    if [ -n "$default_value" ]; then
        echo -e "${YELLOW}${prompt_text} [default: ${default_value}]:${NC} "
        read -r value
        if [ -z "$value" ]; then
            value="$default_value"
        fi
    else
        echo -e "${YELLOW}${prompt_text} [optional, press Enter to skip]:${NC} "
        read -r value
    fi
    
    echo "$value"
}

# Check if .env.production exists and load existing values
declare -A ENV_VARS
if [ -f ".env.production" ]; then
    print_status "Loading existing .env.production values..."
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$line" ]] && continue
        [[ ! "$line" =~ = ]] && continue
        
        # Extract key and value
        key=$(echo "$line" | cut -d'=' -f1 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        value=$(echo "$line" | cut -d'=' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        # Remove quotes if present
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        if [ -n "$key" ]; then
            ENV_VARS["$key"]="$value"
        fi
    done < .env.production
    print_status "Loaded ${#ENV_VARS[@]} existing environment variables"
fi

echo -e "\n${GREEN}=== Required Credentials Configuration ===${NC}\n"

# Collect Supabase credentials
echo -e "${GREEN}--- Supabase Configuration ---${NC}"
SUPABASE_URL=$(prompt_required "NEXT_PUBLIC_SUPABASE_URL" \
    "Enter your Supabase Project URL" \
    "${ENV_VARS[NEXT_PUBLIC_SUPABASE_URL]:-https://uroirdudxkfppocqcorm.supabase.co}")

SUPABASE_ANON_KEY=$(prompt_required "NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    "Enter your Supabase Anon Key" \
    "${ENV_VARS[NEXT_PUBLIC_SUPABASE_ANON_KEY]:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM}")

# Collect OpenAI credentials
echo -e "\n${GREEN}--- OpenAI Configuration ---${NC}"
OPENAI_API_KEY=$(prompt_required "OPENAI_API_KEY" \
    "Enter your OpenAI API Key" \
    "${ENV_VARS[OPENAI_API_KEY]:-}")

NEXT_PUBLIC_OPENAI_API_KEY=$(prompt_required "NEXT_PUBLIC_OPENAI_API_KEY" \
    "Enter your OpenAI API Key (public, same as above)" \
    "${ENV_VARS[NEXT_PUBLIC_OPENAI_API_KEY]:-$OPENAI_API_KEY}")

OPENAI_MODEL=$(prompt_optional "OPENAI_MODEL" \
    "Enter OpenAI Model (gpt-4o-mini, gpt-4, etc.)" \
    "${ENV_VARS[OPENAI_MODEL]:-gpt-4o-mini}")

OPENAI_MAX_TOKENS=$(prompt_optional "OPENAI_MAX_TOKENS" \
    "Enter OpenAI Max Tokens" \
    "${ENV_VARS[OPENAI_MAX_TOKENS]:-2000}")

OPENAI_ENDPOINT=$(prompt_optional "OPENAI_ENDPOINT" \
    "Enter OpenAI Endpoint" \
    "${ENV_VARS[OPENAI_ENDPOINT]:-https://api.openai.com/v1/chat/completions}")

# Collect Scraper configuration
echo -e "\n${GREEN}--- Scraper Service Configuration ---${NC}"
USE_EXTERNAL_SCRAPER=$(prompt_optional "NEXT_PUBLIC_USE_EXTERNAL_SCRAPER" \
    "Use external scraper service? (true/false)" \
    "${ENV_VARS[NEXT_PUBLIC_USE_EXTERNAL_SCRAPER]:-true}")

EXTERNAL_SCRAPER_URL=$(prompt_optional "NEXT_PUBLIC_EXTERNAL_SCRAPER_URL" \
    "External scraper URL" \
    "${ENV_VARS[NEXT_PUBLIC_EXTERNAL_SCRAPER_URL]:-http://python-scraper:8000}")

FALLBACK_TO_LOCAL=$(prompt_optional "NEXT_PUBLIC_FALLBACK_TO_LOCAL" \
    "Fallback to local scraper? (true/false)" \
    "${ENV_VARS[NEXT_PUBLIC_FALLBACK_TO_LOCAL]:-true}")

# Collect NLWeb configuration
echo -e "\n${GREEN}--- NLWeb Service Configuration ---${NC}"
NLWEB_URL=$(prompt_optional "NLWEB_URL" \
    "NLWeb service URL" \
    "${ENV_VARS[NLWEB_URL]:-http://nlweb:8000}")

NLWEB_CONFIG_DIR=$(prompt_optional "NLWEB_CONFIG_DIR" \
    "NLWeb config directory" \
    "${ENV_VARS[NLWEB_CONFIG_DIR]:-/app/NLWeb-main/config}")

NLWEB_OUTPUT_DIR=$(prompt_optional "NLWEB_OUTPUT_DIR" \
    "NLWeb output directory" \
    "${ENV_VARS[NLWEB_OUTPUT_DIR]:-/app/NLWeb-main/data/nlweb}")

NLWEB_OUTPUT_DIR_RELATIVE=$(prompt_optional "NLWEB_OUTPUT_DIR_RELATIVE" \
    "NLWeb output directory (relative)" \
    "${ENV_VARS[NLWEB_OUTPUT_DIR_RELATIVE]:-../data/nlweb}")

NLWEB_LOGGING_PROFILE=$(prompt_optional "NLWEB_LOGGING_PROFILE" \
    "NLWeb logging profile" \
    "${ENV_VARS[NLWEB_LOGGING_PROFILE]:-production}")

# Collect optional Azure OpenAI credentials
echo -e "\n${GREEN}--- Optional: Azure OpenAI Configuration ---${NC}"
AZURE_OPENAI_ENDPOINT=$(prompt_optional "AZURE_OPENAI_ENDPOINT" \
    "Azure OpenAI Endpoint (optional)" \
    "${ENV_VARS[AZURE_OPENAI_ENDPOINT]:-}")

AZURE_OPENAI_API_KEY=$(prompt_optional "AZURE_OPENAI_API_KEY" \
    "Azure OpenAI API Key (optional)" \
    "${ENV_VARS[AZURE_OPENAI_API_KEY]:-}")

AZURE_VECTOR_SEARCH_ENDPOINT=$(prompt_optional "AZURE_VECTOR_SEARCH_ENDPOINT" \
    "Azure Vector Search Endpoint (optional)" \
    "${ENV_VARS[AZURE_VECTOR_SEARCH_ENDPOINT]:-}")

AZURE_VECTOR_SEARCH_API_KEY=$(prompt_optional "AZURE_VECTOR_SEARCH_API_KEY" \
    "Azure Vector Search API Key (optional)" \
    "${ENV_VARS[AZURE_VECTOR_SEARCH_API_KEY]:-}")

# Collect optional Anthropic credentials
echo -e "\n${GREEN}--- Optional: Anthropic Configuration ---${NC}"
ANTHROPIC_API_KEY=$(prompt_optional "ANTHROPIC_API_KEY" \
    "Anthropic API Key (optional)" \
    "${ENV_VARS[ANTHROPIC_API_KEY]:-}")

# Collect optional Inception AI credentials
echo -e "\n${GREEN}--- Optional: Inception AI Configuration ---${NC}"
INCEPTION_ENDPOINT=$(prompt_optional "INCEPTION_ENDPOINT" \
    "Inception AI Endpoint (optional)" \
    "${ENV_VARS[INCEPTION_ENDPOINT]:-https://api.inceptionlabs.ai/v1/chat/completions}")

INCEPTION_API_KEY=$(prompt_optional "INCEPTION_API_KEY" \
    "Inception AI API Key (optional)" \
    "${ENV_VARS[INCEPTION_API_KEY]:-}")

# Collect optional Snowflake credentials
echo -e "\n${GREEN}--- Optional: Snowflake Configuration ---${NC}"
SNOWFLAKE_ACCOUNT_URL=$(prompt_optional "SNOWFLAKE_ACCOUNT_URL" \
    "Snowflake Account URL (optional)" \
    "${ENV_VARS[SNOWFLAKE_ACCOUNT_URL]:-}")

SNOWFLAKE_PAT=$(prompt_optional "SNOWFLAKE_PAT" \
    "Snowflake PAT (optional)" \
    "${ENV_VARS[SNOWFLAKE_PAT]:-}")

SNOWFLAKE_EMBEDDING_MODEL=$(prompt_optional "SNOWFLAKE_EMBEDDING_MODEL" \
    "Snowflake Embedding Model (optional)" \
    "${ENV_VARS[SNOWFLAKE_EMBEDDING_MODEL]:-snowflake-arctic-embed-l-v2.0}")

SNOWFLAKE_CORTEX_SEARCH_SERVICE=$(prompt_optional "SNOWFLAKE_CORTEX_SEARCH_SERVICE" \
    "Snowflake Cortex Search Service (optional)" \
    "${ENV_VARS[SNOWFLAKE_CORTEX_SEARCH_SERVICE]:-}")

# Collect optional Vector Database credentials
echo -e "\n${GREEN}--- Optional: Vector Database Configuration ---${NC}"
MILVUS_ENDPOINT=$(prompt_optional "MILVUS_ENDPOINT" \
    "Milvus Endpoint (optional)" \
    "${ENV_VARS[MILVUS_ENDPOINT]:-}")

MILVUS_TOKEN=$(prompt_optional "MILVUS_TOKEN" \
    "Milvus Token (optional)" \
    "${ENV_VARS[MILVUS_TOKEN]:-}")

QDRANT_URL=$(prompt_optional "QDRANT_URL" \
    "Qdrant URL (optional)" \
    "${ENV_VARS[QDRANT_URL]:-}")

QDRANT_API_KEY=$(prompt_optional "QDRANT_API_KEY" \
    "Qdrant API Key (optional)" \
    "${ENV_VARS[QDRANT_API_KEY]:-}")

OPENSEARCH_ENDPOINT=$(prompt_optional "OPENSEARCH_ENDPOINT" \
    "OpenSearch Endpoint (optional)" \
    "${ENV_VARS[OPENSEARCH_ENDPOINT]:-}")

OPENSEARCH_CREDENTIALS=$(prompt_optional "OPENSEARCH_CREDENTIALS" \
    "OpenSearch Credentials (optional)" \
    "${ENV_VARS[OPENSEARCH_CREDENTIALS]:-}")

ELASTICSEARCH_URL=$(prompt_optional "ELASTICSEARCH_URL" \
    "Elasticsearch URL (optional)" \
    "${ENV_VARS[ELASTICSEARCH_URL]:-}")

ELASTICSEARCH_API_KEY=$(prompt_optional "ELASTICSEARCH_API_KEY" \
    "Elasticsearch API Key (optional)" \
    "${ENV_VARS[ELASTICSEARCH_API_KEY]:-}")

# Collect optional other services
echo -e "\n${GREEN}--- Optional: Other Services Configuration ---${NC}"
OLLAMA_URL=$(prompt_optional "OLLAMA_URL" \
    "Ollama URL (optional)" \
    "${ENV_VARS[OLLAMA_URL]:-http://localhost:11434}")

POSTGRES_CONNECTION_STRING=$(prompt_optional "POSTGRES_CONNECTION_STRING" \
    "PostgreSQL Connection String (optional)" \
    "${ENV_VARS[POSTGRES_CONNECTION_STRING]:-}")

POSTGRES_PASSWORD=$(prompt_optional "POSTGRES_PASSWORD" \
    "PostgreSQL Password (optional)" \
    "${ENV_VARS[POSTGRES_PASSWORD]:-}")

HF_TOKEN=$(prompt_optional "HF_TOKEN" \
    "Hugging Face Token (optional)" \
    "${ENV_VARS[HF_TOKEN]:-}")

CLOUDFLARE_API_TOKEN=$(prompt_optional "CLOUDFLARE_API_TOKEN" \
    "Cloudflare API Token (optional)" \
    "${ENV_VARS[CLOUDFLARE_API_TOKEN]:-}")

CLOUDFLARE_RAG_ID_ENV=$(prompt_optional "CLOUDFLARE_RAG_ID_ENV" \
    "Cloudflare RAG ID (optional)" \
    "${ENV_VARS[CLOUDFLARE_RAG_ID_ENV]:-}")

CLOUDFLARE_ACCOUNT_ID=$(prompt_optional "CLOUDFLARE_ACCOUNT_ID" \
    "Cloudflare Account ID (optional)" \
    "${ENV_VARS[CLOUDFLARE_ACCOUNT_ID]:-}")

# Validate required credentials
echo -e "\n${YELLOW}Validating required credentials...${NC}"
VALIDATION_FAILED=0

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "your_supabase_url_here" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_URL is required and cannot be empty"
    VALIDATION_FAILED=1
fi

if [ -z "$SUPABASE_ANON_KEY" ] || [ "$SUPABASE_ANON_KEY" = "your_supabase_anon_key_here" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY is required and cannot be empty"
    VALIDATION_FAILED=1
fi

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    print_error "OPENAI_API_KEY is required and cannot be empty"
    VALIDATION_FAILED=1
fi

if [ -z "$NEXT_PUBLIC_OPENAI_API_KEY" ] || [ "$NEXT_PUBLIC_OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
    print_error "NEXT_PUBLIC_OPENAI_API_KEY is required and cannot be empty"
    VALIDATION_FAILED=1
fi

if [ $VALIDATION_FAILED -eq 1 ]; then
    print_error "Validation failed! Please provide all required credentials."
    exit 1
fi

print_status "All required credentials validated successfully"

# Create .env.production file with all collected values
echo -e "\n${GREEN}Creating .env.production file...${NC}"

cat > .env.production << EOF
# ============================================
# Zaytoonz NGO - Production Environment Variables
# Generated by deploy-vps-beta.sh
# ============================================

# Node.js Configuration
NODE_ENV=production
PORT=3000

# ============================================
# Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# ============================================
# OpenAI Configuration
# ============================================
OPENAI_API_KEY=${OPENAI_API_KEY}
NEXT_PUBLIC_OPENAI_API_KEY=${NEXT_PUBLIC_OPENAI_API_KEY}
OPENAI_MODEL=${OPENAI_MODEL}
OPENAI_MAX_TOKENS=${OPENAI_MAX_TOKENS}
OPENAI_ENDPOINT=${OPENAI_ENDPOINT}

# ============================================
# Scraper Service Configuration
# ============================================
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=${USE_EXTERNAL_SCRAPER}
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=${EXTERNAL_SCRAPER_URL}
NEXT_PUBLIC_FALLBACK_TO_LOCAL=${FALLBACK_TO_LOCAL}

# ============================================
# NLWeb Service Configuration
# ============================================
NLWEB_URL=${NLWEB_URL}
NLWEB_CONFIG_DIR=${NLWEB_CONFIG_DIR}
NLWEB_OUTPUT_DIR=${NLWEB_OUTPUT_DIR}
NLWEB_OUTPUT_DIR_RELATIVE=${NLWEB_OUTPUT_DIR_RELATIVE}
NLWEB_LOGGING_PROFILE=${NLWEB_LOGGING_PROFILE}

# ============================================
# Python Environment Variables
# ============================================
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
PYTHONPATH=/app/NLWeb-main/code/python

# ============================================
# Azure OpenAI Configuration (Optional)
# ============================================
AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
AZURE_VECTOR_SEARCH_ENDPOINT=${AZURE_VECTOR_SEARCH_ENDPOINT}
AZURE_VECTOR_SEARCH_API_KEY=${AZURE_VECTOR_SEARCH_API_KEY}

# ============================================
# Anthropic Configuration (Optional)
# ============================================
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

# ============================================
# Inception AI Configuration (Optional)
# ============================================
INCEPTION_ENDPOINT=${INCEPTION_ENDPOINT}
INCEPTION_API_KEY=${INCEPTION_API_KEY}

# ============================================
# Snowflake Configuration (Optional)
# ============================================
SNOWFLAKE_ACCOUNT_URL=${SNOWFLAKE_ACCOUNT_URL}
SNOWFLAKE_PAT=${SNOWFLAKE_PAT}
SNOWFLAKE_EMBEDDING_MODEL=${SNOWFLAKE_EMBEDDING_MODEL}
SNOWFLAKE_CORTEX_SEARCH_SERVICE=${SNOWFLAKE_CORTEX_SEARCH_SERVICE}

# ============================================
# Vector Database Configuration (Optional)
# ============================================
MILVUS_ENDPOINT=${MILVUS_ENDPOINT}
MILVUS_TOKEN=${MILVUS_TOKEN}
QDRANT_URL=${QDRANT_URL}
QDRANT_API_KEY=${QDRANT_API_KEY}
OPENSEARCH_ENDPOINT=${OPENSEARCH_ENDPOINT}
OPENSEARCH_CREDENTIALS=${OPENSEARCH_CREDENTIALS}
ELASTICSEARCH_URL=${ELASTICSEARCH_URL}
ELASTICSEARCH_API_KEY=${ELASTICSEARCH_API_KEY}

# ============================================
# Other Services Configuration (Optional)
# ============================================
OLLAMA_URL=${OLLAMA_URL}
POSTGRES_CONNECTION_STRING=${POSTGRES_CONNECTION_STRING}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
HF_TOKEN=${HF_TOKEN}
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CLOUDFLARE_RAG_ID_ENV=${CLOUDFLARE_RAG_ID_ENV}
CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}

# ============================================
# Domain Configuration
# ============================================
DOMAIN=${DOMAIN}
VPS_IP=${VPS_IP}
EOF

print_status ".env.production file created with all credentials"

# Display configuration summary
echo -e "\n${GREEN}=== Configuration Summary ===${NC}"
echo -e "✓ Supabase URL: ${GREEN}${SUPABASE_URL}${NC}"
echo -e "✓ Supabase Anon Key: ${GREEN}${SUPABASE_ANON_KEY:0:20}...${NC}"
echo -e "✓ OpenAI API Key: ${GREEN}${OPENAI_API_KEY:0:20}...${NC}"
echo -e "✓ OpenAI Model: ${GREEN}${OPENAI_MODEL}${NC}"
echo -e "✓ External Scraper: ${GREEN}${USE_EXTERNAL_SCRAPER}${NC}"
echo -e "✓ NLWeb URL: ${GREEN}${NLWEB_URL}${NC}"
echo -e "✓ Domain: ${GREEN}${DOMAIN}${NC}"
echo -e "\n${GREEN}✓ All required credentials have been configured${NC}"
echo -e "${YELLOW}Note: Optional credentials can be added later by editing .env.production${NC}\n"

# Step 10: Make scripts executable
echo -e "\n${YELLOW}Step 9: Making scripts executable...${NC}"
chmod +x deploy-vps-beta.sh setup-nginx-beta.sh init-ssl-beta.sh 2>/dev/null || true
print_status "Scripts made executable"

# Step 11: Run Nginx setup
echo -e "\n${YELLOW}Step 10: Configuring Nginx...${NC}"
if [ -f "setup-nginx-beta.sh" ]; then
    bash setup-nginx-beta.sh
else
    print_error "setup-nginx-beta.sh not found. Please run it manually."
fi

# Step 12: Initialize SSL certificates
echo -e "\n${YELLOW}Step 11: Initializing SSL certificates...${NC}"
if [ -f "init-ssl-beta.sh" ]; then
    echo -e "${YELLOW}Do you want to initialize SSL certificates now? (y/n)${NC}"
    read -r init_ssl
    if [ "$init_ssl" = "y" ] || [ "$init_ssl" = "Y" ]; then
        bash init-ssl-beta.sh
    else
        print_warning "Skipping SSL initialization. Run init-ssl-beta.sh manually later."
    fi
else
    print_error "init-ssl-beta.sh not found. Please run it manually."
fi

# Step 13: Start Docker containers
echo -e "\n${YELLOW}Step 12: Starting Docker containers...${NC}"
if [ -f "docker-compose-beta.yml" ]; then
    # Load environment variables
    set -a
    [ -f .env.production ] && . .env.production
    set +a
    
    docker compose -f docker-compose-beta.yml pull
    docker compose -f docker-compose-beta.yml up -d --build
    
    print_status "Docker containers started"
    
    # Show container status
    echo -e "\n${GREEN}Container Status:${NC}"
    docker compose -f docker-compose-beta.yml ps
else
    print_error "docker-compose-beta.yml not found. Please create it or use existing docker-compose file."
fi

# Step 14: Show final information
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"
echo -e "Domain: ${GREEN}https://${DOMAIN}${NC}"
echo -e "VPS IP: ${GREEN}${VPS_IP}${NC}"
echo -e "Application Directory: ${GREEN}${APP_DIR}${NC}\n"
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs: ${GREEN}cd ${APP_DIR} && docker compose -f docker-compose-beta.yml logs -f${NC}"
echo -e "  Stop services: ${GREEN}cd ${APP_DIR} && docker compose -f docker-compose-beta.yml down${NC}"
echo -e "  Restart services: ${GREEN}cd ${APP_DIR} && docker compose -f docker-compose-beta.yml restart${NC}"
echo -e "  Update application: ${GREEN}cd ${APP_DIR} && git pull && docker compose -f docker-compose-beta.yml up -d --build${NC}\n"
