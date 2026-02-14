# Fixing 404 Errors for /app Subdirectory Deployment

## Problem
The app is deployed at `zaytoonz.com/app`, but routes like `/auth/signin` are returning 404 errors because:
1. Next.js `basePath` is not configured
2. Nginx may not be properly configured to handle `/app` subdirectory

## Solution

### Step 1: Set Environment Variable on Server

SSH into your server and set the `NEXT_PUBLIC_BASE_PATH` environment variable:

```bash
cd /var/www/apps/zaytoonz-app

# Add to your .env.local or .env file
echo "NEXT_PUBLIC_BASE_PATH=/app" >> .env.local

# Or export it before building
export NEXT_PUBLIC_BASE_PATH=/app
```

### Step 2: Rebuild the Application

```bash
# Make sure you're in the app directory
cd /var/www/apps/zaytoonz-app

# Pull latest changes (resolve conflicts first)
git checkout -- app/page.tsx  # Discard local changes
git pull origin main

# Install dependencies if needed
npm install

# Build with basePath
export NEXT_PUBLIC_BASE_PATH=/app
npm run build
```

### Step 3: Update Nginx Configuration

Update your nginx configuration to properly handle `/app`:

```bash
sudo nano /etc/nginx/sites-available/zaytoonz-ngo
```

Use the configuration from `nginx-app-subdirectory.conf` or update your existing config:

```nginx
server {
    listen 80;
    server_name zaytoonz.com www.zaytoonz.com;

    # /app - Next.js application
    location /app {
        rewrite ^/app/?(.*)$ /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Prefix /app;
    }

    # Handle static files
    location /app/_next/static/ {
        rewrite ^/app/_next/static/(.*)$ /_next/static/$1 break;
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Root redirect
    location = / {
        return 301 /app;
    }
}
```

### Step 4: Restart Services

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart your Next.js app (PM2 or your process manager)
pm2 restart zaytoonz-app
# or
npm run start
```

### Step 5: Verify

After deployment, test these URLs:
- ✅ `zaytoonz.com/app` - Should show landing page
- ✅ `zaytoonz.com/app/auth/signin` - Should show sign in page
- ✅ `zaytoonz.com/app/auth/signup` - Should show sign up page
- ✅ `zaytoonz.com/app/seeker` - Should show seeker dashboard
- ✅ `zaytoonz.com/app/ngo` - Should show NGO dashboard

## Alternative: Deploy at Root

If you prefer to deploy at the root (`zaytoonz.com` instead of `zaytoonz.com/app`):

1. Remove `NEXT_PUBLIC_BASE_PATH` or set it to empty string
2. Update nginx to proxy root `/` to Next.js
3. Rebuild and redeploy

## Quick Fix Commands

```bash
# On your server
cd /var/www/apps/zaytoonz-app
git checkout -- app/page.tsx
git pull origin main
echo "NEXT_PUBLIC_BASE_PATH=/app" >> .env.local
export NEXT_PUBLIC_BASE_PATH=/app
npm run build
pm2 restart zaytoonz-app
```
