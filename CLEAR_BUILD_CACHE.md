# Complete Guide: Remove Stale Next.js Build Cache

## 🔍 Step 1: Identify All Cache Locations

### Check 1: Filesystem .next folder
```bash
cd /opt/zaytoonz-ngo
ls -la .next 2>/dev/null && echo "❌ .next folder EXISTS" || echo "✅ .next folder NOT FOUND"
```

### Check 2: Docker volumes
```bash
docker volume ls | grep -E "zaytoonz|next"
```

### Check 3: Container build cache
```bash
docker images | grep zaytoonz
docker ps -a | grep zaytoonz-nextjs
```

### Check 4: Next.js cache in container
```bash
# If container is running
docker exec zaytoonz-nextjs ls -la /app/.next 2>/dev/null && echo "❌ .next in container EXISTS" || echo "✅ .next in container NOT FOUND"
```

---

## 🧹 Step 2: Complete Cache Removal

### Method 1: Complete Cleanup (Recommended)

```bash
cd /opt/zaytoonz-ngo

# 1. Stop all containers
echo "🛑 Stopping containers..."
docker compose -f docker-compose.production.yml stop

# 2. Remove containers
echo "🗑️  Removing containers..."
docker compose -f docker-compose.production.yml rm -f

# 3. Remove .next folder from filesystem
echo "🧹 Removing .next folder..."
rm -rf .next
echo "✅ .next folder removed"

# 4. Remove node_modules/.cache (if exists)
echo "🧹 Removing node_modules cache..."
rm -rf node_modules/.cache 2>/dev/null || true

# 5. Remove Docker volumes
echo "🧹 Removing Docker volumes..."
docker volume ls | grep -E "zaytoonz.*next" | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || true
docker volume prune -f

# 6. Remove Docker build cache (optional, but thorough)
echo "🧹 Cleaning Docker build cache..."
docker builder prune -f

# 7. Verify removal
echo ""
echo "🔍 Verification:"
echo "Checking .next folder..."
ls -la .next 2>/dev/null && echo "❌ STILL EXISTS - Remove manually!" || echo "✅ REMOVED"

echo "Checking Docker volumes..."
docker volume ls | grep -E "zaytoonz.*next" && echo "❌ VOLUMES STILL EXIST" || echo "✅ NO VOLUMES FOUND"

echo ""
echo "✅ Cache cleanup complete!"
```

### Method 2: Nuclear Option (If Method 1 doesn't work)

```bash
cd /opt/zaytoonz-ngo

# Stop everything
docker compose -f docker-compose.production.yml down

# Remove all volumes
docker volume prune -af

# Remove all build cache
docker builder prune -af

# Remove .next folder
rm -rf .next

# Remove node_modules cache
rm -rf node_modules/.cache

# Remove any .next folders in subdirectories
find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true

# Verify
echo "Verification:"
ls -la .next 2>/dev/null || echo "✅ .next removed"
docker volume ls | grep next || echo "✅ No next volumes"
```

---

## ✅ Step 3: Verification Commands

### Verify .next is Removed
```bash
cd /opt/zaytoonz-ngo

# Check if .next exists
if [ -d ".next" ]; then
    echo "❌ .next folder STILL EXISTS"
    echo "Size: $(du -sh .next | cut -f1)"
    echo "Contents:"
    ls -la .next | head -10
else
    echo "✅ .next folder REMOVED"
fi
```

### Verify Docker Volumes
```bash
# List all volumes
docker volume ls

# Check for next-related volumes
docker volume ls | grep -i next
# Should return nothing if cleaned
```

### Verify Container State
```bash
# Check if container exists
docker ps -a | grep zaytoonz-nextjs
# Should show nothing or "Exited" status
```

---

## 🔨 Step 4: Rebuild with Fresh Cache

After clearing cache, rebuild:

```bash
cd /opt/zaytoonz-ngo

# Pull latest code (if needed)
git pull origin main

# Rebuild with --no-cache flag (forces fresh build)
docker compose -f docker-compose.production.yml build --no-cache nextjs

# Start container
docker compose -f docker-compose.production.yml up -d nextjs

# Monitor build
docker compose -f docker-compose.production.yml logs -f nextjs
```

---

## 🔍 Step 5: Verify New Build

