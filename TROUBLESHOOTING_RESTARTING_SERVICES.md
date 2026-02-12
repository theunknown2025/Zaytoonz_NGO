# Troubleshooting Restarting Docker Services

## Current Status

From your Docker dashboard:
- ✅ **Running**: `zaytoonz-certbot`, `zaytoonz-nginx`, `zaytoonz-scraper`
- ⚠️ **Restarting**: `zaytoonz-nextjs`, `zaytoonz-nlweb`

## What "Restarting" Means

When a container shows "Restarting" status, it means:
1. The container starts successfully
2. The application inside crashes or exits with an error
3. Docker automatically restarts it (due to `restart: unless-stopped`)
4. The cycle repeats indefinitely

This is a **crash loop** - the service cannot stay running.

---

## Step 1: Check Container Logs

The logs will show you exactly why the services are crashing.

### Check Next.js Logs

```bash
docker logs zaytoonz-nextjs --tail 100
```

**Common issues to look for:**
- ❌ File not found: `app/page.tsx` or `app/app/page.tsx` doesn't exist
- ❌ Build errors: Missing dependencies, TypeScript errors, build failures
- ❌ Port already in use: Port 3000 might be occupied
- ❌ Missing environment variables: `NEXT_PUBLIC_SUPABASE_URL` or other vars not set
- ❌ Module not found: Missing npm packages

### Check NLWeb Logs

```bash
docker logs zaytoonz-nlweb --tail 100
```

**Common issues to look for:**
- ❌ Directory not found: `code/python` doesn't exist in `/app/NLWeb-main`
- ❌ Missing requirements.txt: File not found at `code/python/requirements.txt`
- ❌ Python import errors: Missing Python packages
- ❌ File not found: `app-file.py` doesn't exist
- ❌ Port conflicts: Port 8000 might be in use

---

## Step 2: Common Fixes

### Fix 1: Next.js - File Verification Failing

**Problem**: The grep commands are failing because files don't exist or don't contain expected strings.

**Solution**: Make the verification optional or fix the file paths:

```yaml
command:
  - sh
  - -c
  - |
    rm -rf .next
    # Make verification optional - don't exit if files don't exist
    grep -q "ZaytoonzSMLanding" app/page.tsx 2>/dev/null || echo "Warning: ZaytoonzSMLanding not found"
    grep -q "LandingPage" app/app/page.tsx 2>/dev/null || echo "Warning: LandingPage not found"
    npm install --production
    npm run build
    npm start
```

### Fix 2: Next.js - Build Failing

**Problem**: Build process crashes due to missing dependencies or errors.

**Solution**: Check if `package.json` exists and has all dependencies:

```bash
# Check if package.json exists
docker exec zaytoonz-nextjs ls -la /app/package.json

# Check build errors
docker logs zaytoonz-nextjs | grep -i error
```

**Quick fix**: Install all dependencies (not just production):

```yaml
command:
  - sh
  - -c
  - |
    rm -rf .next
    npm install  # Changed from npm install --production
    npm run build
    npm start
```

### Fix 3: NLWeb - Directory Structure Issue

**Problem**: The path `code/python` doesn't exist in the container.

**Solution**: Verify the directory structure:

```bash
# Check what's actually in NLWeb-main
docker exec zaytoonz-nlweb ls -la /app/NLWeb-main
```

**Possible fixes**:

1. **If structure is different**, update the command:
```yaml
command: sh -c "cd /app/NLWeb-main && find . -name 'requirements.txt' -type f"
# Then adjust based on actual structure
```

2. **If requirements.txt is in root**:
```yaml
command: sh -c "cd /app/NLWeb-main && pip install --no-cache-dir -r requirements.txt && python app-file.py"
```

3. **If app-file.py is in different location**:
```yaml
command: sh -c "cd /app/NLWeb-main && pip install --no-cache-dir -r requirements.txt && find . -name 'app-file.py' -exec python {} \;"
```

