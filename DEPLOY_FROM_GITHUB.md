# 🚀 Deploy to zaytoonz.com/test from GitHub

This guide shows how to deploy your app directly from GitHub to your VPS without using WinSCP.

## ✅ Prerequisites

- VPS with SSH access
- Git installed on VPS
- Node.js and npm installed
- PM2 installed
- Nginx installed

## 📋 Quick Deployment Steps

### Step 1: SSH into Your VPS

```bash
ssh root@168.231.87.171
```

### Step 2: Download and Run the Deployment Script

```bash
# Download the deployment script
cd /tmp
curl -O https://raw.githubusercontent.com/theunknown2025/Zaytoonz_NGO/main/vps-deploy-from-github.sh

# Or if you already have the repo cloned:
cd /var/www/zaytoonz-ngo
git pull origin main

# Make script executable
chmod +x vps-deploy-from-github.sh

# Run the deployment script
bash vps-deploy-from-github.sh
```

### Step 3: Configure Environment Variables (First Time Only)

If this is your first deployment, you'll need to set up environment variables:

```bash
nano /var/www/zaytoonz-ngo/.env.local
```

Update with your actual values:

```env
# Base path for subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/test

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_key

# Environment
NODE_ENV=production
PORT=3001

# Add other environment variables as needed
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`), then run the script again:

```bash
bash vps-deploy-from-github.sh
```

### Step 4: Configure Nginx

The script will prompt you, or you can do it manually:

```bash
# Edit Nginx configuration
nano /etc/nginx/sites-available/zaytoonz-ngo
```

Update the path to your "Coming Soon" page directory (replace `/var/www/zaytoonz-coming-soon` with your actual path).

Then test and reload:

```bash
nginx -t
systemctl reload nginx
```

## 🔄 Updating Your Deployment

To update your app after making changes:

```bash
# SSH into VPS
ssh root@168.231.87.171

# Navigate to app directory
cd /var/www/zaytoonz-ngo

# Pull latest changes
git pull origin main

# Run deployment script
bash vps-deploy-from-github.sh
```

Or create a simple update script:

```bash
# Create update script
cat > /usr/local/bin/zaytoonz-update << 'EOF'
#!/bin/bash
cd /var/www/zaytoonz-ngo
git pull origin main
export NEXT_PUBLIC_BASE_PATH=/test
npm install --production
npm run build
pm2 restart zaytoonz-test
echo "Update complete!"
EOF

chmod +x /usr/local/bin/zaytoonz-update
```

Then just run:
```bash
zaytoonz-update
```

## ✅ Verify Deployment

```bash
# Check PM2 status
pm2 status zaytoonz-test

# View logs
pm2 logs zaytoonz-test

# Test locally
curl http://localhost:3001/test

# Test via domain (after Nginx is configured)
curl http://zaytoonz.com/test
```

## 🌐 Access Your App

Once deployed and Nginx is configured:
- **Main site**: https://zaytoonz.com (Coming Soon page)
- **Your app**: https://zaytoonz.com/test

## 🔧 Troubleshooting

### Git Pull Fails

```bash
# If you have local changes, stash them
cd /var/www/zaytoonz-ngo
git stash
git pull origin main
```

### Build Fails

```bash
# Clear cache and rebuild
cd /var/www/zaytoonz-ngo
rm -rf .next node_modules
npm install
npm run build
```

### PM2 Not Starting

```bash
# Check logs
pm2 logs zaytoonz-test --lines 50

# Check environment variables
cat /var/www/zaytoonz-ngo/.env.local

# Restart manually
cd /var/www/zaytoonz-ngo
pm2 delete zaytoonz-test
pm2 start ecosystem.test.config.js
```

### Nginx 502 Error

```bash
# Check if app is running
pm2 status zaytoonz-test

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test Nginx config
nginx -t
```

## 📝 What the Script Does

1. ✅ Clones/pulls code from GitHub
2. ✅ Installs/updates npm dependencies
3. ✅ Builds Next.js app with `basePath=/test`
4. ✅ Configures PM2 to run on port 3001
5. ✅ Sets up Nginx configuration
6. ✅ Starts the application

## 🎉 You're Done!

Your app is now deployed and accessible at **https://zaytoonz.com/test**

---

**Note**: Make sure your `.env.local` file has the correct Supabase credentials and other environment variables before running the deployment script.

