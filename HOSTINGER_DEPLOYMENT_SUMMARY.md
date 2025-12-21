# 📦 Hostinger Deployment Package Summary

This package contains everything you need to deploy your Next.js application to Hostinger VPS at `zaytoonz.com/test`.

## 📁 Files Created

### 1. **HOSTINGER_DEPLOYMENT_GUIDE.md** ⭐ MAIN GUIDE
   - **Purpose:** Complete step-by-step deployment guide
   - **Use:** Follow this for your first deployment
   - **Contents:**
     - Prerequisites
     - Server setup (Node.js, PM2, Nginx)
     - Repository cloning
     - Environment configuration
     - Building and deployment
     - Nginx configuration
     - SSL/HTTPS setup
     - Troubleshooting

### 2. **hostinger-setup.sh** 🔧 AUTOMATION SCRIPT
   - **Purpose:** Automated initial server setup
   - **Use:** Run this on your VPS to automate installation
   - **What it does:**
     - Installs Node.js, PM2, Nginx, Git
     - Clones your repository
     - Creates `.env.local` template
     - Installs dependencies
     - Builds the application
     - Configures PM2
     - Sets up Nginx
   - **Usage:**
     ```bash
     # Upload to VPS
     scp hostinger-setup.sh root@your-vps-ip:/tmp/
     
     # SSH and run
     ssh root@your-vps-ip
     chmod +x /tmp/hostinger-setup.sh
     bash /tmp/hostinger-setup.sh
     ```

### 3. **hostinger-update.sh** 🔄 UPDATE SCRIPT
   - **Purpose:** Quick update script for future deployments
   - **Use:** Run this after pushing changes to GitHub
   - **What it does:**
     - Pulls latest code from GitHub
     - Updates dependencies
     - Rebuilds application
     - Restarts PM2
   - **Usage:**
     ```bash
     # Upload to VPS
     scp hostinger-update.sh root@your-vps-ip:/tmp/
     
     # SSH and run
     ssh root@your-vps-ip
     chmod +x /tmp/hostinger-update.sh
     bash /tmp/hostinger-update.sh
     ```

### 4. **HOSTINGER_QUICK_REFERENCE.md** 📝 CHEAT SHEET
   - **Purpose:** Quick reference for common commands
   - **Use:** Keep this handy for daily operations
   - **Contents:**
     - Common PM2 commands
     - Nginx management
     - Troubleshooting commands
     - Important paths
     - Health check commands

---

## 🚀 Quick Start Guide

### For First-Time Deployment:

1. **Read the main guide:**
   ```bash
   # Open HOSTINGER_DEPLOYMENT_GUIDE.md
   ```

2. **Upload setup script to VPS:**
   ```powershell
   # In PowerShell on Windows
   scp hostinger-setup.sh root@your-vps-ip:/tmp/
   ```

3. **SSH into VPS and run setup:**
   ```bash
   ssh root@your-vps-ip
   chmod +x /tmp/hostinger-setup.sh
   bash /tmp/hostinger-setup.sh
   ```

4. **Configure environment variables:**
   ```bash
   nano /var/www/zaytoonz-ngo/.env.local
   # Add your actual Supabase keys, API keys, etc.
   ```

5. **Restart application:**
   ```bash
   pm2 restart zaytoonz-test --update-env
   ```

6. **Install SSL certificate:**
   ```bash
   certbot --nginx -d zaytoonz.com -d www.zaytoonz.com
   ```

7. **Access your app:**
   - Coming Soon: `https://zaytoonz.com`
   - Your App: `https://zaytoonz.com/test`

### For Updates (After Git Push):

1. **Upload update script:**
   ```powershell
   scp hostinger-update.sh root@your-vps-ip:/tmp/
   ```

2. **SSH and run:**
   ```bash
   ssh root@your-vps-ip
   chmod +x /tmp/hostinger-update.sh
   bash /tmp/hostinger-update.sh
   ```

---

## 📋 Deployment Checklist

### Before Starting:
- [ ] Have SSH access to Hostinger VPS
- [ ] Know your VPS IP address
- [ ] Have root/sudo access
- [ ] Code pushed to GitHub
- [ ] Domain `zaytoonz.com` pointing to VPS IP
- [ ] Know path to "Coming Soon" page (`/var/www/zaytoonz`)

