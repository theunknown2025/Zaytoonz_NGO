#!/bin/bash
# Script to rebuild Next.js on VPS with fresh cache
# Run this on your VPS to ensure root page shows SM page

cd /opt/zaytoonz-ngo

echo "🔄 Pulling latest code from GitHub..."
git pull origin main

echo "🛑 Stopping containers..."
docker compose -f docker-compose.production.yml stop nextjs

echo "🗑️  Removing Next.js container and build cache..."
docker compose -f docker-compose.production.yml rm -f nextjs

echo "🧹 Cleaning Next.js build cache inside container volume..."
# Remove .next directory if it exists in the volume
docker run --rm -v zaytoonz-ngo_app:/app alpine sh -c "rm -rf /app/.next" 2>/dev/null || true

echo "🔨 Rebuilding Next.js container with fresh build..."
docker compose -f docker-compose.production.yml up -d --build nextjs

echo "⏳ Waiting for build to start..."
sleep 5

echo "📋 Monitoring build logs (press Ctrl+C to exit)..."
docker compose -f docker-compose.production.yml logs -f nextjs
