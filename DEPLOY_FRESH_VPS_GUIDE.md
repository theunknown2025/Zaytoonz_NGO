# 🚀 Deploy to Fresh VPS - Complete Guide

This guide shows how to deploy your application to a completely fresh VPS (reset to 0) using SSH.

## 📋 Prerequisites

- **VPS IP Address**: 72.62.176.80
- **SSH Access**: Root password or SSH key
- **GitHub Repository**: Code must be pushed to GitHub

---

## 🔧 Step-by-Step Deployment

### Step 1: Connect to Your VPS via SSH

**On Windows (PowerShell or Command Prompt):**
```powershell
ssh root@72.62.176.80
```

**On Linux/Mac:**
```bash
ssh root@72.62.176.80
```

Enter your root password when prompted.

---

### Step 2: Install Python 3 (Required for Scraper)

The deployment script installs Node.js, but you need Python 3 for the scraper:

```bash
# Update package list
apt update

# Install Python 3 and pip
apt install -y python3 python3-pip python3-venv

# Verify installation
python3 --version
```

---

### Step 3: Clone the Repository

The deployment script will clone the repo, but you need the deployment scripts first. Choose one method:

#### Option A: Clone Entire Repository (Recommended)

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz-ngo

# Navigate to project
cd zaytoonz-ngo
```

#### Option B: Download Only Deployment Scripts

If you prefer to download just the scripts first:

```bash
# Install git if not already installed
apt install -y git

# Clone repository
cd /tmp
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git temp-repo
cp -r temp-repo/Deployment /root/
rm -rf temp-repo
cd /root/Deployment
```

---

### Step 4: Make Scripts Executable

```bash
# Navigate to project directory (if you cloned it)
cd /var/www/zaytoonz-ngo

# Make all deployment scripts executable
chmod +x Deployment/*.sh

# Verify scripts are executable
ls -la Deployment/*.sh
```

---

### Step 5: Run the Deployment Script

```bash
# Navigate to Deployment directory
cd Deployment

# Run the main deployment script (as root)
bash deploy.sh
```

**OR** if you're in the project root:

```bash
cd /var/www/zaytoonz-ngo
bash Deployment/deploy.sh
```

---

## ⚙️ What the Deployment Script Does

The `deploy.sh` script automatically:

1. **Checks Prerequisites** - Installs Node.js, npm, PM2, Nginx, Git
2. **Clones Repository** - Gets latest code from GitHub
3. **Installs Dependencies** - Node.js packages + Python scraper dependencies
4. **Configures Environment** - Creates `.env.local` file
5. **Builds Application** - Compiles Next.js app
6. **Sets Up PM2** - Starts both Next.js app and Python scraper
7. **Configures Nginx** - Sets up reverse proxy
8. **Verifies Deployment** - Checks if everything is running

---

## 🔑 Important Configuration Steps

### After Deployment Runs, You MUST:

#### 1. Edit Environment Variables

```bash
nano /var/www/zaytoonz-ngo/.env.local
```

**Update these values:**
```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key_here

# OpenAI Configuration (if using)
OPENAI_API_KEY=your_openai_key_here

# NextAuth Configuration (if using)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://72.62.176.80/test
```

**Save and exit** (Ctrl+X, then Y, then Enter)

#### 2. Restart Services

```bash
cd /var/www/zaytoonz-ngo
pm2 restart all
```

---

## 🎯 Quick One-Liner Deployment

If you want to do everything in one go:

```bash
# Connect via SSH first, then run:
apt update && \
apt install -y python3 python3-pip python3-venv git && \
mkdir -p /var/www && \
cd /var/www && \
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz-ngo && \
cd zaytoonz-ngo && \
chmod +x Deployment/*.sh && \
cd Deployment && \
bash deploy.sh
```

---

## ✅ Verify Deployment

After deployment completes:

```bash
# Check PM2 status (should show both services)
pm2 status

# Check Next.js app logs
pm2 logs zaytoonz-test

# Check Python scraper logs
pm2 logs python-scraper

# Test the application locally
curl http://localhost:3001/test

# Check Nginx status
systemctl status nginx
```

---

## 🌐 Access Your Application

Once deployed:
- **Next.js App**: `http://72.62.176.80/test`
- **Python Scraper API**: `http://72.62.176.80:8000` (if exposed)

---

## 🔧 Troubleshooting

### If Script Fails at Prerequisites

```bash
# Manually install prerequisites
apt update
apt install -y nodejs npm nginx git python3 python3-pip python3-venv
npm install -g pm2
```

### If Python Scraper Fails to Start

```bash
# Check if Python venv was created
ls -la /var/www/zaytoonz-ngo/python_scraper/venv

# If not, create it manually
cd /var/www/zaytoonz-ngo/python_scraper
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### If Build Fails

```bash
# Check Node.js version (should be 18+)
node --version

# Clear cache and rebuild
cd /var/www/zaytoonz-ngo
rm -rf .next node_modules/.cache
npm run build
```

### If PM2 Services Don't Start

```bash
# Check logs
pm2 logs

# Restart manually
cd /var/www/zaytoonz-ngo
pm2 start ecosystem.test.config.js
pm2 save
```

---

## 📝 Environment Variables Reference

The deployment script creates a template `.env.local`. You must update:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ Yes |
| `NEXT_PUBLIC_BASE_PATH` | Base path (`/test`) | ✅ Yes |
| `NODE_ENV` | Environment (`production`) | ✅ Yes |
| `PORT` | App port (`3001`) | ✅ Yes |
| `NEXTAUTH_URL` | Full URL with base path | ⚠️ If using auth |
| `OPENAI_API_KEY` | OpenAI API key | ⚠️ If using AI features |
| `NEXT_PUBLIC_USE_EXTERNAL_SCRAPER` | Enable scraper (`true`) | ✅ Yes |
| `NEXT_PUBLIC_EXTERNAL_SCRAPER_URL` | Scraper URL (`http://localhost:8000`) | ✅ Yes |

---

## 🎉 Deployment Complete!

After following these steps, your application should be:
- ✅ Running on port 3001
- ✅ Python scraper running on port 8000
- ✅ Accessible at `http://72.62.176.80/test`
- ✅ Managed by PM2 (auto-restart on crash)
- ✅ Behind Nginx reverse proxy

---

## 🔄 Updating After Deployment

To update your application after making changes:

```bash
cd /var/www/zaytoonz-ngo
git pull origin main
bash Deployment/03-install-dependencies.sh
bash Deployment/05-build-application.sh
pm2 restart all
```

---

## 📞 Need Help?

- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Check system logs: `journalctl -u nginx`
- Verify services: `pm2 status && systemctl status nginx`

