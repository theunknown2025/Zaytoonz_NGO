#!/bin/bash

# Fix Git Merge Conflicts - Deployment Script
# This script handles local changes on VPS before pulling updates

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="${APP_DIR:-/var/www/zaytoonz-ngo}"

echo "================================================================"
echo "  Fixing Git Merge Conflicts"
echo "================================================================"
echo ""

cd "$APP_DIR"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}[ERROR] Not a git repository${NC}"
    exit 1
fi

# Check current status
echo "[*] Checking git status..."
git status --short

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo -e "${YELLOW}[WARNING] You have uncommitted changes${NC}"
    echo ""
    echo "Options:"
    echo "  1. Stash changes (recommended - saves your changes)"
    echo "  2. Discard local changes (WARNING: loses your changes)"
    echo "  3. Commit local changes first"
    echo ""
    read -p "Choose option (1/2/3): " choice
    
    case $choice in
        1)
            echo "[*] Stashing local changes..."
            git stash push -m "Stashed before pulling updates $(date +%Y%m%d_%H%M%S)"
            echo -e "${GREEN}[OK] Changes stashed${NC}"
            echo "[*] You can restore them later with: git stash pop"
            ;;
        2)
            echo -e "${YELLOW}[WARNING] Discarding all local changes...${NC}"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                git reset --hard HEAD
                git clean -fd
                echo -e "${GREEN}[OK] Local changes discarded${NC}"
            else
                echo "Aborted"
                exit 1
            fi
            ;;
        3)
            echo "[*] Committing local changes..."
            git add -A
            git commit -m "Local changes before merge $(date +%Y%m%d_%H%M%S)"
            echo -e "${GREEN}[OK] Changes committed${NC}"
            ;;
        *)
            echo -e "${RED}[ERROR] Invalid choice${NC}"
            exit 1
            ;;
    esac
fi

# Now pull the latest changes
echo ""
echo "[*] Pulling latest changes from GitHub..."
git fetch origin

# Try to pull with rebase (cleaner history)
if git pull --rebase origin main; then
    echo -e "${GREEN}[SUCCESS] Successfully pulled latest changes${NC}"
else
    echo -e "${YELLOW}[WARNING] Rebase failed, trying regular merge...${NC}"
    if git pull origin main; then
        echo -e "${GREEN}[SUCCESS] Successfully merged latest changes${NC}"
    else
        echo -e "${RED}[ERROR] Merge failed. Manual intervention required.${NC}"
        echo ""
        echo "To resolve manually:"
        echo "  1. Check conflicts: git status"
        echo "  2. Resolve conflicts in the files"
        echo "  3. Stage resolved files: git add <file>"
        echo "  4. Complete merge: git commit"
        exit 1
    fi
fi

echo ""
echo "[*] Current status:"
git status --short

echo ""
echo -e "${GREEN}[SUCCESS] Git merge conflict resolved!${NC}"
echo ""
echo "Next steps:"
echo "  1. If you stashed changes and want them back: git stash pop"
echo "  2. Rebuild the application: bash Deployment/05-build-application.sh"
echo "  3. Restart services: pm2 restart all"

