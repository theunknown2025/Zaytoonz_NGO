# VPS Quick Start Guide

Quick reference for using the Supabase Environment Manager on your VPS.

## 🚀 Quick Commands

### On Your VPS Terminal

```bash
# 1. Navigate to project
cd /path/to/Zaytoonz_NGO

# 2. Pull latest changes
git pull origin main

# 3. Check current configuration
node supabase-env-manager.js check

# 4. Test connections
node supabase-env-manager.js test

# 5. Switch to VPS Supabase (if needed)
node supabase-env-manager.js switch

# 6. Restart your application
pm2 restart all
```

## 📋 Common Scenarios

### Scenario 1: First Time Setup on VPS

```bash
# Clone the repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git
cd Zaytoonz_NGO

# Install dependencies
npm install

# Check configuration
node supabase-env-manager.js check

# Switch to VPS Supabase
node supabase-env-manager.js switch

# Test connection
node supabase-env-manager.js test

# Start the application
npm run dev
```

### Scenario 2: Pulling Latest Changes

```bash
# Pull from GitHub
git pull origin main

# Check if configuration changed
node supabase-env-manager.js check

# Restart application
pm2 restart all
```

### Scenario 3: Troubleshooting Connection Issues

```bash
# Test both connections
node supabase-env-manager.js test

# If VPS connection fails, check Supabase
docker ps
curl http://195.35.28.149:8000

# If old connection works, switch back temporarily
node supabase-env-manager.js switch-back
```

## 🔧 Useful Commands

```bash
# Check current configuration
node supabase-env-manager.js check

# Test both Supabase instances
node supabase-env-manager.js test

# Switch to VPS Supabase
node supabase-env-manager.js switch

# Switch back to old Supabase
node supabase-env-manager.js switch-back

# Show help
node supabase-env-manager.js info
```

## 📊 What Gets Updated

When you run `switch` or `switch-back`:

- ✅ `.env.local` - Next.js environment
- ✅ `.env` - Root environment
- ✅ `Scrape_Master/.env` - Python scraper
- ✅ `morchid-ai-service/.env` - AI service
- ✅ `morchid-ai-service/config.py` - AI config

## ⚡ Quick Troubleshooting

### Connection Failed?
```bash
# Check if Supabase is running
docker ps

# Check if port 8000 is open
netstat -tlnp | grep 8000

# Test with curl
curl http://195.35.28.149:8000
```

### Configuration Wrong?
```bash
# Check current config
node supabase-env-manager.js check

# Switch to correct instance
node supabase-env-manager.js switch
```

### Application Not Working?
```bash
# Check logs
pm2 logs

# Restart application
pm2 restart all

# Or for development
npm run dev
```

## 🎯 Typical Workflow

```bash
# 1. SSH into VPS
ssh user@195.35.28.149

# 2. Navigate to project
cd /path/to/Zaytoonz_NGO

# 3. Pull latest code
git pull origin main

# 4. Check configuration
node supabase-env-manager.js check

# 5. Test connection
node supabase-env-manager.js test

# 6. Restart application
pm2 restart all

# 7. Check if running
pm2 status
```

## 📝 Notes

- Always run `check` before making changes
- Run `test` after switching to verify connection
- Restart your application after switching
- Keep both Supabase instances running for easy switching

## 🔗 Related Documentation

- Full documentation: `SUPABASE_ENV_MANAGER_README.md`
- Database setup: `DATABASE_SETUP_GUIDE.md`
- GitHub workflow: `GITHUB_WORKFLOW_GUIDE.md`

---

**Quick Tip:** Bookmark this page for quick reference! 🚀

