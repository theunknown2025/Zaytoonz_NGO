# Fix Hostinger Deployment - Step by Step

## Problem
Hostinger is still using the OLD docker-compose configuration, not the updated one from GitHub.

## Solution: Update Hostinger's Docker Compose YAML

### Step 1: Get the Updated YAML
On your server, run:
```bash
cat /opt/zaytoonz-ngo/docker-compose-hostinger.yml
```

Copy the ENTIRE output.

### Step 2: Update Hostinger's Docker Compose Interface

1. **Go to Hostinger's Docker Manager**
2. **Click on "zaytoonz-ngo" project**
3. **Click "Manage" or find the "YAML Editor" / "Compose Editor"**
4. **Delete ALL existing content**
5. **Paste the ENTIRE content from Step 1**
6. **Save/Redeploy**

### Step 3: Verify the Update

After updating, check if nginx config is correct:
```bash
docker exec zaytoonz-nginx cat /etc/nginx/nginx.conf | head -5
```

You should see `set $backend` variables, NOT `upstream` blocks.

### Step 4: Restart Containers

```bash
cd /opt/zaytoonz-ngo
docker-compose -f docker-compose-hostinger.yml restart nginx nextjs
```

### Step 5: Check Logs

```bash
docker logs zaytoonz-nginx --tail 20
docker logs zaytoonz-nextjs --tail 20
```

## Alternative: If Hostinger Uses File-Based Deployment

If Hostinger reads from the file directly, you might need to:

1. **Stop all containers:**
```bash
cd /opt/zaytoonz-ngo
docker-compose -f docker-compose-hostinger.yml down
```

2. **Ensure the file is correct:**
```bash
cat docker-compose-hostinger.yml | grep -A 3 "set \$backend"
```

Should show: `set $backend nextjs:3000`

3. **Restart:**
```bash
docker-compose -f docker-compose-hostinger.yml up -d
```

## What Should Be Different

### OLD (Wrong) - Has upstream blocks:
```
upstream nextjs_backend{server nextjs:3000;}
proxy_pass http://nextjs_backend;
```

### NEW (Correct) - Uses variables:
```
set $backend nextjs:3000;
proxy_pass http://$backend;
```

## Quick Check Commands

```bash
# Check if nginx config has variables (correct)
docker exec zaytoonz-nginx cat /etc/nginx/nginx.conf | grep "set \$backend"

# Check if nginx config has upstream blocks (wrong)
docker exec zaytoonz-nginx cat /etc/nginx/nginx.conf | grep "upstream"

# Check Next.js file paths
docker exec zaytoonz-nextjs ls -la /app/page.tsx
docker exec zaytoonz-nextjs ls -la /app/app/page.tsx
```
