#!/bin/bash
# Script to rebuild Next.js on VPS with fresh cache
# Run this on your VPS to ensure root page shows SM page

cd /opt/zaytoonz-ngo

echo "🔄 Pulling latest code from GitHub..."
git pull origin main

echo "🛑 Stopping containers..."
docker compose -f docker-compose.production.yml stop nextjs

echo "🗑️  Removing Next.js container..."
docker compose -f docker-compose.production.yml rm -f nextjs

echo "🧹 Cleaning Next.js build cache (.next folder)..."
# The /app/.next volume persists build cache - we need to remove it
# Find and remove the anonymous volume created by /app/.next
docker volume ls | grep -E "zaytoonz.*next" | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || true
# Also try to remove by container name pattern
docker volume prune -f

echo "💡 Note: If build cache persists, manually run: docker volume prune -f"

echo "🔨 Rebuilding Next.js container with fresh build..."
docker compose -f docker-compose.production.yml up -d --build nextjs

echo "⏳ Waiting for build to start..."
sleep 5

echo "📋 Monitoring build logs (press Ctrl+C to exit)..."
docker compose -f docker-compose.production.yml logs -f nextjs
