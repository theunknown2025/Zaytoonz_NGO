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

# Step 9: Set up environment file
echo -e "\n${YELLOW}Step 8: Setting up environment variables...${NC}"
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating template..."
    cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://python-scraper:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# NLWeb Configuration
NLWEB_URL=http://nlweb:8000

# Domain Configuration
DOMAIN=${DOMAIN}
VPS_IP=${VPS_IP}
EOF
    print_warning "Please edit .env.production with your actual values before continuing!"
    echo -e "${YELLOW}Press Enter after editing .env.production to continue...${NC}"
    read -r
else
    print_status ".env.production already exists"
fi

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
