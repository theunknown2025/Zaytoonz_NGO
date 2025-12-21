# ✅ Supabase Environment Manager - Complete Setup

## 🎉 What Was Created

I've created a comprehensive Node.js script to manage your Supabase environment transition!

### 📦 Files Created

1. **`supabase-env-manager.js`** - Main script (766 lines)
   - Manages Supabase configuration
   - Switches between old and new instances
   - Tests connections
   - Updates all environment files automatically

2. **`SUPABASE_ENV_MANAGER_README.md`** - Complete documentation
   - Detailed usage instructions
   - All commands explained
   - Troubleshooting guide
   - Example outputs

3. **`VPS_QUICK_START.md`** - Quick reference guide
   - Fast commands for VPS
   - Common scenarios
   - Quick troubleshooting

4. **`SUPABASE_ENV_MANAGER_SUMMARY.md`** - This file
   - Overview of everything
   - Quick start guide

---

## 🚀 How to Use on Your VPS

### Quick Start

```bash
# 1. SSH into your VPS
ssh user@195.35.28.149

# 2. Navigate to project
cd /path/to/Zaytoonz_NGO

# 3. Pull latest changes
git pull origin main

# 4. Check current configuration
node supabase-env-manager.js check

# 5. Test connections
node supabase-env-manager.js test

# 6. Switch to VPS Supabase (if needed)
node supabase-env-manager.js switch

# 7. Restart your application
pm2 restart all
```

---

## 📋 Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `check` | Check current configuration | `node supabase-env-manager.js check` |
| `test` | Test both Supabase connections | `node supabase-env-manager.js test` |
| `switch` | Switch to VPS Supabase | `node supabase-env-manager.js switch` |
| `switch-back` | Switch back to old Supabase | `node supabase-env-manager.js switch-back` |
| `info` | Show help information | `node supabase-env-manager.js info` |

---

## 🎯 What It Does

### When You Run `switch`:

Automatically updates:
- ✅ `.env.local` - Next.js environment
- ✅ `.env` - Root environment
- ✅ `Scrape_Master/.env` - Python scraper
- ✅ `morchid-ai-service/.env` - AI service
- ✅ `morchid-ai-service/config.py` - AI config

### Configuration:

**Old Supabase (Cloud):**
- URL: `https://uroirdudxkfppocqcorm.supabase.co`
- Used for: Backup/Fallback

**New VPS Supabase:**
- URL: `http://195.35.28.149:8000`
- Used for: Production

---

## 📊 Example Output

### Check Command
```
============================================================
Checking Current Configuration
============================================================

ℹ Current Supabase Configuration:
  URL: http://195.35.28.149:8000
  Anon Key: eyJhbGciOiJIUzI1NiIs...

✓ Currently using VPS Supabase instance

ℹ Environment Files Status:
✓ .env.local exists
✓ .env exists
✓ Scrape_Master/.env exists
✓ morchid-ai-service/.env exists
```

### Test Command
```
============================================================
Testing Supabase Connections
============================================================

ℹ Testing Old Supabase...
✓ Old Supabase connection successful!

ℹ Testing VPS Supabase...
✓ VPS Supabase connection successful!

ℹ Connection Test Summary:
  Old Supabase: ✓ Connected
  VPS Supabase: ✓ Connected
```

### Switch Command
```
============================================================
Switching to VPS Supabase
============================================================

ℹ Updating Node.js environment files...
✓ Updated .env.local
✓ Updated .env

ℹ Updating Python environment files...
✓ Updated Scrape_Master/.env
✓ Updated morchid-ai-service/.env

ℹ Updating morchid-ai-service config.py...
✓ Updated morchid-ai-service/config.py

ℹ Switch Summary:
  Successful updates: 5
  Failed updates: 0

✓ Successfully switched to VPS Supabase!
ℹ Next steps:
  1. Run: node supabase-env-manager.js test
  2. Restart your application
  3. Test the connection
```

---

## 🔄 Typical Workflow

### Initial Setup on VPS

```bash
# 1. Clone repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git
cd Zaytoonz_NGO

# 2. Install dependencies
npm install

# 3. Check configuration
node supabase-env-manager.js check

# 4. Test connections
node supabase-env-manager.js test

# 5. Switch to VPS Supabase
node supabase-env-manager.js switch

# 6. Verify switch
node supabase-env-manager.js check

# 7. Test new connection
node supabase-env-manager.js test

# 8. Start application
npm run dev
# or
pm2 start npm --name "zaytoonz" -- run start
```

### Daily Operations

```bash
# Pull latest changes
git pull origin main

# Check configuration
node supabase-env-manager.js check

# Restart application
pm2 restart all
```

### Troubleshooting

```bash
# Test connections
node supabase-env-manager.js test

# If VPS connection fails, switch back temporarily
node supabase-env-manager.js switch-back

# Check Supabase status
docker ps
curl http://195.35.28.149:8000

# Switch back to VPS when ready
node supabase-env-manager.js switch
```

---

## 🆘 Troubleshooting

### Connection Failed?

```bash
# Check if Supabase is running
docker ps

# Check if port 8000 is accessible
netstat -tlnp | grep 8000

# Test with curl
curl http://195.35.28.149:8000

# Check firewall
sudo ufw status
```

### Configuration Wrong?

```bash
# Check current configuration
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

# Check environment
node supabase-env-manager.js check
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `supabase-env-manager.js` | Main script |
| `SUPABASE_ENV_MANAGER_README.md` | Complete documentation |
| `VPS_QUICK_START.md` | Quick reference |
| `SUPABASE_ENV_MANAGER_SUMMARY.md` | This overview |
| `DATABASE_SETUP_GUIDE.md` | Database setup |
| `GITHUB_WORKFLOW_GUIDE.md` | Git workflow |

---

## ✨ Features

- ✅ **Easy to Use** - Simple commands
- ✅ **Automatic** - Updates all files at once
- ✅ **Safe** - Tests connections before switching
- ✅ **Reversible** - Can switch back anytime
- ✅ **Informative** - Shows detailed status
- ✅ **Cross-Platform** - Works on any OS with Node.js

---

## 🎯 Benefits

1. **No Manual Editing** - Script updates all files automatically
2. **Error Prevention** - Tests connections before switching
3. **Quick Switching** - Switch between instances in seconds
4. **Safe Rollback** - Easy to switch back if needed
5. **Clear Status** - Always know which instance is active

---

## 🔗 GitHub Repository

All files are pushed to:
```
https://github.com/theunknown2025/Zaytoonz_NGO.git
```

---

## 📝 Next Steps

1. **Pull on VPS:**
   ```bash
   git pull origin main
   ```

2. **Run the script:**
   ```bash
   node supabase-env-manager.js check
   ```

3. **Switch to VPS Supabase:**
   ```bash
   node supabase-env-manager.js switch
   ```

4. **Test connection:**
   ```bash
   node supabase-env-manager.js test
   ```

5. **Restart application:**
   ```bash
   pm2 restart all
   ```

---

## 🎉 You're All Set!

The Supabase Environment Manager is ready to use on your VPS!

**Quick Reference:**
- Check: `node supabase-env-manager.js check`
- Test: `node supabase-env-manager.js test`
- Switch: `node supabase-env-manager.js switch`
- Help: `node supabase-env-manager.js info`

---

**Made with ❤️ for Zaytoonz NGO Platform**