### Check Build Output
```bash
# Watch logs for build completion
docker compose -f docker-compose.production.yml logs nextjs | grep -E "Compiled|Ready|build"

# Should see:
# ✓ Compiled /page
# ✓ Compiled successfully
# > Ready on http://localhost:3000
```

### Check Built Files
```bash
# Enter container
docker exec -it zaytoonz-nextjs sh

# Check what was built
ls -la /app/.next/server/app/

# Check root page
cat /app/.next/server/app/page.js | grep -i "ZaytoonzSMLanding\|LandingPage"

# Should see: ZaytoonzSMLanding (NOT LandingPage)
exit
```

### Test the Page
```bash
# Test root page
curl http://localhost:3001 | grep -i "zaytoonz-sm-root\|background-slideshow"

# Should see SM page HTML elements
```

---

## 📋 Complete Cleanup Script

Save this as `clear-cache.sh`:

```bash
#!/bin/bash
set -e

echo "🧹 Complete Next.js Build Cache Cleanup"
echo "========================================"

cd /opt/zaytoonz-ngo

# Stop containers
echo "1️⃣  Stopping containers..."
docker compose -f docker-compose.production.yml stop 2>/dev/null || true

# Remove containers
echo "2️⃣  Removing containers..."
docker compose -f docker-compose.production.yml rm -f 2>/dev/null || true

# Remove .next folder
echo "3️⃣  Removing .next folder..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "   ✅ .next removed"
else
    echo "   ℹ️  .next doesn't exist"
fi

# Remove node_modules cache
echo "4️⃣  Removing node_modules cache..."
rm -rf node_modules/.cache 2>/dev/null || true

# Remove Docker volumes
echo "5️⃣  Removing Docker volumes..."
docker volume ls | grep -E "zaytoonz.*next" | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || true
docker volume prune -f >/dev/null 2>&1

# Remove Docker build cache
echo "6️⃣  Cleaning Docker build cache..."
docker builder prune -f >/dev/null 2>&1

# Verification
echo ""
echo "🔍 Verification:"
if [ -d ".next" ]; then
    echo "   ❌ .next STILL EXISTS - Manual removal needed!"
else
    echo "   ✅ .next REMOVED"
fi

VOLUMES=$(docker volume ls | grep -E "zaytoonz.*next" | wc -l)
if [ "$VOLUMES" -gt 0 ]; then
    echo "   ❌ Docker volumes still exist"
else
    echo "   ✅ No Docker volumes found"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Rebuild: docker compose -f docker-compose.production.yml up -d --build nextjs"
echo "2. Monitor: docker compose -f docker-compose.production.yml logs -f nextjs"
```

Make it executable:
```bash
chmod +x clear-cache.sh
./clear-cache.sh
```

---

## 🚨 Troubleshooting

### If .next folder won't delete:

```bash
# Check what's using it
lsof +D .next 2>/dev/null || fuser .next 2>/dev/null

# Force remove (be careful!)
sudo rm -rf .next

# Or if it's a mount point
umount .next 2>/dev/null || true
rm -rf .next
```

### If Docker volumes won't delete:

```bash
# List volumes
docker volume ls

# Remove specific volume
docker volume rm <volume-name>

# Force remove all unused volumes
docker volume prune -af
```

### If container won't stop:

```bash
# Force stop
docker kill zaytoonz-nextjs

# Force remove
docker rm -f zaytoonz-nextjs
```

---

## ✅ Success Indicators

After cleanup and rebuild, you should see:

1. ✅ `.next` folder is removed (or newly created)
2. ✅ No Docker volumes with "next" in name
3. ✅ Build logs show "✓ Compiled /page"
4. ✅ Root URL shows SM page (not LandingPage)
5. ✅ Container logs show "Ready on http://localhost:3000"

---

## 📝 Quick Reference

**One-liner complete cleanup:**
```bash
cd /opt/zaytoonz-ngo && docker compose -f docker-compose.production.yml down && rm -rf .next node_modules/.cache && docker volume prune -af && docker builder prune -f && echo "✅ Cache cleared"
```

**Then rebuild:**
```bash
docker compose -f docker-compose.production.yml up -d --build nextjs && docker compose -f docker-compose.production.yml logs -f nextjs
```
