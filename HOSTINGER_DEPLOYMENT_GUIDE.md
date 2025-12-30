# 🚀 Complete Hostinger Deployment Guide
## Deploy Next.js App to zaytoonz.com/test

This guide will help you deploy your Next.js application to Hostinger VPS, making it accessible at `zaytoonz.com/test` while keeping your "Coming Soon" page at the root.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ SSH access to your Hostinger VPS
- ✅ Root or sudo access on the server
- ✅ Your code pushed to GitHub
- ✅ Domain `zaytoonz.com` pointing to your VPS IP
- ✅ Basic knowledge of Linux commands

---

## 🔧 Step 1: Connect to Your VPS

### Option A: Using SSH (Windows PowerShell/CMD)
```powershell
ssh root@your-vps-ip
# or
ssh root@zaytoonz.com
```

### Option B: Using PuTTY (Windows)
1. Download and open PuTTY
2. Enter your VPS IP address
3. Port: 22
4. Connection type: SSH
5. Click "Open"
6. Login with username: `root` and your password

---

## 📦 Step 2: Install Required Software

Once connected to your VPS, run these commands:

### 2.1 Update System Packages
```bash
apt update && apt upgrade -y
```

### 2.2 Install Node.js (v18 or v20 recommended)
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.3 Install PM2 (Process Manager)
```bash
npm install -g pm2

# Verify installation
pm2 --version
```

### 2.4 Install Nginx (Web Server)
```bash
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Verify Nginx is running
systemctl status nginx
```

### 2.5 Install Git (if not already installed)
```bash
apt install -y git
```

---

## 📥 Step 3: Clone Your Repository

```bash
# Navigate to web root directory
cd /var/www

# Clone your repository
git clone https://github.com/your-username/Zaytoonz_NGO.git zaytoonz-ngo

# Navigate into the project
cd zaytoonz-ngo

# Verify files are cloned
ls -la
```

**Note:** Replace `your-username` with your actual GitHub username.

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Create Environment File
```bash
cd /var/www/zaytoonz-ngo
nano .env.local
```

### 4.2 Add Your Environment Variables
Copy and paste the following, then update with your actual values:

```env
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/test

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Node Environment
NODE_ENV=production
PORT=3001
HOSTNAME=localhost

# OpenAI Configuration (if using)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://zaytoonz.com/test

# External Scraper Configuration (if using)
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=false
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://locaplhost:8000
```

**To save in nano:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## 📦 Step 5: Install Dependencies and Build

```bash
# Make sure you're in the project directory
cd /var/www/zaytoonz-ngo

# Install dependencies
npm install --production

# Build the Next.js application
export NEXT_PUBLIC_BASE_PATH=/test
npm run build
```

**Note:** The build process may take a few minutes. Be patient!

---

## 🚀 Step 6: Configure PM2

### 6.1 Create PM2 Configuration (Optional - if not using ecosystem file)
```bash
cd /var/www/zaytoonz-ngo
pm2 start ecosystem.test.config.js
```

Or manually start with PM2:
```bash
cd /var/www/zaytoonz-ngo
pm2 start server.js --name zaytoonz-test --update-env \
  --env production \
  -- \
  NODE_ENV=production \
  PORT=3001 \
  NEXT_PUBLIC_BASE_PATH=/test
```

### 6.2 Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

The `pm2 startup` command will output a command. **Copy and run that command** to enable PM2 on system boot.

### 6.3 Verify PM2 Status
```bash
pm2 status
pm2 logs zaytoonz-test
```

You should see your app running. Press `Ctrl+C` to exit logs.

---

## 🌐 Step 7: Configure Nginx

### 7.1 Create Nginx Configuration File
```bash
nano /etc/nginx/sites-available/zaytoonz
```

### 7.2 Add Nginx Configuration
Copy and paste the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name zaytoonz.com www.zaytoonz.com;

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

**Important:** Make sure the path `/var/www/zaytoonz` matches where your "Coming Soon" page is located. If it's different, update it in the configuration.

**To save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 7.3 Enable the Site
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/zaytoonz /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
```

If the test is successful, you'll see:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 7.4 Reload Nginx
```bash
systemctl reload nginx
```

---

## 🔒 Step 8: Configure SSL/HTTPS (Recommended)

### 8.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtain SSL Certificate
```bash
certbot --nginx -d zaytoonz.com -d www.zaytoonz.com
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 8.3 Auto-renewal (Already configured by Certbot)
Certbot automatically sets up auto-renewal. Test it with:
```bash
certbot renew --dry-run
```

---

## ✅ Step 9: Verify Deployment

### 9.1 Check PM2 Status
```bash
pm2 status
```

Should show `zaytoonz-test` as `online`

### 9.2 Check Nginx Status
```bash
systemctl status nginx
```

