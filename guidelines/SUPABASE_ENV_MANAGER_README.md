# Supabase Environment Manager

A Node.js script to manage the transition between Supabase instances (old cloud instance vs new VPS instance).

## 🎯 Purpose

This tool helps you:
- Check which Supabase instance is currently configured
- Test connections to both Supabase instances
- Switch between old and new Supabase instances
- Update all environment files automatically

## 📋 Prerequisites

- Node.js installed on your VPS
- Access to the project directory
- Supabase instances running

## 🚀 Usage

### On Your VPS Terminal

```bash
# Navigate to your project directory
cd /path/to/Zaytoonz_NGO

# Check current configuration
node supabase-env-manager.js check

# Test both Supabase connections
node supabase-env-manager.js test

# Switch to VPS Supabase
node supabase-env-manager.js switch

# Switch back to old Supabase
node supabase-env-manager.js switch-back

# Show help
node supabase-env-manager.js info
```

## 📝 Commands

### `check`
Check the current Supabase configuration and show which instance is being used.

```bash
node supabase-env-manager.js check
```

**Output:**
- Current Supabase URL
- Current Anon Key (truncated)
- Which instance is active (VPS or old)
- Status of all environment files

---

### `test`
Test connections to both Supabase instances to verify they're working.

```bash
node supabase-env-manager.js test
```

**Output:**
- Connection status for old Supabase
- Connection status for VPS Supabase
- Summary of both tests

---

### `switch`
Switch all configuration files to use the VPS Supabase instance.

```bash
node supabase-env-manager.js switch
```

**Files Updated:**
- `.env.local`
- `.env`
- `Scrape_Master/.env`
- `morchid-ai-service/.env`
- `morchid-ai-service/config.py`

**Next Steps After Switching:**
1. Test the connection: `node supabase-env-manager.js test`
2. Restart your application
3. Verify everything works

---

### `switch-back`
Switch all configuration files back to the old Supabase instance.

```bash
node supabase-env-manager.js switch-back
```

**Use Case:** If you need to temporarily revert to the old Supabase instance for testing or troubleshooting.

---

### `info`
Show help information and available commands.

```bash
node supabase-env-manager.js info
```

---

## 🔧 Configuration

The script is pre-configured with:

### Old Supabase (Cloud)
- **URL:** `https://uroirdudxkfppocqcorm.supabase.co`
- **Anon Key:** (configured in script)

### New VPS Supabase
- **URL:** `http://195.35.28.149:8000`
- **Anon Key:** (configured in script)

To modify these values, edit the constants at the top of `supabase-env-manager.js`:

```javascript
const OLD_SUPABASE_URL = 'your-old-url';
const NEW_VPS_SUPABASE_URL = 'your-new-url';
```

---

## 📂 Files Managed

The script automatically updates these files:

### Node.js Environment Files
- `.env.local` - Next.js environment (highest priority)
- `.env` - Root environment file

### Python Environment Files
- `Scrape_Master/.env` - Python scraper configuration
- `morchid-ai-service/.env` - AI service environment

### Configuration Files
- `morchid-ai-service/config.py` - AI service configuration

---

## 🎯 Typical Workflow

### Initial Setup on VPS

```bash
# 1. Clone the repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git
cd Zaytoonz_NGO

# 2. Check current configuration
node supabase-env-manager.js check

# 3. Test both connections
node supabase-env-manager.js test

# 4. Switch to VPS Supabase
node supabase-env-manager.js switch

# 5. Verify the switch
node supabase-env-manager.js check

# 6. Test the new connection
node supabase-env-manager.js test

# 7. Restart your application
pm2 restart all
# or
npm run dev
```

### Troubleshooting

If something goes wrong:

```bash
# Switch back to old Supabase
node supabase-env-manager.js switch-back

# Check what changed
node supabase-env-manager.js check

# Test connections
node supabase-env-manager.js test
```

---

## 🔒 Security Notes

- Environment files (`.env`, `.env.local`) are in `.gitignore` and won't be committed
- The script only updates configuration files, it doesn't expose credentials
- Anon keys are truncated in output for security

---

## 🆘 Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:** Install dependencies
```bash
npm install
```

### Issue: "Connection failed"

**Possible Causes:**
1. Supabase instance is not running
2. Firewall blocking the connection
3. Wrong URL or credentials

**Solution:**
```bash
# Check if Supabase is running
docker ps

# Check if port 8000 is accessible
netstat -tlnp | grep 8000

# Test with curl
curl http://195.35.28.149:8000
```

### Issue: "Permission denied"

**Solution:** Make sure you have write permissions
```bash
# Check permissions
ls -la .env.local

# Fix permissions if needed
chmod 644 .env.local
```

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

## 🔄 Integration with Git

The script doesn't commit changes automatically. After switching:

```bash
# Review changes
git status

# If satisfied, commit the changes
git add .
git commit -m "Switch to VPS Supabase instance"

# Push to GitHub
git push origin main
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [Environment Variables Guide](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🤝 Contributing

If you find bugs or have suggestions, please:
1. Check existing issues
2. Create a new issue with details
3. Submit a pull request if you have a fix

---

**Made with ❤️ for Zaytoonz NGO Platform**

