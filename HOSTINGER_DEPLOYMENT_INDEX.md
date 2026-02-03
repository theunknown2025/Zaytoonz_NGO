# 📚 Hostinger Deployment Documentation Index

This directory contains all the documentation and scripts needed to deploy your complete Zaytoonz NGO application to Hostinger VPS.

## 📖 Documentation Files

### 1. **COMPLETE_HOSTINGER_DEPLOYMENT_GUIDE.md** ⭐ START HERE
   - **Purpose:** Comprehensive step-by-step deployment guide
   - **Use:** Follow this for your first deployment
   - **Covers:**
     - ✅ Frontend (Next.js)
     - ✅ Backend (Next.js API routes)
     - ✅ Python Scraper (Port 8000)
     - ✅ Morchid AI Service (Port 8001)
   - **Length:** Detailed guide with troubleshooting

### 2. **HOSTINGER_QUICK_START.md** 🚀 QUICK REFERENCE
   - **Purpose:** Quick reference and checklist
   - **Use:** Keep this handy for quick commands
   - **Contents:**
     - Quick deployment checklist
     - Common commands
     - Service ports
     - Important paths

### 3. **HOSTINGER_DEPLOYMENT_INDEX.md** 📋 THIS FILE
   - **Purpose:** Navigation guide for all deployment resources
   - **Use:** Find the right document for your needs

## 🔧 Automation Scripts

### 1. **hostinger-complete-setup.sh** 🤖 AUTOMATED SETUP
   - **Purpose:** Automated initial server setup
   - **Use:** Run this on your VPS to automate installation
   - **What it does:**
     - Installs Node.js, Python, PM2, Nginx, Git
     - Clones your repository
     - Creates environment file templates
     - Sets up Python virtual environments
     - Installs dependencies
     - Builds the application
     - Configures PM2
     - Sets up Nginx
   - **Usage:**
     ```bash
     # Upload to VPS
     scp hostinger-complete-setup.sh root@your-vps-ip:/tmp/
     
     # SSH and run
     ssh root@your-vps-ip
     chmod +x /tmp/hostinger-complete-setup.sh
     bash /tmp/hostinger-complete-setup.sh
     ```

## 🎯 Quick Start Options

### Option 1: Automated Setup (Recommended for First Time)
1. Upload `hostinger-complete-setup.sh` to your VPS
2. Run the script: `bash hostinger-complete-setup.sh`
3. Edit environment files with your API keys
4. Restart services: `pm2 restart all`
5. Install SSL: `certbot --nginx -d zaytoonz.com -d www.zaytoonz.com`

### Option 2: Manual Setup (Recommended for Learning)
1. Read `COMPLETE_HOSTINGER_DEPLOYMENT_GUIDE.md`
2. Follow each step manually
3. Use `HOSTINGER_QUICK_START.md` for quick reference

## 📋 Deployment Checklist

### Before Starting:
- [ ] Have SSH access to Hostinger VPS
- [ ] Know your VPS IP address
- [ ] Have root/sudo access
- [ ] Code pushed to GitHub
- [ ] Domain `zaytoonz.com` pointing to VPS IP
- [ ] All API keys ready (Supabase, OpenAI, etc.)

### Services to Deploy:
- [ ] **Frontend**: Next.js application (Port 3001)
- [ ] **Backend**: Next.js API routes (integrated)
- [ ] **Python Scraper**: FastAPI service (Port 8000)
- [ ] **Morchid AI Service**: FastAPI service (Port 8001)

### After Deployment:
- [ ] All services running in PM2
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] App accessible at `https://zaytoonz.com/test`
- [ ] All services responding correctly

## 🗂️ Project Structure on VPS

```
/var/www/
├── zaytoonz/              # Your "Coming Soon" page
│   └── index.html
│
└── zaytoonz-ngo/          # Your Next.js app
    ├── .env.local         # Next.js environment variables
    ├── .next/             # Build output
    ├── node_modules/      # Dependencies
    ├── python_scraper/   # Python scraper service
    │   ├── .env          # Scraper environment variables
    │   ├── venv/         # Python virtual environment
    │   └── api_wrapper.py
    ├── morchid-ai-service/ # Morchid AI service
    │   ├── .env          # AI service environment variables
    │   ├── venv/         # Python virtual environment
    │   └── enhanced_app.py
    ├── ecosystem.production.config.js
    └── server.js
```

## 🌐 Service Architecture

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
   │                   ├─→ Next.js API Routes (Backend)
   │                   │
   │                   ├─→ localhost:8000 (Python Scraper)
   │                   │
   │                   └─→ localhost:8001 (Morchid AI Service)
```

## 🔑 Environment Variables Required

### Next.js (.env.local)
- `NEXT_PUBLIC_BASE_PATH=/test`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_OPENAI_API_KEY`
- `NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000`
- `NLWEB_URL=http://localhost:8001`

### Python Scraper (python_scraper/.env)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

### Morchid AI Service (morchid-ai-service/.env)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`
- `SERVICE_PORT=8001`
- `OPENAI_API_KEY`

## 📞 Support & Troubleshooting

### Common Issues:
1. **502 Bad Gateway**
   - Check if all services are running: `pm2 status`
   - Check Nginx logs: `tail -f /var/log/nginx/error.log`

2. **Python Services Not Starting**
   - Check Python virtual environments are created
   - Verify dependencies installed: `source venv/bin/activate && pip list`
   - Check PM2 logs: `pm2 logs python-scraper` or `pm2 logs morchid-ai-service`

3. **Port Already in Use**
   - Check ports: `netstat -tulpn | grep -E '3001|8000|8001'`
   - Stop conflicting services

### Get Help:
- Check logs: `pm2 logs`
- Check Nginx: `tail -f /var/log/nginx/error.log`
- Verify config: `nginx -t`
- Test services: `curl http://localhost:PORT`

## 📚 Additional Resources

- **Main Guide**: `COMPLETE_HOSTINGER_DEPLOYMENT_GUIDE.md`
- **Quick Reference**: `HOSTINGER_QUICK_START.md`
- **Setup Script**: `hostinger-complete-setup.sh`

## ✅ Success Indicators

Your deployment is successful when:

1. ✅ `pm2 status` shows all services as `online`:
   - `zaytoonz-test`
   - `python-scraper`
   - `morchid-ai-service`

2. ✅ `systemctl status nginx` shows `active (running)`

3. ✅ `curl http://localhost:3001/test` returns HTML

4. ✅ `curl http://localhost:8000/health` returns OK (if health endpoint exists)

5. ✅ `curl http://localhost:8001/health` returns OK (if health endpoint exists)

6. ✅ `https://zaytoonz.com` shows Coming Soon page

7. ✅ `https://zaytoonz.com/test` shows your app

8. ✅ No errors in browser console

9. ✅ API routes respond correctly

---

## 🎉 Ready to Deploy!

Choose your deployment method:
- **Automated**: Use `hostinger-complete-setup.sh`
- **Manual**: Follow `COMPLETE_HOSTINGER_DEPLOYMENT_GUIDE.md`

Good luck with your deployment! 🚀

---

**Last Updated:** 2025-01-15  
**Project:** Zaytoonz NGO  
**Target:** Complete Full-Stack Deployment on Hostinger VPS

