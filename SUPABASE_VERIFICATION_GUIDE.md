# 🔍 Supabase Configuration Verification Guide

This guide helps you verify that your Supabase configuration is correct for the beta-zaytoonz.pro deployment.

## 📋 Quick Verification Steps

### 1. **Check Environment Variables on VPS**

SSH into your VPS and verify the variables are set:

```bash
ssh root@76.13.57.178
cd /opt/zaytoonz-ngo

# Check if variables are in .env.production
grep -E "NEXT_PUBLIC_SUPABASE" .env.production
```

**Expected output:**
```
NEXT_PUBLIC_SUPABASE_URL=https://uroirdudxkfppocqcorm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. **Run Automated Verification Script**

We've created a script to automatically verify your Supabase configuration:

```bash
# On your VPS
cd /opt/zaytoonz-ngo
chmod +x verify-supabase-config.sh
./verify-supabase-config.sh
```

**What it checks:**
- ✅ Environment variables are set
- ✅ URL format is valid
- ✅ JWT token format is valid
- ✅ API connection works
- ✅ Docker container has correct variables

---

### 3. **Verify in Supabase Dashboard**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `uroirdudxkfppocqcorm`
3. Navigate to **Settings** → **API**
4. Verify:
   - **Project URL** matches: `https://uroirdudxkfppocqcorm.supabase.co`
   - **anon/public key** matches your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 4. **Test Connection from Docker Container**

```bash
# Check environment variables in running container
docker exec zaytoonz-nextjs-beta env | grep SUPABASE

# Test Supabase connection from container
docker exec zaytoonz-nextjs-beta node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
supabase.from('users').select('count').limit(1)
  .then(({error}) => {
    if (error && (error.code === 'PGRST116' || error.message.includes('RLS'))) {
      console.log('✓ Connection works! (RLS error is expected)');
    } else if (error) {
      console.log('✗ Error:', error.message);
    } else {
      console.log('✓ Connection works!');
    }
  });
"
```

---

### 5. **Test from Browser Console**

1. Open your application: `https://beta-zaytoonz.pro`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Run this test:

```javascript
// Check if Supabase is configured
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Test connection (if Supabase client is available)
if (window.supabase) {
  window.supabase.from('users').select('count').limit(1)
    .then(({error}) => {
      if (error && error.code === 'PGRST116') {
        console.log('✓ Supabase connection works!');
      } else {
        console.log('✗ Error:', error);
      }
    });
}
```

---

### 6. **Test Authentication Flow**

The best way to verify Supabase is working is to test authentication:

1. **Try Sign Up:**
   - Go to: `https://beta-zaytoonz.pro/auth/signup`
   - Create a test account
   - Check if user is created in Supabase Dashboard → **Authentication** → **Users**

2. **Try Sign In:**
   - Go to: `https://beta-zaytoonz.pro/auth/signin`
   - Sign in with test credentials
   - Check browser console for errors

3. **Check Supabase Logs:**
   - Go to Supabase Dashboard → **Logs** → **API Logs**
   - Look for requests from your VPS IP: `76.13.57.178`

---

## 🔧 Common Issues and Fixes

### Issue 1: "Invalid API key" or "Unauthorized"

**Symptoms:**
- Browser console shows Supabase authentication errors
- API requests return 401 Unauthorized

**Fix:**
1. Verify the anon key in Supabase Dashboard
2. Update `.env.production` on VPS:
   ```bash
   nano /opt/zaytoonz-ngo/.env.production
   # Update NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. Restart containers:
   ```bash
   docker compose -f docker-compose-beta.yml restart nextjs
   ```

---

### Issue 2: "Connection refused" or "Network error"

**Symptoms:**
- Cannot connect to Supabase API
- Timeout errors

**Fix:**
1. Check internet connectivity from VPS:
   ```bash
   curl -I https://uroirdudxkfppocqcorm.supabase.co
   ```
2. Check firewall rules:
   ```bash
   ufw status
   # Should allow outbound HTTPS (443)
   ```
3. Verify DNS resolution:
   ```bash
   nslookup uroirdudxkfppocqcorm.supabase.co
   ```

---

### Issue 3: Environment variables not loaded in container

**Symptoms:**
- Container shows placeholder values
- Application can't connect to Supabase

**Fix:**
1. Verify `.env.production` exists and has correct values
2. Rebuild container with environment:
   ```bash
   cd /opt/zaytoonz-ngo
   docker compose -f docker-compose-beta.yml down
   docker compose -f docker-compose-beta.yml up -d --build
   ```
3. Check container environment:
   ```bash
   docker exec zaytoonz-nextjs-beta env | grep SUPABASE
   ```

---

### Issue 4: RLS (Row Level Security) blocking queries

**Symptoms:**
- Queries return empty results
- Error: "new row violates row-level security policy"

**Fix:**
1. This is expected behavior if RLS is enabled
2. Verify RLS policies in Supabase Dashboard → **Authentication** → **Policies**
3. Ensure policies allow the operations your app needs
4. Test with service role key (server-side only, never expose to client)

---

## ✅ Verification Checklist

Use this checklist to ensure everything is configured correctly:

- [ ] Environment variables are set in `.env.production`
- [ ] Supabase URL format is correct: `https://[project-id].supabase.co`
- [ ] Anon key is valid JWT token (starts with `eyJ`)
- [ ] Variables are loaded in Docker container
- [ ] API connection test passes
- [ ] Can access Supabase Dashboard
- [ ] Authentication flow works (sign up/sign in)
- [ ] No errors in browser console
- [ ] Supabase logs show requests from VPS IP

---

## 🧪 Manual Testing Script

Create a test file to verify Supabase connection:

```bash
# On VPS, create test script
cat > /tmp/test-supabase.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'SET (' + supabaseKey.substring(0, 20) + '...)' : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Check connection
supabase.from('users').select('count').limit(1)
  .then(({ data, error, status }) => {
    console.log('\n=== Test Results ===');
    console.log('Status:', status);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('RLS')) {
        console.log('✓ Connection successful! (RLS/permission error is expected)');
      } else if (error.code === '42P01') {
        console.log('⚠ Table "users" does not exist, but connection works');
      } else {
        console.log('✗ Error:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✓ Connection successful! Query returned data.');
    }
    
    console.log('\n✓ Supabase configuration is correct!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Connection failed:', err.message);
    process.exit(1);
  });
EOF

# Run test from container
docker exec zaytoonz-nextjs-beta node /tmp/test-supabase.js
```

---

## 📞 Getting Help

If you're still having issues:

1. **Check Supabase Status:** https://status.supabase.com/
2. **Review Supabase Logs:** Dashboard → Logs → API Logs
3. **Check Application Logs:**
   ```bash
   docker compose -f docker-compose-beta.yml logs nextjs | grep -i supabase
   ```
4. **Verify Project Settings:** Dashboard → Settings → API

---

## 🎯 Quick Reference

**Your Supabase Configuration:**
- **Project ID:** `uroirdudxkfppocqcorm`
- **URL:** `https://uroirdudxkfppocqcorm.supabase.co`
- **Dashboard:** https://app.supabase.com/project/uroirdudxkfppocqcorm

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Must be set in `.env.production`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Must be set in `.env.production`

**Verification Command:**
```bash
./verify-supabase-config.sh
```
