#!/bin/bash

# Main Deployment Script
# Orchestrates all deployment steps

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration (can be overridden by environment variables)
export REPO_URL="${REPO_URL:-https://github.com/theunknown2025/Zaytoonz_NGO.git}"
export APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"
export BRANCH="${BRANCH:-main}"
export DOMAIN="${DOMAIN:-zaytoonz.com}"
export COMING_SOON_PATH="${COMING_SOON_PATH:-/var/www/zaytoonz}"
export APP_NAME="${APP_NAME:-zaytoonz-test}"
export PORT="${PORT:-3001}"
export BASE_PATH="${BASE_PATH:-/test}"
export SKIP_SSL="${SKIP_SSL:-false}"
export INSTALL_MODE="${INSTALL_MODE:-production}"

echo ""
echo "================================================================"
echo -e "${BLUE}  Zaytoonz NGO - Complete Deployment${NC}"
echo "================================================================"
echo ""
echo "Configuration:"
echo "  Repository:    $REPO_URL"
echo "  App Directory: $APP_DIR"
echo "  Branch:        $BRANCH"
echo "  Domain:        $DOMAIN"
echo "  Port:          $PORT"
echo "  Base Path:     $BASE_PATH"
echo "  Skip SSL:      $SKIP_SSL"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Array of deployment steps
STEPS=(
    "01-check-prerequisites.sh:Check Prerequisites"
    "02-setup-repository.sh:Setup Repository"
    "03-install-dependencies.sh:Install Dependencies"
    "04-configure-environment.sh:Configure Environment"
    "05-build-application.sh:Build Application"
    "06-setup-pm2.sh:Setup PM2"
    "07-configure-nginx.sh:Configure Nginx"
    "08-setup-ssl.sh:Setup SSL (Optional)"
    "09-verify-deployment.sh:Verify Deployment"
)

# Track step results
FAILED_STEPS=()
PASSED_STEPS=()

# Run each step
for step_info in "${STEPS[@]}"; do
    IFS=':' read -r script_name step_description <<< "$step_info"
    script_path="$SCRIPT_DIR/$script_name"
    
    echo ""
    echo "================================================================"
    echo -e "${BLUE}  Running: $step_description${NC}"
    echo "================================================================"
    echo ""
    
    if [ ! -f "$script_path" ]; then
        echo -e "${RED}[ERROR] Script not found: $script_path${NC}"
        FAILED_STEPS+=("$step_description (script not found)")
        continue
    fi
    
    # Make script executable
    chmod +x "$script_path"
    
    # Run the step
    if bash "$script_path"; then
        echo ""
        echo -e "${GREEN}[SUCCESS] $step_description completed${NC}"
        PASSED_STEPS+=("$step_description")
    else
        echo ""
        echo -e "${RED}[ERROR] $step_description failed${NC}"
        FAILED_STEPS+=("$step_description")
        
        # Ask if user wants to continue
        echo ""
        read -p "Continue with next step? (y/n): " continue_choice
        if [ "$continue_choice" != "y" ] && [ "$continue_choice" != "Y" ]; then
            echo "Deployment stopped by user"
            break
        fi
    fi
done

# Summary
echo ""
echo "================================================================"
echo -e "${BLUE}  Deployment Summary${NC}"
echo "================================================================"
echo ""

if [ ${#PASSED_STEPS[@]} -gt 0 ]; then
    echo -e "${GREEN}Passed steps (${#PASSED_STEPS[@]}):${NC}"
    for step in "${PASSED_STEPS[@]}"; do
        echo "  ✓ $step"
    done
    echo ""
fi

if [ ${#FAILED_STEPS[@]} -gt 0 ]; then
    echo -e "${RED}Failed steps (${#FAILED_STEPS[@]}):${NC}"
    for step in "${FAILED_STEPS[@]}"; do
        echo "  ✗ $step"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}[SUCCESS] All deployment steps completed!${NC}"
    echo ""
    echo "Your application should now be accessible at:"
    echo "  Coming Soon: http://$DOMAIN"
    echo "  Your App:    http://$DOMAIN/test"
    echo ""
    exit 0
fi

