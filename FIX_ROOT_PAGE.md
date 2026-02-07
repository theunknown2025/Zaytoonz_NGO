# Fix Root Page - Step by Step Guide

## ✅ File Verification
Your `app/page.tsx` is **CORRECT** - it imports `ZaytoonzSMLanding`.

## 🔧 The Problem
The Next.js build cache (`.next` folder) still contains the old build with LandingPage.

## 🛠️ Solution - Run These Commands on VPS

### Step 1: Stop the Container
```bash
cd /opt/zaytoonz-ngo
docker compose -f docker-compose.production.yml stop nextjs
```

### Step 2: Remove the Container
```bash
docker compose -f docker-compose.production.yml rm -f nextjs
```

### Step 3: Clear Build Cache
```bash
# Remove the .next folder (this is the cached build)
rm -rf .next

# Also remove any orphaned volumes
docker volume prune -f
```

### Step 4: Verify Code is Correct (Optional)
```bash
# Double-check the file is correct
cat app/page.tsx | grep -E "ZaytoonzSMLanding|LandingPage"
# Should show: ZaytoonzSMLanding (NOT LandingPage)
```

### Step 5: Rebuild Container
```bash
# Rebuild with fresh cache
docker compose -f docker-compose.production.yml up -d --build nextjs
```

### Step 6: Monitor Build
```bash
# Watch the build process
docker compose -f docker-compose.production.yml logs -f nextjs
```

**Look for:**
- `✓ Compiled /page` - This means the root page was built
- `✓ Compiled successfully`
- `> Ready on http://localhost:3000`

### Step 7: Test
```bash
# Test the root page
curl http://localhost:3001 | grep -i "zaytoonz-sm-root\|background-slideshow"

# Should see SM page HTML elements
```

## 🚨 If Still Not Working

### Check 1: Verify Build Output
```bash
# Enter the container
docker exec -it zaytoonz-nextjs sh

# Check what was actually built
ls -la /app/.next/server/app/
cat /app/.next/server/app/page.js | head -30

# Should see ZaytoonzSMLanding references, not LandingPage
```

### Check 2: Force Complete Rebuild
```bash
# Stop everything
docker compose -f docker-compose.production.yml down

# Remove all volumes
docker volume prune -f

# Remove .next folder
rm -rf .next

# Rebuild from scratch
docker compose -f docker-compose.production.yml up -d --build
```

### Check 3: Verify Environment Variables
```bash
# Check if basePath is interfering
docker exec zaytoonz-nextjs env | grep BASE_PATH

# Should be empty or not set
```

## ✅ Expected Result

After rebuilding:
- **Root URL (`/`):** Shows SM Page (social media links)
- **`/app`:** Shows Full LandingPage
- **`/social`:** Shows SM Page

## 📝 Quick One-Liner Fix

```bash
cd /opt/zaytoonz-ngo && docker compose -f docker-compose.production.yml stop nextjs && docker compose -f docker-compose.production.yml rm -f nextjs && rm -rf .next && docker compose -f docker-compose.production.yml up -d --build nextjs && docker compose -f docker-compose.production.yml logs -f nextjs
```
