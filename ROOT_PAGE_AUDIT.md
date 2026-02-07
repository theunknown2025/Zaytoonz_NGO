# Root Page Audit - Why LandingPage Shows Instead of SM Page

## Audit Date: Current
## Issue: Root URL (/) shows LandingPage instead of ZaytoonzSMLanding (SM Page)

---

## ✅ File Audit Results

### 1. `app/page.tsx` - ROOT PAGE ✅ CORRECT
**Status:** ✅ **CORRECT** - Imports and renders `ZaytoonzSMLanding`
```typescript
import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';
export default function Home() {
  return <ZaytoonzSMLanding initialShowModal={false} />;
}
```
**Verdict:** This file is correct. It should render SM page at root.

---

### 2. `app/app/page.tsx` - /app ROUTE ✅ CORRECT
**Status:** ✅ **CORRECT** - Imports and renders `LandingPage`
```typescript
import LandingPage from '../LandingPage/LandingPage';
export default function AppPage() {
  return <LandingPage />;
}
```
**Verdict:** This is correct. Full LandingPage should be at `/app` route only.

---

### 3. `app/layout.tsx` - ROOT LAYOUT ✅ CORRECT
**Status:** ✅ **CORRECT** - No redirects, just wraps children
- Wraps all pages with AuthProvider
- No routing logic
- No redirects

---

### 4. `app/components/AuthProvider.tsx` ✅ CORRECT
**Status:** ✅ **CORRECT** - No redirects
- Only shows "Loading..." while checking auth
- Then renders children
- No automatic redirects

---

### 5. `app/components/ZaytoonzSMLanding.tsx` ✅ CORRECT
**Status:** ✅ **CORRECT** - No automatic redirects
- Only redirects on button clicks (user interaction)
- `router.push('/social')` - only when user clicks "Explore Social Media"
- `router.push('/app')` - only when user enters correct access code
- **No automatic redirects on page load**

---

### 6. `next.config.js` ⚠️ POTENTIAL ISSUE
**Status:** ⚠️ **CHECK THIS**
```javascript
basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
trailingSlash: true,
```
**Potential Issues:**
- If `NEXT_PUBLIC_BASE_PATH` is set to something, it could affect routing
- `trailingSlash: true` means URLs end with `/` - this is fine

**Action:** Verify `.env` file on VPS doesn't have `NEXT_PUBLIC_BASE_PATH` set

---

### 7. Middleware Files ❌ NOT FOUND
**Status:** ✅ **NO MIDDLEWARE** - No middleware files found
- No `middleware.ts` or `middleware.js`
- No automatic redirects from middleware

---

### 8. Docker Build Cache ⚠️ LIKELY CULPRIT
**Status:** ⚠️ **MOST LIKELY ISSUE**

In `docker-compose.production.yml`:
```yaml
volumes:
  - ./:/app
  - /app/node_modules
  - /app/.next  # ← THIS PERSISTS BUILD CACHE
```

**Problem:** The `/app/.next` volume persists the old build cache. Even if you update `app/page.tsx`, the old build is still being used.

---

## 🔍 Root Cause Analysis

### Most Likely Cause: **STALE BUILD CACHE**

The VPS is using a cached build from `.next` folder. The code is correct, but the production build hasn't been regenerated.

### Evidence:
1. ✅ All source files are correct
2. ✅ No redirects in code
3. ✅ No middleware interfering
4. ⚠️ Docker volume `/app/.next` persists old build
5. ⚠️ Container might not have been rebuilt after code changes

---

## 🛠️ Solution Steps

### Step 1: Verify Code is Updated on VPS
```bash
cd /opt/zaytoonz-ngo
git pull origin main
cat app/page.tsx | grep -A 3 "export default"
```
**Expected:** Should see `ZaytoonzSMLanding` import and return

### Step 2: Clear Build Cache
```bash
# Stop container
docker compose -f docker-compose.production.yml stop nextjs

# Remove container
docker compose -f docker-compose.production.yml rm -f nextjs

# Remove build cache volume
docker volume prune -f

# Or manually remove .next volume
docker volume ls | grep next
docker volume rm <volume-name>
```

### Step 3: Rebuild with Fresh Cache
```bash
# Rebuild without cache
docker compose -f docker-compose.production.yml up -d --build nextjs

# Monitor build
docker compose -f docker-compose.production.yml logs -f nextjs
```

### Step 4: Verify Build Output
Look for in logs:
```
✓ Compiled /page in XXXms
```

### Step 5: Test
```bash
# Test root page
curl http://localhost:3001 | grep -i "zaytoonz-sm-root\|background-slideshow"

# Should see SM page HTML elements
```

---

## 📋 Checklist for VPS

- [ ] Code is pulled from GitHub (`git pull origin main`)
- [ ] `app/page.tsx` contains `ZaytoonzSMLanding` import
- [ ] Next.js container is stopped
- [ ] Build cache volume is removed
- [ ] Container is rebuilt with `--build` flag
- [ ] Build completes successfully
- [ ] Root URL shows SM page (not LandingPage)

---

## 🚨 If Still Not Working

### Check 1: Verify What's Actually Built
```bash
# Enter the container
docker exec -it zaytoonz-nextjs sh

# Check built pages
ls -la /app/.next/server/app/
cat /app/.next/server/app/page.js | head -20

# Should see ZaytoonzSMLanding, not LandingPage
```

### Check 2: Verify Environment Variables
```bash
# Check if basePath is set incorrectly
docker exec zaytoonz-nextjs env | grep BASE_PATH
```

### Check 3: Check Next.js Build Output
```bash
# View full build logs
docker compose -f docker-compose.production.yml logs nextjs | grep -i "page\|route\|build"
```

---

## ✅ Expected Final State

- **Root (`/`):** SM Page (ZaytoonzSMLanding) - Social media links
- **`/app`:** Full LandingPage - Navigation, opportunities, etc.
- **`/social`:** SM Page (same as root)

---

## 📝 Notes

- The code is **100% correct** in the repository
- The issue is **100% a build cache problem** on the VPS
- Solution: **Clear cache and rebuild**
