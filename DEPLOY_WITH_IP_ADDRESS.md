# Deploy Using IP Address Instead of Domain

This guide shows how to configure your deployment to use the VPS IP address (72.62.176.80) instead of a domain name.

## Quick Setup

### Option 1: Use Environment Variable (Recommended)

When running deployment scripts, set the IP address:

```bash
export VPS_IP="72.62.176.80"
export DOMAIN="72.62.176.80"
bash Deployment/deploy.sh
```

### Option 2: Manual Configuration

Follow the steps below to manually configure everything.

---

## Step-by-Step Configuration

### Step 1: Update Environment Variables

On your VPS, edit `.env.local`:

```bash
cd /var/www/zaytoonz-ngo
nano .env.local
```

Update these values:

```env
NEXT_PUBLIC_BASE_PATH=/test
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM
NODE_ENV=production
PORT=3001
HOSTNAME=localhost

# Update NEXTAUTH_URL to use IP
NEXTAUTH_URL=http://72.62.176.80/test

# Other variables...
```

### Step 2: Configure Nginx for IP Address

```bash
# Create Nginx config for IP
nano /etc/nginx/sites-available/zaytoonz-ip
```

Paste this configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 72.62.176.80 _;

    client_max_body_size 100M;

    # Root - Serve "Coming Soon" page (static files)
    location = / {
        root /var/www/zaytoonz;
        index index.html;
        try_files $uri /index.html;
    }

    # Serve other static files from Coming Soon directory (except /test)
    location ~ ^/(?!test)(.*)$ {
        root /var/www/zaytoonz;
        try_files $uri =404;
    }

    # /test - Next.js application
    location /test {
        proxy_pass http://localhost:3001/test;
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
        proxy_set_header X-Forwarded-Prefix /test;
    }

    # Handle Next.js static files
    location /test/_next/static/ {
        proxy_pass http://localhost:3001/test/_next/static/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Handle Next.js API routes
    location /test/api/ {
        proxy_pass http://localhost:3001/test/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable the site:

```bash
# Enable site
ln -sf /etc/nginx/sites-available/zaytoonz-ip /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/zaytoonz.com 2>/dev/null || true

# Test and reload
nginx -t
systemctl reload nginx
```

### Step 3: Update PM2 Configuration (if needed)

If you're using `ecosystem.test.config.js`, update the NEXTAUTH_URL:

```bash
nano ecosystem.test.config.js
```

Make sure it has:
```javascript
NEXTAUTH_URL: 'http://72.62.176.80/test',
```

### Step 4: Rebuild and Restart

```bash
cd /var/www/zaytoonz-ngo

# Update .env.local with IP
export NEXT_PUBLIC_BASE_PATH=/test
npm run build

# Restart PM2
pm2 restart zaytoonz-test
```

---

## Access Your Application

After configuration:

- **Coming Soon Page**: `http://72.62.176.80`
- **Your App**: `http://72.62.176.80/test`

---

## Important Notes

### SSL/HTTPS
- ❌ **Cannot use SSL with IP addresses** - Certbot requires a domain name
- ✅ Use HTTP only: `http://72.62.176.80`
- ⚠️ For production, consider using a domain name for SSL

### Firewall
Make sure port 80 is open:

```bash
# Check firewall
ufw status

# If needed, allow HTTP
ufw allow 80/tcp
```

### Security Considerations
- IP addresses are less secure than domains
- No SSL/HTTPS available
- Consider using a domain name for production

---

## Quick One-Liner Setup

Run this on your VPS to set everything up:

```bash
cd /var/www/zaytoonz-ngo && \
VPS_IP="72.62.176.80" && \
# Update .env.local
cat > .env.local << EOF
NEXT_PUBLIC_BASE_PATH=/test
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM
NODE_ENV=production
PORT=3001
HOSTNAME=localhost
NEXTAUTH_URL=http://$VPS_IP/test
EOF
# Configure Nginx
cat > /etc/nginx/sites-available/zaytoonz-ip << NGINX_EOF
server {
    listen 80;
    server_name $VPS_IP _;
    client_max_body_size 100M;
    location = / {
        root /var/www/zaytoonz;
        index index.html;
        try_files \$uri /index.html;
    }
    location ~ ^/(?!test)(.*)\$ {
        root /var/www/zaytoonz;
        try_files \$uri =404;
    }
    location /test {
        proxy_pass http://localhost:3001/test;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_set_header X-Forwarded-Prefix /test;
    }
    location /test/_next/static/ {
        proxy_pass http://localhost:3001/test/_next/static/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location /test/api/ {
        proxy_pass http://localhost:3001/test/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_EOF
ln -sf /etc/nginx/sites-available/zaytoonz-ip /etc/nginx/sites-enabled/ && \
rm -f /etc/nginx/sites-enabled/default && \
nginx -t && systemctl reload nginx && \
export NEXT_PUBLIC_BASE_PATH=/test && \
npm run build && \
pm2 restart zaytoonz-test && \
echo "✅ Setup complete! Access at: http://$VPS_IP/test"
```

---

**Last Updated**: 2025-01-15

