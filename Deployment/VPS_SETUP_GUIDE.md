# VPS Setup Guide - Step by Step

This guide will help you set up the web app on your VPS from scratch.

## Prerequisites

- SSH access to your VPS
- Root or sudo access
- Landing page already deployed at `/var/www/zaytoonz` (or your custom path)

## Step-by-Step Instructions

### Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### Step 2: Create the Web App Directory

```bash
# Create the parent directory if it doesn't exist
sudo mkdir -p /var/www

# Create the web app directory
sudo mkdir -p /var/www/zaytoonz-ngo

# Set proper permissions
sudo chown -R $USER:$USER /var/www/zaytoonz-ngo
# If you're using root, use:
# chown -R root:root /var/www/zaytoonz-ngo
```

### Step 3: Clone the Web App Repository

```bash
# Navigate to the parent directory
cd /var/www

# Clone the repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz-ngo

# Navigate into the directory
cd /var/www/zaytoonz-ngo

# Verify the repository was cloned correctly
ls -la
# You should see: app/, package.json, next.config.js, etc.
```

### Step 4: Make Deployment Scripts Executable

```bash
# Make all deployment scripts executable
chmod +x Deployment/*.sh

# Verify scripts are executable
ls -la Deployment/*.sh
```

### Step 5: Configure Environment Variables (Optional)

You can customize these before running deployment:

```bash
# Set your domain (if using domain instead of IP)
export DOMAIN="zaytoonz.com"

# Set landing page path (if different from default)
export COMING_SOON_PATH="/var/www/zaytoonz"

# Set app port (default is 3001)
export PORT="3001"

# Set base path (should be /beta)
export BASE_PATH="/beta"

# Skip SSL setup if not ready (default: true for IP, false for domain)
export SKIP_SSL="false"  # Set to "true" to skip SSL
```

### Step 6: Run the Deployment Script

```bash
# Make sure you're in the web app directory
cd /var/www/zaytoonz-ngo

# Run the complete deployment
bash Deployment/deploy.sh
```

The script will:
1. Check prerequisites (Node.js, npm, PM2, Nginx, Git)
2. Setup/update the repository
3. Install dependencies
4. Configure environment variables
5. Build the application
6. Setup PM2
7. Configure Nginx
8. Setup SSL (optional)
9. Verify deployment

### Step 7: Edit Environment Variables

After the deployment script runs, you'll need to edit `.env.local` with your actual values:

```bash
# Edit the environment file
nano /var/www/zaytoonz-ngo/.env.local

# Update these values:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL (should be https://zaytoonz.com/beta)
# - Any other API keys you need

# Save and exit (Ctrl+X, then Y, then Enter)
```

### Step 8: Rebuild and Restart After Editing .env.local

```bash
cd /var/www/zaytoonz-ngo

# Rebuild with new environment variables
export NEXT_PUBLIC_BASE_PATH=/beta
rm -rf .next
npm run build

# Restart the application
pm2 restart zaytoonz-test --update-env
```

### Step 9: Verify Everything is Working

```bash
# Check PM2 status
pm2 status

# Check if app is responding locally
curl http://localhost:3001/beta

# Check Nginx status
systemctl status nginx

# Test from browser
# Visit: https://zaytoonz.com/beta
```

## Quick Reference Commands

### Check Application Logs
```bash
pm2 logs zaytoonz-test
```

### Restart Application
```bash
pm2 restart zaytoonz-test
```

### Check Nginx Configuration
```bash
nginx -t
```

### Reload Nginx
```bash
sudo systemctl reload nginx
```

### View Nginx Error Logs
```bash
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### If deployment fails at any step:

1. **Check prerequisites:**
   ```bash
   bash Deployment/01-check-prerequisites.sh
   ```

2. **Diagnose backend issues:**
   ```bash
   bash Deployment/diagnose-backend.sh
   ```

3. **Fix environment file:**
   ```bash
   bash Deployment/fix-env-file.sh
   ```

4. **Check build issues:**
   ```bash
   bash Deployment/diagnose-build-issues.sh
   ```

## Directory Structure After Setup

```
/var/www/
├── zaytoonz/              # Landing page (separate repo - NOT modified)
│   ├── .git/
│   └── index.html
│
└── zaytoonz-ngo/          # Web app (this repository)
    ├── .git/
    ├── app/
    ├── Deployment/
    ├── .env.local
    ├── .next/
    ├── node_modules/
    └── package.json
```

## Next Steps

After successful deployment:
- Your landing page: `https://zaytoonz.com/`
- Your web app: `https://zaytoonz.com/beta`

To update the web app in the future:
```bash
cd /var/www/zaytoonz-ngo
git pull origin main
bash Deployment/deploy.sh
```
