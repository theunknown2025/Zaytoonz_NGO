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
# Remove .next folder from the bind mount (volume mount removed in docker-compose)
if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
    echo "✅ .next directory removed"
else
    echo "ℹ️  .next directory doesn't exist (will be created during build)"
fi

# Also remove .next from inside container if it exists (from previous builds)
echo "🧹 Ensuring clean build environment..."
docker compose -f docker-compose.production.yml run --rm nextjs sh -c "rm -rf .next" 2>/dev/null || true

# Also clean up any orphaned volumes from old setup
docker volume prune -f

echo "🔨 Rebuilding Next.js container with fresh build..."
docker compose -f docker-compose.production.yml up -d --build nextjs

echo "⏳ Waiting for build to start..."
sleep 5

echo "📋 Monitoring build logs (press Ctrl+C to exit)..."
docker compose -f docker-compose.production.yml logs -f nextjs