### During Setup:
- [ ] Node.js installed (v18+)
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Repository cloned
- [ ] Environment variables configured
- [ ] Application built
- [ ] PM2 running
- [ ] Nginx configured
- [ ] SSL certificate installed

### After Deployment:
- [ ] Coming Soon page accessible at `zaytoonz.com`
- [ ] App accessible at `zaytoonz.com/test`
- [ ] API routes working
- [ ] Static assets loading
- [ ] No console errors

---

## 🗂️ Project Structure on VPS

```
/var/www/
├── zaytoonz/              # Your "Coming Soon" page
│   └── index.html
│
└── zaytoonz-ngo/          # Your Next.js app
    ├── .env.local         # Environment variables
    ├── .next/             # Build output
    ├── node_modules/      # Dependencies
    ├── ecosystem.test.config.js
    ├── server.js
    └── ... (other files)
```

---

## 🔧 Configuration Files

### 1. Environment Variables (`.env.local`)
Location: `/var/www/zaytoonz-ngo/.env.local`

Required variables:
- `NEXT_PUBLIC_BASE_PATH=/test`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NODE_ENV=production`
- `PORT=3001`

### 2. Nginx Configuration
Location: `/etc/nginx/sites-available/zaytoonz`

Key points:
- Root serves "Coming Soon" page
- `/test` proxies to `localhost:3001/test`
- Handles static files and API routes

### 3. PM2 Configuration
Location: `/var/www/zaytoonz-ngo/ecosystem.test.config.js`

Runs on:
- Port: `3001`
- Name: `zaytoonz-test`
- Base Path: `/test`

---

## 🌐 Network Architecture

```
Internet
   │
   ├─→ zaytoonz.com (Port 80/443)
   │   │
   │   ├─→ Nginx
   │       │
   │       ├─→ / → /var/www/zaytoonz (Coming Soon)
   │       │
   │       └─→ /test → localhost:3001/test (Next.js App)
   │                   │
   │                   └─→ PM2 (zaytoonz-test)
```

---

## 📞 Support & Troubleshooting

### Common Issues:

1. **502 Bad Gateway**
   - Check if PM2 is running: `pm2 status`
   - Check Nginx logs: `tail -f /var/log/nginx/error.log`
   - Verify port 3001: `netstat -tulpn | grep 3001`

2. **404 on Routes**
   - Verify `NEXT_PUBLIC_BASE_PATH=/test` in `.env.local`
   - Restart PM2: `pm2 restart zaytoonz-test --update-env`

3. **Static Assets Not Loading**
   - Check browser console for errors
   - Verify Nginx handles `/_next/static/` correctly
   - Rebuild: `npm run build`

### Get Help:
- Check logs: `pm2 logs zaytoonz-test`
- Check Nginx: `tail -f /var/log/nginx/error.log`
- Verify config: `nginx -t`
- Test locally: `curl http://localhost:3001/test`

---

## 📚 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `HOSTINGER_DEPLOYMENT_GUIDE.md` | Complete setup guide | First deployment |
| `hostinger-setup.sh` | Automated setup | Initial server setup |
| `hostinger-update.sh` | Quick update | After Git push |
| `HOSTINGER_QUICK_REFERENCE.md` | Command reference | Daily operations |
| `HOSTINGER_DEPLOYMENT_SUMMARY.md` | This file | Overview |

---

## ✅ Success Indicators

Your deployment is successful when:

1. ✅ `pm2 status` shows `zaytoonz-test` as `online`
2. ✅ `systemctl status nginx` shows `active (running)`
3. ✅ `curl http://localhost:3001/test` returns HTML
4. ✅ `https://zaytoonz.com` shows Coming Soon page
5. ✅ `https://zaytoonz.com/test` shows your app
6. ✅ No errors in browser console
7. ✅ API routes respond correctly

---

## 🎉 You're Ready!

Follow the **HOSTINGER_DEPLOYMENT_GUIDE.md** for detailed step-by-step instructions.

Good luck with your deployment! 🚀

---

**Last Updated:** 2025-01-15  
**Project:** Zaytoonz NGO  
**Target:** zaytoonz.com/test

