# Deployment Scripts

This directory contains modular deployment scripts for hosting the Zaytoonz NGO application on Hostinger VPS.

## Structure

Each script handles a specific deployment step:

1. **01-check-prerequisites.sh** - Verifies required software is installed
2. **02-setup-repository.sh** - Clones/updates the repository
3. **03-install-dependencies.sh** - Installs npm dependencies
4. **04-configure-environment.sh** - Sets up environment variables
5. **05-build-application.sh** - Builds the Next.js application
6. **06-setup-pm2.sh** - Configures and starts PM2
7. **07-configure-nginx.sh** - Sets up Nginx reverse proxy
8. **08-setup-ssl.sh** - Installs SSL certificate (optional)
9. **09-verify-deployment.sh** - Verifies deployment is working
10. **deploy.sh** - Main orchestrator script that runs all steps

## Quick Start

### Run Complete Deployment

```bash
# Make scripts executable
chmod +x Deployment/*.sh

# Run complete deployment
cd Deployment
bash deploy.sh
```

### Run Individual Steps

```bash
# Run a specific step
bash Deployment/01-check-prerequisites.sh
bash Deployment/02-setup-repository.sh
# ... etc
```

## Configuration

You can configure the deployment using environment variables:

```bash
export REPO_URL="https://github.com/your-username/Zaytoonz_NGO.git"
export APP_DIR="/var/www/zaytoonz-ngo"
export DOMAIN="zaytoonz.com"
export COMING_SOON_PATH="/var/www/zaytoonz"
export PORT="3001"
export BASE_PATH="/beta"
export SKIP_SSL="false"  # Set to "true" to skip SSL setup

# Then run
bash Deployment/deploy.sh
```

## Important: Separate Repositories

**The landing page and web app are in separate repositories:**

- **Landing Page**: Located at `/var/www/zaytoonz` (or `$COMING_SOON_PATH`)
  - This is a **separate git repository** 
  - **NOT modified** by these deployment scripts
  - Only read by nginx configuration to serve static files
  
- **Web App**: Located at `/var/www/zaytoonz-ngo` (or `$APP_DIR`)
  - This is the `Zaytoonz_NGO` repository
  - **WILL be cloned/updated** by deployment scripts
  - Served at `https://zaytoonz.com/beta`

The deployment scripts **only** modify the web app directory. Your landing page repository remains untouched.

## Prerequisites

Before running the deployment, ensure you have:

- SSH access to your VPS
- Root or sudo access
- Domain pointing to your VPS IP
- Web app code pushed to GitHub (Zaytoonz_NGO repository)
- Landing page already deployed in its own directory (separate repository)

## Step Details

### Step 1: Check Prerequisites
Verifies installation of:
- Node.js (v18+)
- npm
- PM2
- Nginx
- Git

### Step 2: Setup Repository
- Clones repository if it doesn't exist
- Updates repository if it exists
- Verifies critical files are present

### Step 3: Install Dependencies
- Installs npm packages
- Uses production mode by default

### Step 4: Configure Environment
- Creates `.env.local` file in the **web app directory only**
- Sets up `NEXT_PUBLIC_BASE_PATH=/beta`
- **Important**: You must edit `.env.local` with your actual values
- **Note**: Landing page directory is NOT modified

### Step 5: Build Application
- Clears previous build cache
- Builds Next.js app with basePath
- Verifies build success

### Step 6: Setup PM2
- Stops existing instance
- Starts app with PM2
- Configures auto-restart
- Sets up startup script

### Step 7: Configure Nginx
- Creates Nginx configuration
- Sets up reverse proxy for `/beta` (web app)
- Configures root path to serve landing page from `$COMING_SOON_PATH`
- **Note**: Only reads from landing page directory, does NOT modify it
- Reloads Nginx

### Step 8: Setup SSL (Optional)
- Installs Certbot
- Obtains SSL certificate
- Configures auto-renewal
- Set `SKIP_SSL=true` to skip

### Step 9: Verify Deployment
- Checks PM2 status
- Checks Nginx status
- Tests local application
- Tests domain (if accessible)

## Troubleshooting

### Build Fails
```bash
# Check logs
bash Deployment/05-build-application.sh

# Verify files exist
ls -la app/lib/auth.ts
ls -la app/components/UploadButton.tsx
```

### PM2 Not Starting
```bash
# Check PM2 logs
pm2 logs zaytoonz-test

# Restart manually
pm2 restart zaytoonz-test
```

### Nginx 502 Error
```bash
# Check Nginx config
nginx -t

# Check if app is running
pm2 status

# View Nginx logs
tail -f /var/log/nginx/error.log
```

### Module Not Found Errors
```bash
# Pull latest code
cd /var/www/zaytoonz-ngo
git pull origin main

# Clear cache and rebuild
rm -rf .next node_modules/.cache
bash Deployment/05-build-application.sh
```

## Manual Steps

After running the deployment scripts, you may need to:

1. **Edit Environment Variables**
   ```bash
   nano /var/www/zaytoonz-ngo/.env.local
   # Add your Supabase keys, API keys, etc.
   pm2 restart zaytoonz-test
   ```

2. **Enable PM2 Startup** (if not done automatically)
   ```bash
   pm2 startup
   # Run the command it outputs
   ```

3. **Update Coming Soon Path** (if different)
   ```bash
   # Edit Nginx config
   nano /etc/nginx/sites-available/zaytoonz.com
   # Update the COMING_SOON_PATH variable
   nginx -t && systemctl reload nginx
   ```

## Updating Application

To update after pushing changes to GitHub:

```bash
cd /var/www/zaytoonz-ngo
git pull origin main
bash Deployment/03-install-dependencies.sh
bash Deployment/05-build-application.sh
pm2 restart zaytoonz-test
```

Or use the update script:
```bash
bash hostinger-update.sh
```

## Files Created

- `/var/www/zaytoonz-ngo` - Application directory
- `/var/www/zaytoonz-ngo/.env.local` - Environment variables
- `/etc/nginx/sites-available/zaytoonz.com` - Nginx config
- `/var/log/pm2/` - PM2 logs

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs zaytoonz-test`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify files exist: `bash Deployment/verify-files-on-vps.sh`
4. Test locally: `curl http://localhost:3001/beta`

