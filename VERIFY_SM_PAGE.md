# Verification Guide: Ensure SM Page Shows at Root

## ✅ Pre-Deployment Verification (Before Building)

### 1. Verify app/page.tsx is Correct
```bash
cd /opt/zaytoonz-ngo
cat app/page.tsx
```

**Must show:**
```typescript
import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';
// NOT: import LandingPage from './LandingPage/LandingPage';

export default function Home() {
  return <ZaytoonzSMLanding initialShowModal={false} />;
  // NOT: return <LandingPage />;
}
```

**Quick check:**
```bash
# Should return: ZaytoonzSMLanding
grep "import.*from" app/page.tsx | grep -v "^//"

# Should NOT return: LandingPage
grep "LandingPage" app/page.tsx && echo "❌ WRONG!" || echo "✅ CORRECT"
```

### 2. Verify Component Exists
```bash
# Check if ZaytoonzSMLanding component exists
ls -la app/components/ZaytoonzSMLanding.tsx

# Should show the file exists
```

### 3. Verify No .next Cache Exists (Fresh Install)
```bash
# On fresh install, this should NOT exist
ls -la .next 2>/dev/null && echo "❌ .next exists (remove it!)" || echo "✅ No .next (good for fresh install)"
```

---

## 🔨 During Build - What to Look For

### Monitor Build Logs
```bash
docker compose -f docker-compose.production.yml logs -f nextjs
```

**Look for these messages:**
1. `✓ Compiled /page` - Root page compiled
2. `✓ Compiled successfully` - Build complete
3. `> Ready on http://localhost:3000` - Server ready

**If you see errors about:**
- `Cannot find module './components/ZaytoonzSMLanding'` → Component file missing
- `LandingPage` in build logs → Wrong import in app/page.tsx

---

## ✅ Post-Build Verification

### 1. Check Built Files
```bash
# Enter container
docker exec -it zaytoonz-nextjs sh

# Check what was built
cat /app/.next/server/app/page.js | grep -E "ZaytoonzSMLanding|LandingPage" | head -5

# Should show: ZaytoonzSMLanding references
# Should NOT show: LandingPage references

exit
```

### 2. Test HTTP Response
```bash
# Test root URL
curl http://localhost:3001 | grep -i "zaytoonz-sm-root\|background-slideshow\|social-link" | head -3

# Should see SM page HTML elements
```

### 3. Test in Browser
Open: `http://YOUR_VPS_IP`

**Should see:**
- ✅ Background slideshow (Health/Water/Green/Education images)
- ✅ Social media links grid (WhatsApp, Telegram, Facebook, etc.)
- ✅ "Fueling Social Impact with Professional Expertise" slogan
- ❌ NOT the full LandingPage with navigation menu

---

## 🚨 If Still Seeing LandingPage

### Step 1: Run Diagnostic Script
```bash
cd /opt/zaytoonz-ngo
chmod +x diagnose-root-page.sh
./diagnose-root-page.sh
```

### Step 2: Verify File Again
```bash
# Double-check the file
cat app/page.tsx

# If it shows LandingPage, fix it:
nano app/page.tsx
# Change to:
# import ZaytoonzSMLanding from './components/ZaytoonzSMLanding';
# return <ZaytoonzSMLanding initialShowModal={false} />;
```

### Step 3: Force Complete Rebuild
```bash
# Stop everything
docker compose -f docker-compose.production.yml down

# Remove build cache
rm -rf .next

# Remove Docker cache
docker builder prune -f

# Rebuild with --no-cache
docker compose -f docker-compose.production.yml build --no-cache nextjs

# Start
docker compose -f docker-compose.production.yml up -d

# Monitor
docker compose -f docker-compose.production.yml logs -f nextjs
```

---

## 📋 Quick Verification Checklist

After fresh OS install and deployment:

- [ ] `app/page.tsx` imports `ZaytoonzSMLanding` (NOT `LandingPage`)
- [ ] `app/page.tsx` returns `<ZaytoonzSMLanding />` (NOT `<LandingPage />`)
- [ ] No `.next` folder exists before first build
- [ ] Build completes without errors
- [ ] Build logs show `✓ Compiled /page`
- [ ] Root URL shows SM page (social media links)
- [ ] `/app` route shows full LandingPage
- [ ] `/social` route shows SM page

---

## 🔍 Common Issues

### Issue: File is correct but still shows LandingPage
**Cause:** Build cache
**Solution:** Remove `.next` and rebuild

### Issue: Build fails with "Cannot find module"
**Cause:** Component file missing
**Solution:** Verify `app/components/ZaytoonzSMLanding.tsx` exists

### Issue: Shows LandingPage even after rebuild
**Cause:** File wasn't actually updated
**Solution:** Verify file content, check git status

---

## ✅ Success Indicators

You'll know it's working when:
1. Root URL shows social media links grid
2. Background slideshow is visible
3. No navigation menu at top
4. `/app` route shows the full LandingPage with navigation