### Fix 4: Missing Environment Variables

**Problem**: Required environment variables are not set.

**Solution**: Verify all environment variables are set in Hostinger's interface:

```bash
# Check environment variables in container
docker exec zaytoonz-nextjs env | grep -E "SUPABASE|OPENAI|NEXT_PUBLIC"
docker exec zaytoonz-nlweb env | grep -E "OPENAI|NLWEB|PYTHON"
```

---

## Step 3: Quick Diagnostic Commands

Run these commands to quickly identify the issue:

### Check if containers can start at all:

```bash
# Stop the restarting containers
docker stop zaytoonz-nextjs zaytoonz-nlweb

# Try to start them manually to see immediate errors
docker start zaytoonz-nextjs
docker logs zaytoonz-nextjs --tail 50

docker start zaytoonz-nlweb
docker logs zaytoonz-nlweb --tail 50
```

### Check file structure:

```bash
# Check Next.js files
docker exec zaytoonz-nextjs ls -la /app/
docker exec zaytoonz-nextjs ls -la /app/app/ 2>/dev/null || echo "app directory doesn't exist"

# Check NLWeb files
docker exec zaytoonz-nlweb ls -la /app/NLWeb-main/
docker exec zaytoonz-nlweb find /app/NLWeb-main -name "requirements.txt" -o -name "app-file.py"
```

### Check if ports are available:

```bash
# Check if ports are in use
netstat -tuln | grep -E "3000|8000|8002"
# Or on Hostinger, check the port mappings in the dashboard
```

---

## Step 4: Temporary Fix - Remove Strict Verification

If you need to get services running quickly, temporarily remove the strict file verification:

### Updated Next.js Command (More Forgiving):

```yaml
command:
  - sh
  - -c
  - |
    rm -rf .next
    npm install || npm install --production
    npm run build || (echo "Build failed, continuing anyway" && npm start)
    npm start
```

### Updated NLWeb Command (More Forgiving):

```yaml
command: sh -c "cd /app/NLWeb-main && (find . -name requirements.txt -exec pip install --no-cache-dir -r {} \; || pip install --no-cache-dir -r requirements.txt) && (find . -name app-file.py -exec python {} \; || python app-file.py || python main.py)"
```

---

## Step 5: Monitor Logs in Real-Time

Watch the logs as containers restart to see the exact error:

```bash
# Watch Next.js logs
docker logs -f zaytoonz-nextjs

# Watch NLWeb logs (in another terminal)
docker logs -f zaytoonz-nlweb
```

Press `Ctrl+C` to stop watching.

---

## Step 6: Check Hostinger-Specific Issues

Since you're using Hostinger's Docker Compose:

1. **Verify file uploads**: Make sure all files are uploaded to Hostinger's file manager
2. **Check file paths**: Hostinger might use different paths (`/docker/zaytoonz-ngo/` instead of `./`)
3. **Environment variables**: Double-check all variables are set in Hostinger's environment section
4. **Volume mounts**: Verify that volume mounts are working correctly

---

## Most Likely Issues Based on Configuration

### For zaytoonz-nextjs:
1. **File verification failing** (lines 11-12 in docker-compose) - files don't exist or paths are wrong
2. **Build failing** - missing dependencies or TypeScript errors
3. **npm start crashing** - port conflict or missing build output

### For zaytoonz-nlweb:
1. **Directory not found** - `code/python` doesn't exist in the mounted volume
2. **requirements.txt missing** - file not found at expected path
3. **app-file.py not found** - file doesn't exist or is in different location

---

## Next Steps

1. **Check the logs** using the commands above
2. **Share the error messages** from the logs
3. **Verify file structure** matches what's expected
4. **Update the docker-compose.yml** based on actual file locations
5. **Test again** after making changes

Would you like me to help you check the logs or create a more forgiving version of the docker-compose file?
