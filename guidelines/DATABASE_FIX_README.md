# 🔧 Database Connection Fix - Quick Start

## Problem
Your VPS application can't connect to the database because `.env.local` is missing on the server.

## Solution

### Option 1: Automated Fix (Recommended) ⚡

1. **Upload the fix script to your VPS:**

```powershell
# From your local machine (PowerShell)
scp fix-vps-database.sh root@168.231.87.171:/root/
```

2. **Run the script on your VPS:**

```bash
# SSH into your VPS
ssh root@168.231.87.171

# Run the fix script
bash /root/fix-vps-database.sh
```

The script will automatically:
- ✅ Create `.env.local` with correct Supabase credentials
- ✅ Generate secure NEXTAUTH_SECRET
- ✅ Rebuild your application
- ✅ Restart PM2 services

**Total time:** ~3-5 minutes

---

### Option 2: Manual Fix

**Step 1:** SSH into your VPS
```bash
ssh root@168.231.87.171
```

**Step 2:** Create `.env.local`
```bash
cd /var/www/zaytoonz-ngo
nano .env.local
```

**Step 3:** Copy and paste this content:
```env
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

NLWEB_URL=http://localhost:8000

NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://168.231.87.171

NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter)

**Step 4:** Rebuild and restart
```bash
chmod 600 .env.local
npm run build
pm2 restart all
pm2 save
```

---

## Verification

Check if it's working:

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs zaytoonz-ngo --lines 50

# Test the app
curl http://localhost:3000

# Visit in browser
# http://168.231.87.171
```

---

## Why This Happened

1. ✅ `.env.local` is correctly excluded from Git (security best practice)
2. ❌ BUT you forgot to create it manually on the VPS
3. ❌ Without it, all 90+ files using Supabase can't connect

---

## What's in the Audit Report

See `DATABASE_CONNECTION_AUDIT.md` for:
- ✅ Complete analysis of all issues
- ✅ Architecture review
- ✅ Detailed diagnostic commands
- ✅ Security recommendations
- ✅ Troubleshooting guide

---

## Quick Commands

```bash
# View environment variables
cat /var/www/zaytoonz-ngo/.env.local

# Test database connection
cd /var/www/zaytoonz-ngo
node -e "require('dotenv').config({ path: '.env.local' }); const { createClient } = require('@supabase/supabase-js'); const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); s.from('users').select('count').then(r => console.log('✅ DB OK:', r))"

# Restart everything
pm2 restart all

# View all logs
pm2 logs
```

---

## Need Help?

If the automated script fails, check:
1. PM2 logs: `pm2 logs zaytoonz-ngo`
2. Build errors: `npm run build`
3. Environment variables: `cat .env.local`

Share the error messages for further assistance.

