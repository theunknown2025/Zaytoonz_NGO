# Deploying to zaytoonz.com/Test on VPS

This guide shows how to deploy your Next.js app to `/Test` subdirectory while keeping your "Coming Soon" page at the root.

## Architecture

```
zaytoonz.com/              → "Coming Soon" page (static files)
zaytoonz.com/Test           → Next.js application (port 3001)
```

## Step 1: Build the Application with BasePath

On your local machine or VPS:

```bash
# Set base path
export NEXT_PUBLIC_BASE_PATH=/Test

# Build the application
npm run build
```

## Step 2: Configure PM2 to Run on Port 3001

Create or update `ecosystem.test.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'zaytoonz-test',
      script: 'server.js',
      cwd: '/var/www/zaytoonz-ngo',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_BASE_PATH: '/Test',
        NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_key',
      },
      error_file: '/var/log/pm2/zaytoonz-test-error.log',
      out_file: '/var/log/pm2/zaytoonz-test-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    }
  ]
};
```

## Step 3: Update Nginx Configuration

SSH into your VPS and update the Nginx config:

```bash
ssh root@168.231.87.171
nano /etc/nginx/sites-available/zaytoonz-ngo
```

Update the configuration to handle both root and `/Test`:

```nginx
server {
    listen 80;
    server_name zaytoonz.com www.zaytoonz.com;

    client_max_body_size 100M;

    # Root - Serve "Coming Soon" page (static files)
    location / {
        root /var/www/zaytoonz-coming-soon;  # Adjust path to your Coming Soon page
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # /Test - Next.js application
    location /Test {
        # Remove /Test prefix before proxying
        rewrite ^/Test/?(.*) /$1 break;
        
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # Important: Preserve the basePath in the request
        proxy_set_header X-Forwarded-Prefix /Test;
    }

    # Handle Next.js static files with basePath
    location /Test/_next/static/ {
        proxy_pass http://localhost:3001/_next/static/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Python Scraper API (if needed)
    location /scraper-api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 600s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Important**: Make sure the `server.js` file is configured to handle the basePath correctly (it should already be set up).

## Step 4: Start the Application

```bash
# Navigate to your app directory
cd /var/www/zaytoonz-ngo

# Start with PM2 using the test config
pm2 start ecosystem.test.config.js

# Save PM2 configuration
pm2 save
```

## Step 5: Reload Nginx

```bash
# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

## Step 6: Verify Deployment

1. **Check PM2 status**:
   ```bash
   pm2 status
   ```
   You should see `zaytoonz-test` running on port 3001

2. **Test the application**:
   ```bash
   # Test locally on VPS
   curl http://localhost:3001/Test
   
   # Test via Nginx
   curl http://zaytoonz.com/Test
   ```

3. **Check logs**:
   ```bash
   pm2 logs zaytoonz-test
   ```

## Alternative: Simpler Nginx Configuration

If you want a simpler setup, you can use this Nginx config that doesn't rewrite URLs:

```nginx
server {
    listen 80;
    server_name zaytoonz.com www.zaytoonz.com;

    client_max_body_size 100M;

    # Root - Coming Soon page
    location = / {
        root /var/www/zaytoonz-coming-soon;
        index index.html;
    }

    # /Test - Next.js app (preserve /Test in path)
    location /Test {
        proxy_pass http://localhost:3001/Test;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Troubleshooting

### Issue: 404 errors on routes
- Check that `NEXT_PUBLIC_BASE_PATH=/Test` is set in environment variables
- Verify the app is running: `pm2 status`
- Check logs: `pm2 logs zaytoonz-test`

### Issue: Static assets not loading
- Ensure `basePath` is configured in `next.config.js`
- Check browser console for 404 errors
- Verify Nginx is proxying `/_next/static/` correctly

### Issue: API routes return 404
- Check that API routes are accessible: `curl http://localhost:3001/Test/api/opportunities`
- Verify basePath is set correctly

### Issue: Port conflicts
- Check if port 3001 is available: `netstat -tulpn | grep 3001`
- Change port in `ecosystem.test.config.js` if needed

## Quick Deployment Script

Save this as `deploy-test.sh` on your VPS:

```bash
#!/bin/bash
cd /var/www/zaytoonz-ngo

# Set environment
export NEXT_PUBLIC_BASE_PATH=/Test

# Build
echo "Building application..."
npm run build

# Restart PM2
echo "Restarting application..."
pm2 restart zaytoonz-test

# Reload Nginx
echo "Reloading Nginx..."
nginx -t && systemctl reload nginx

echo "Deployment complete! Visit https://zaytoonz.com/Test"
```

Make it executable:
```bash
chmod +x deploy-test.sh
```

Then run:
```bash
./deploy-test.sh
```

