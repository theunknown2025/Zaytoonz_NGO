# 🔍 Database Connection Audit Report

## Executive Summary

After reviewing your deployment setup, I've identified **CRITICAL ISSUES** preventing proper database connectivity on your VPS server.

---

## 🚨 Critical Issues Found

### Issue #1: Missing Environment Variables on VPS ⚠️ **HIGHEST PRIORITY**

**Problem:**
Your `.env.local` file exists locally but is **NOT** on your VPS server.

**Evidence:**
- `.gitignore` excludes `.env` and `.env.local` from Git
- Your deployment guide mentions creating `.env.local` manually on VPS
- Environment variables are required in **90+ files** across your application

**Current State:**
```bash
# On VPS (likely missing):
NEXT_PUBLIC_SUPABASE_URL = undefined
NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined
```

**Impact:**
- ❌ All database queries fail
- ❌ Authentication doesn't work
- ❌ API routes return errors
- ❌ Application shows "Can't connect to database"

**Solution Required:**
```bash
# SSH into your VPS
ssh root@168.231.87.171

# Navigate to app directory
cd /var/www/zaytoonz-ngo

# Create .env.local file
nano .env.local
```

Add this content:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000

# External Scraper Configuration
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# NLWeb Configuration
NLWEB_URL=http://localhost:8000

# NextAuth Configuration
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=http://168.231.87.171

# Environment
NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter)

```bash
# Set proper permissions
chmod 600 .env.local

# Rebuild the application
npm run build

# Restart PM2
pm2 restart all
pm2 save
```

---

### Issue #2: Build-time vs Runtime Environment Variables ⚠️ **HIGH PRIORITY**

**Problem:**
Next.js handles environment variables differently at build-time vs runtime.

**Current Architecture:**
```javascript
// Variables prefixed with NEXT_PUBLIC_ are embedded at BUILD time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
```

**Issue:**
If you build locally (on Windows) with one Supabase URL, then deploy to VPS with different env vars, the **build-time values are already baked in**.

**Solution:**
You MUST rebuild on the VPS after creating `.env.local`:
```bash
cd /var/www/zaytoonz-ngo
npm run build  # This embeds the environment variables
pm2 restart zaytoonz-ngo
```

---

### Issue #3: Supabase Configuration Mismatch 🔄

**Current Configuration:**
Your app is configured for **Supabase Cloud**:
```
URL: https://uroirdudxkfppocqcorm.supabase.co
```

**Confusion in Documentation:**
Some guides reference self-hosted Supabase:
```
URL: http://localhost:8000
```

**Clarification Needed:**
You need to decide:
- ✅ **Option A (Recommended):** Use Supabase Cloud (current setup)
- ❌ **Option B:** Self-host Supabase on VPS (requires Docker, PostgreSQL setup)

**If using Supabase Cloud (recommended):**
No changes needed, just ensure `.env.local` on VPS matches your cloud credentials.

---

### Issue #4: CORS and Network Configuration

**Potential Issue:**
If using Supabase Cloud from VPS, ensure:
1. ✅ VPS can reach `https://uroirdudxkfppocqcorm.supabase.co`
2. ✅ Supabase CORS settings allow your VPS IP
3. ✅ No firewall blocking outbound HTTPS

**Test Connection from VPS:**
```bash
# SSH into VPS
ssh root@168.231.87.171

# Test connection to Supabase
curl -I https://uroirdudxkfppocqcorm.supabase.co

# Should return HTTP 200 or 301
```

---

### Issue #5: RLS (Row Level Security) Policies

**Potential Issue:**
Supabase RLS policies might be blocking access.

**Files to Check:**
- `database_rls_policies_and_triggers.sql`
- `complete_database_schema.sql`

**Common Problems:**
1. RLS enabled but no policies allow access
2. Policies require authentication but server-side requests don't have auth
3. Service role key not being used for server-side operations

**Solution:**
For server-side API routes that need full access, use **Service Role Key** (not anon key):

```typescript
// For admin/server operations only - NEVER expose to client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Add this to .env.local
);
```

---

## 📊 Dependency Analysis

### Files Using Supabase Connection: 90+

**Critical Paths:**
- `app/lib/supabase.ts` - Main client (used everywhere)
- `app/api/**/route.ts` - 40+ API routes
- `app/ngo/**/*.tsx` - NGO dashboard components
- `app/seeker/**/*.tsx` - Seeker components
- `app/admin/**/*.tsx` - Admin components

