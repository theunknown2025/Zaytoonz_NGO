#!/bin/bash
# Script to copy nginx config to VPS
# Run this from your LOCAL machine (Windows with Git Bash/WSL) or on VPS

VPS_USER="root"
VPS_IP="76.13.57.178"
VPS_PATH="/opt/zaytoonz-ngo"
LOCAL_FILE="nginx-beta.conf"

echo "Copying nginx-beta.conf to VPS..."

# Copy file to VPS
scp "$LOCAL_FILE" "${VPS_USER}@${VPS_IP}:${VPS_PATH}/nginx-beta.conf"

echo "File copied. Now SSH into VPS and run:"
echo "  cd ${VPS_PATH}"
echo "  docker compose -f docker-compose-beta.yml stop nginx"
echo "  docker compose -f docker-compose-beta.yml rm -f nginx"
echo "  docker compose -f docker-compose-beta.yml up -d nginx"
echo "  docker compose -f docker-compose-beta.yml exec nginx nginx -t"
