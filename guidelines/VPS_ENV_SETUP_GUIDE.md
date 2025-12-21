# VPS Environment Setup Guide

This guide will help you configure environment variables on your Hostinger VPS so your deployed application can connect to your self-hosted Supabase instance.

## 🎯 The Problem

- **Locally:** Works fine with `.env.local` pointing to `http://195.35.28.149:8000` ✅
- **On VPS (deployed):** No environment variables → can't connect ❌

## ✅ Solution Overview

You need to configure the `.env.local` file **directly on your VPS server**, not push it to GitHub.

---

## 📋 Method 1: Automated Setup (Recommended)

### Step 1: Upload the Setup Script

From your local machine:

```bash
# Upload the setup script to your VPS
scp setup-vps-env.sh root@195.35.28.149:/root/
```

### Step 2: SSH into Your VPS

```bash
ssh root@195.35.28.149
```

### Step 3: Run the Setup Script

```bash
# Make it executable
chmod +x /root/setup-vps-env.sh

# Run the script
sudo bash /root/setup-vps-env.sh
```

The script will:
- ✅ Create `.env.local` with correct Supabase credentials
- ✅ Set proper permissions
- ✅ Generate NEXTAUTH_SECRET
- ✅ Update NEXTAUTH_URL
- ✅ Install dependencies
- ✅ Build the application
- ✅ Restart with PM2

---

## 📋 Method 2: Manual Setup

### Step 1: SSH into Your VPS

```bash
ssh root@195.35.28.149
```

### Step 2: Navigate to Your Application

```bash
cd /var/www/zaytoonz-ngo
```

### Step 3: Create `.env.local` File

```bash
nano .env.local
```

### Step 4: Add the Following Content

```env
# ================================================================
# Supabase Configuration (Self-hosted on Hostinger VPS)
# ================================================================
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# ================================================================
# OpenAI Configuration for Morchid AI LLM
# ================================================================
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# ================================================================
# External Scraper Configuration
# ================================================================
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# ================================================================
# NextAuth Configuration
# ================================================================
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://195.35.28.149

# ================================================================
# Environment
# ================================================================
NODE_ENV=production
```

**Important Notes:**
- Change `NEXTAUTH_URL` to your domain or VPS IP
- Generate a new `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

### Step 5: Save and Exit

Press `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Set Proper Permissions

```bash
chmod 600 .env.local
chown www-data:www-data .env.local
```

### Step 7: Install Dependencies and Build

```bash
npm install
npm run build
```

### Step 8: Restart the Application

```bash
pm2 restart zaytoonz-ngo
```

---

## 🔍 Verify the Setup

### Check if Environment Variables are Loaded

```bash
cd /var/www/zaytoonz-ngo
node -e "require('dotenv').config({ path: '.env.local' }); console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Check Application Status

```bash
pm2 status
pm2 logs zaytoonz-ngo --lines 50
```

### Test the Connection

Visit your application in a browser:
- **With domain:** `https://yourdomain.com`
- **Without domain:** `http://195.35.28.149`

---

## 🔧 Troubleshooting

### Issue: Application Still Can't Connect to Supabase

**Solution 1:** Check if Supabase is running on VPS

```bash
# SSH into VPS
ssh root@195.35.28.149

# Check if Supabase is running
docker ps | grep supabase
curl http://localhost:8000/rest/v1/
```

**Solution 2:** Verify environment variables are loaded

```bash
cd /var/www/zaytoonz-ngo
cat .env.local
```

**Solution 3:** Check application logs

```bash
pm2 logs zaytoonz-ngo --lines 100
```

### Issue: Build Fails

```bash
# Clear cache and rebuild
cd /var/www/zaytoonz-ngo
rm -rf .next
rm -rf node_modules
npm install
npm run build
pm2 restart zaytoonz-ngo
```

### Issue: Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process if needed
kill -9 <PID>
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local` to GitHub**
   - It's already in `.gitignore`
   - Only configure it on the VPS

2. **Set proper file permissions**
   ```bash
   chmod 600 .env.local
   chown www-data:www-data .env.local
   ```

3. **Rotate secrets regularly**
   - Generate new `NEXTAUTH_SECRET` periodically
   - Update Supabase anon keys if compromised

---

## 📊 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Self-hosted Supabase URL | `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o-mini` |
| `NEXTAUTH_SECRET` | NextAuth secret | Generated with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your application URL | `http://195.35.28.149` |

---

## 🚀 Quick Commands Reference

```bash
# SSH into VPS
ssh root@195.35.28.149

# Navigate to app
cd /var/www/zaytoonz-ngo

# View environment variables
cat .env.local

# Check application status
pm2 status

# View logs
pm2 logs zaytoonz-ngo

# Restart application
pm2 restart zaytoonz-ngo

# Update application
git pull origin main
npm install
npm run build
pm2 restart zaytoonz-ngo
```

---

## ✅ Success Checklist

- [ ] `.env.local` file created on VPS
- [ ] Environment variables configured correctly
- [ ] File permissions set (600)
- [ ] Dependencies installed
- [ ] Application built successfully
- [ ] PM2 restarted
- [ ] Application accessible in browser
- [ ] Can connect to Supabase
- [ ] No errors in logs

---

## 🎉 You're Done!

Your application should now be working correctly with your self-hosted Supabase instance on Hostinger VPS!

**Access your application:**
- http://195.35.28.149 (or your domain)

**Supabase Dashboard:**
- http://195.35.28.149:8000/project/default

---

## 📞 Need Help?

If you encounter issues:
1. Check PM2 logs: `pm2 logs zaytoonz-ngo`
2. Verify environment variables: `cat /var/www/zaytoonz-ngo/.env.local`
3. Check Supabase is running: `curl http://localhost:8000/rest/v1/`
4. Review the troubleshooting section above