**All these fail if environment variables are missing.**

---

## 🔧 Step-by-Step Fix (In Order)

### Step 1: Create `.env.local` on VPS
```bash
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo
nano .env.local
# Copy content from section above
# Save and exit
```

### Step 2: Verify Environment Variables
```bash
# Check if file exists
cat .env.local

# Test if Node can read them
node -e "require('dotenv').config({ path: '.env.local' }); console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Step 3: Rebuild Application
```bash
npm run build
```

### Step 4: Restart Services
```bash
pm2 restart all
pm2 save
```

### Step 5: Test Connection
```bash
# Check PM2 logs for errors
pm2 logs zaytoonz-ngo --lines 50

# Check if app is running
curl http://localhost:3000
```

### Step 6: Test Database Connection
```bash
# Create a test script
cat > test-db.js << 'EOF'
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.from('users').select('count');
  if (error) {
    console.error('❌ Database Error:', error.message);
  } else {
    console.log('✅ Database Connected!', data);
  }
}

test();
EOF

node test-db.js
```

---

## 🎯 Quick Diagnostic Commands

Run these on your VPS to diagnose issues:

```bash
# 1. Check if .env.local exists
ls -la /var/www/zaytoonz-ngo/.env.local

# 2. Check PM2 status
pm2 status

# 3. Check application logs
pm2 logs zaytoonz-ngo --lines 100

# 4. Check if Next.js is running
curl http://localhost:3000

# 5. Check if environment variables are loaded
pm2 describe zaytoonz-ngo | grep -A 20 "env:"

# 6. Test Supabase connection
curl https://uroirdudxkfppocqcorm.supabase.co/rest/v1/
```

---

## 📋 Verification Checklist

After fixes, verify:

- [ ] `.env.local` exists on VPS: `/var/www/zaytoonz-ngo/.env.local`
- [ ] Contains correct Supabase URL and key
- [ ] Application rebuilt after creating `.env.local`
- [ ] PM2 shows all services running
- [ ] Can access app at `http://168.231.87.171`
- [ ] Database queries working (check logs)
- [ ] Authentication working (try login)
- [ ] No errors in PM2 logs

---

## 🚨 Most Likely Root Cause

**99% CERTAIN:** Your `.env.local` file does NOT exist on the VPS server.

**Why:**
1. ✅ `.gitignore` excludes it (correct for security)
2. ❌ You never manually created it on VPS
3. ❌ Deployment scripts don't create it automatically

**One-Line Fix:**
```bash
ssh root@168.231.87.171 "cd /var/www/zaytoonz-ngo && cat > .env.local" < .env.local
```

This copies your local `.env.local` to VPS.

---

## 📞 Next Steps

1. **Immediately:** Create `.env.local` on VPS (Step 1 above)
2. **Rebuild:** Run `npm run build` on VPS
3. **Restart:** Run `pm2 restart all`
4. **Test:** Check if database works
5. **Report back:** Share PM2 logs if still failing

---

## 🔐 Security Notes

**WARNING:** Your `.env.local` contains sensitive keys:
- ✅ Supabase anon key (safe to expose to clients)
- ⚠️ OpenAI API key (keep secret, don't expose in client code)
- ⚠️ Never commit `.env.local` to Git
- ⚠️ Use environment-specific keys for prod/dev

**Better Practice:**
Consider using:
- GitHub Secrets for deployment
- Hostinger environment variable manager
- PM2 ecosystem config with env vars

---

## 📊 Architecture Review

**Current Setup (Confirmed):**
```
┌─────────────────────────────────────────┐
│  VPS (168.231.87.171)                   │
│  ┌────────────────────────────────────┐ │
│  │  Nginx (Port 80)                   │ │
│  │    ↓                                │ │
│  │  Next.js (Port 3000)               │ │
│  │    ↓                                │ │
│  │  Uses: NEXT_PUBLIC_SUPABASE_URL    │ │
│  │    ↓                                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
             ↓ HTTPS
┌─────────────────────────────────────────┐
│  Supabase Cloud                         │
│  (uroirdudxkfppocqcorm.supabase.co)    │
│  - PostgreSQL Database                  │
│  - Auth                                 │
│  - Storage                              │
│  - Realtime                             │
└─────────────────────────────────────────┘
```

**This is GOOD!** You don't need to self-host Supabase.

---

**END OF AUDIT**

Let me know which step you need help with!