### 9.3 Test Locally on Server
```bash
curl http://localhost:3001/test
```

### 9.4 Test via Domain
```bash
curl http://zaytoonz.com/test
```

### 9.5 Check Logs
```bash
# PM2 logs
pm2 logs zaytoonz-test

# Nginx error logs
tail -f /var/log/nginx/error.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## 🌐 Step 10: Access Your Application

Open your browser and visit:
- **Coming Soon Page:** `https://zaytoonz.com`
- **Your App:** `https://zaytoonz.com/test`

---

## 🔄 Step 11: Updating Your Application

When you push new changes to GitHub:

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Navigate to project directory
cd /var/www/zaytoonz-ngo

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install --production

# Rebuild the application
export NEXT_PUBLIC_BASE_PATH=/test
npm run build

# Restart PM2
pm2 restart zaytoonz-test

# Check status
pm2 status
```

---

## 🛠️ Troubleshooting

### Issue: App not starting
```bash
# Check PM2 logs
pm2 logs zaytoonz-test --lines 50

# Check if port 3001 is in use
netstat -tulpn | grep 3001

# Restart the app
pm2 restart zaytoonz-test
```

### Issue: 502 Bad Gateway
```bash
# Check if app is running
pm2 status zaytoonz-test

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Verify Nginx config
nginx -t
```

### Issue: 404 errors on routes
- Verify `NEXT_PUBLIC_BASE_PATH=/test` in `.env.local`
- Check that the app is running: `pm2 status zaytoonz-test`
- Verify Nginx is proxying correctly

### Issue: Static assets not loading
- Check browser console for 404 errors
- Verify `basePath` is set correctly in `next.config.js`
- Check Nginx is handling `/_next/static/` correctly

### Issue: Environment variables not working
```bash
# Check environment file
cat /var/www/zaytoonz-ngo/.env.local

# Restart PM2 to reload environment
pm2 restart zaytoonz-test --update-env
```

### Issue: Permission denied errors
```bash
# Fix ownership
chown -R www-data:www-data /var/www/zaytoonz-ngo
chmod -R 755 /var/www/zaytoonz-ngo
```

---

## 📝 Useful Commands Reference

### PM2 Management
```bash
pm2 status                    # Check all services
pm2 logs zaytoonz-test         # View logs
pm2 restart zaytoonz-test      # Restart app
pm2 stop zaytoonz-test         # Stop app
pm2 delete zaytoonz-test       # Delete app
pm2 monit                      # Monitor resources
pm2 save                       # Save current process list
```

### Nginx Management
```bash
nginx -t                      # Test configuration
systemctl reload nginx        # Reload Nginx
systemctl restart nginx        # Restart Nginx
systemctl status nginx        # Check Nginx status
tail -f /var/log/nginx/error.log  # View error logs
```

### Application Management
```bash
cd /var/www/zaytoonz-ngo      # Navigate to app directory
npm run build                 # Rebuild (if needed)
git pull origin main          # Pull latest changes
```

---

## ✅ Deployment Checklist

Before considering deployment complete, verify:

- [ ] Node.js and npm installed
- [ ] PM2 installed and configured
- [ ] Nginx installed and running
- [ ] Repository cloned to `/var/www/zaytoonz-ngo`
- [ ] Environment variables configured in `.env.local`
- [ ] Application built successfully
- [ ] PM2 running `zaytoonz-test` on port 3001
- [ ] Nginx configured and reloaded
- [ ] SSL certificate installed (if using HTTPS)
- [ ] Coming Soon page accessible at `zaytoonz.com`
- [ ] App accessible at `zaytoonz.com/test`
- [ ] API routes working (test `/test/api/...`)
- [ ] Static assets loading correctly

---

## 🎉 Success!

Your application should now be:
- ✅ Running on PM2 (port 3001)
- ✅ Accessible at `https://zaytoonz.com/test`
- ✅ "Coming Soon" page still at `https://zaytoonz.com`
- ✅ Auto-restarting on server reboot
- ✅ SSL/HTTPS enabled (if configured)

---

## 📞 Need Help?

If you encounter issues:
1. Check PM2 logs: `pm2 logs zaytoonz-test`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify environment: `cat /var/www/zaytoonz-ngo/.env.local`
4. Test locally: `curl http://localhost:3001/test`
5. Check PM2 status: `pm2 status`

---

## 🔐 Security Recommendations

1. **Firewall Setup:**
   ```bash
   # Install UFW
   apt install -y ufw
   
   # Allow SSH, HTTP, HTTPS
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   
   # Enable firewall
   ufw enable
   ```

2. **Keep Software Updated:**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Use Strong Passwords** for SSH and database access

4. **Regular Backups** of your application and database

---

**Last Updated:** 2025-01-15
**For:** Zaytoonz NGO Project

