#!/bin/bash

echo "🛑 Stopping containers..."
docker compose -f docker-compose.production.yml down

echo "🔍 Checking for incorrect nginx.conf usage..."
if [ -d "nginx.conf" ]; then
    echo "⚠️  Found 'nginx.conf' as a directory! This is the cause of the mount error."
    echo "🗑️  Removing the directory..."
    rm -rf nginx.conf
    echo "✅ 'nginx.conf' directory removed."
fi

echo "🔄 Pulling latest file from git to restore nginx.conf..."
git checkout nginx.conf
git pull origin main

echo "✅ Deployment state fixed. You can now restart your containers."
echo "👉 Run: docker compose -f docker-compose.production.yml up -d"
