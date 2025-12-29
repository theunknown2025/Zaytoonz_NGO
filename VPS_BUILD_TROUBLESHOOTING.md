# VPS Build Troubleshooting Guide

## Why Builds Fail on VPS (Common Causes)

### 1. ❌ Missing or Invalid Environment Variables

**Problem**: `.env.local` has placeholder values like `your_supabase_url_here`

**Symptoms**:
```
TypeError: Invalid URL
input: 'your_supabase_url_here/auth/v1'
```

**Solution**:
```bash
cd /var/www/zaytoonz-ngo
nano .env.local
# Replace placeholder values with actual ones:
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-key-here
NEXT_PUBLIC_BASE_PATH=/test
```

### 2. ❌ Missing Files (Not Pulled from Git)

**Problem**: Files exist locally but not on VPS

**Symptoms**:
```
Module not found: Can't resolve '@/app/lib/auth'
Module not found: Can't resolve '@/app/components/UploadButton'
```

**Solution**:
```bash
cd /var/www/zaytoonz-ngo
git fetch origin
git reset --hard origin/main
# Verify files exist
ls -la app/lib/auth.ts
ls -la app/components/UploadButton.tsx
```

### 3. ❌ Stale Build Cache

**Problem**: Old `.next` directory causing conflicts

**Symptoms**: Build fails with cryptic errors

**Solution**:
```bash
cd /var/www/zaytoonz-ngo
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

### 4. ❌ Missing Dependencies

**Problem**: `node_modules` incomplete or corrupted

**Symptoms**:
```
Cannot find module 'next'
Cannot find module '@supabase/supabase-js'
```

**Solution**:
```bash
cd /var/www/zaytoonz-ngo
rm -rf node_modules package-lock.json
npm install --production
npm run build
```

### 5. ❌ Wrong Node.js Version

**Problem**: Node.js version too old

**Symptoms**: Build fails or warnings about unsupported features

**Solution**:
```bash
# Check version
node --version  # Should be v18 or higher

# If too old, install Node.js 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### 6. ❌ Insufficient Resources

**Problem**: Not enough memory or disk space

**Symptoms**: Build crashes or hangs

**Solution**:
```bash
# Check disk space
df -h

# Check memory
free -h

# If low, clean up:
rm -rf node_modules/.cache
npm cache clean --force
```

### 7. ❌ Path Alias Issues

**Problem**: TypeScript/webpack can't resolve `@/` paths

**Symptoms**:
```
Module not found: Can't resolve '@/app/lib/auth'
```

**Solution**: Already fixed in `next.config.js` with explicit webpack alias.
If still failing:
```bash
# Verify tsconfig.json
cat tsconfig.json | grep "@/\*"

# Should show:
# "@/*": ["./*"]
```

### 8. ❌ Environment Variable Not Set During Build

**Problem**: `NEXT_PUBLIC_BASE_PATH` not set when running build

**Symptoms**: Build succeeds but app doesn't work correctly

**Solution**:
```bash
# Always set before building
export NEXT_PUBLIC_BASE_PATH=/test
npm run build

# Or add to .env.local (recommended)
echo "NEXT_PUBLIC_BASE_PATH=/test" >> .env.local
npm run build
```

---

## Step-by-Step Fix Procedure

### Quick Fix (Try This First)

```bash
cd /var/www/zaytoonz-ngo

# 1. Pull latest code
git pull origin main

# 2. Clear caches
rm -rf .next node_modules/.cache

# 3. Reinstall dependencies
npm install --production

# 4. Verify .env.local
cat .env.local | grep -v "^#" | grep -v "^$"

# 5. Build with environment variable
export NEXT_PUBLIC_BASE_PATH=/test
npm run build
```

### Comprehensive Fix (If Quick Fix Doesn't Work)

```bash
cd /var/www/zaytoonz-ngo

# 1. Run diagnostic script
bash Deployment/diagnose-build-issues.sh

# 2. Follow the recommendations from the diagnostic

# 3. Or use the automated fix script
bash fix-build-on-vps.sh
```

---

## Diagnostic Commands

### Check What's Wrong

```bash
# Run comprehensive diagnostic
bash Deployment/diagnose-build-issues.sh

# Or check manually:
cd /var/www/zaytoonz-ngo

# Check environment
echo "NEXT_PUBLIC_BASE_PATH: $NEXT_PUBLIC_BASE_PATH"
cat .env.local | head -5

# Check files
ls -la app/lib/auth.ts
ls -la app/components/UploadButton.tsx

# Check dependencies
npm list next
npm list @supabase/supabase-js

# Check build output
npm run build 2>&1 | tee build.log
cat build.log | grep -i error
```

---

## Common Error Messages and Solutions

### Error: "Invalid URL"
**Cause**: Placeholder values in `.env.local`  
**Fix**: Update `.env.local` with real values

### Error: "Module not found '@/app/lib/auth'"
**Cause**: File missing or path alias broken  
**Fix**: Pull latest code, verify `tsconfig.json`

### Error: "Dynamic server usage"
**Cause**: Route trying to use headers/request during build  
**Fix**: Add `export const dynamic = 'force-dynamic'` to route (already done)

### Error: "Cannot find module 'next'"
**Cause**: Dependencies not installed  
**Fix**: Run `npm install`

### Error: "Build error occurred"
**Cause**: Various (check full error message)  
**Fix**: Run diagnostic script to identify specific issue

---

## Prevention: Best Practices

1. **Always set environment variables before build**:
   ```bash
   export NEXT_PUBLIC_BASE_PATH=/test
   npm run build
   ```

2. **Keep .env.local updated**:
   - Never commit placeholder values
   - Always use real Supabase credentials

3. **Pull latest code before building**:
   ```bash
   git pull origin main
   npm run build
   ```

4. **Clear cache when in doubt**:
   ```bash
   rm -rf .next node_modules/.cache
   ```

5. **Use the deployment scripts**:
   ```bash
   bash Deployment/deploy.sh
   # Or individual steps
   bash Deployment/05-build-application.sh
   ```

---

## Still Not Working?

1. **Run the diagnostic**:
   ```bash
   bash Deployment/diagnose-build-issues.sh
   ```

2. **Check the full build log**:
   ```bash
   npm run build 2>&1 | tee build-full.log
   cat build-full.log
   ```

3. **Verify you're in the right directory**:
   ```bash
   pwd  # Should be /var/www/zaytoonz-ngo
   ```

4. **Check permissions**:
   ```bash
   ls -la .env.local
   # Should be readable
   ```

5. **Try building with more verbose output**:
   ```bash
   NODE_OPTIONS='--trace-warnings' npm run build
   ```

---

**Last Updated**: 2025-01-15

