# Quick Start: Pulling Changes from GitHub

This guide shows you how to pull the latest changes from GitHub on a new machine or update an existing installation.

---

## 📥 Scenario 1: Setting Up on a New Machine

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git

# Navigate to the project directory
cd Zaytoonz_NGO
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# If you have Python dependencies (for scrapers)
cd Scrape_Master
pip install -r requirements.txt
cd ..
```

### Step 3: Set Up Environment Variables

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# The Supabase URL should be: http://195.35.28.149:8000
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=http://195.35.28.149:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Test the Connection

```bash
# Test Supabase connection
node test-supabase-connection.js
```

### Step 5: Run the Application

```bash
# Start the development server
npm run dev
```

---

## 🔄 Scenario 2: Updating an Existing Installation

### Step 1: Navigate to Project Directory

```bash
cd /path/to/Zaytoonz_NGO
```

### Step 2: Check Current Status

```bash
# See if you have any uncommitted changes
git status
```

### Step 3: Stash or Commit Local Changes (if any)

```bash
# Option A: Stash changes (temporarily save them)
git stash

# Option B: Commit your changes first
git add .
git commit -m "Your local changes"
```

### Step 4: Pull Latest Changes

```bash
# Pull the latest changes from GitHub
git pull origin main
```

### Step 5: Restore Stashed Changes (if you stashed)

```bash
# Apply your stashed changes back
git stash pop
```

### Step 6: Install New Dependencies (if any)

```bash
# Install any new dependencies
npm install
```

### Step 7: Test the Connection

```bash
# Verify everything still works
node test-supabase-connection.js
```

---

## 🔄 Scenario 3: Pulling on Your VPS

If you want to deploy the latest changes to your VPS:

### Step 1: SSH into Your VPS

```bash
ssh user@195.35.28.149
```

### Step 2: Navigate to Project Directory

```bash
cd /path/to/your/project
```

### Step 3: Pull Latest Changes

```bash
# Pull the latest code
git pull origin main
```

### Step 4: Install Dependencies (if needed)

```bash
# Install any new dependencies
npm install
```

### Step 5: Restart Your Application

```bash
# If using PM2
pm2 restart all

# Or if using systemd
sudo systemctl restart your-app-name

# Or manually
npm run build
npm start
```

---

## 📋 Quick Reference Commands

```bash
# Clone repository
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git

# Pull latest changes
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -5

# Discard local changes (CAREFUL!)
git reset --hard origin/main
```

---

## 🆘 Common Issues

### Issue: "fatal: not a git repository"
**Solution:** You're not in the project directory. Navigate to the cloned folder first.

### Issue: "Your local changes would be overwritten"
**Solution:** 
```bash
# Stash your changes
git stash

# Pull the changes
git pull origin main

# Apply your changes back
git stash pop
```

### Issue: "merge conflict"
**Solution:**
```bash
# See which files have conflicts
git status

# Edit the conflicted files and resolve conflicts
# Then stage and commit
git add .
git commit -m "Resolve merge conflicts"
```

### Issue: "authentication failed"
**Solution:** You need to authenticate with GitHub. Use:
```bash
# SSH key authentication (recommended)
git clone git@github.com:theunknown2025/Zaytoonz_NGO.git

# Or set up GitHub CLI
gh auth login
```

---

## ✅ Verification Checklist

After pulling changes, verify:

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Supabase connection working (`node test-supabase-connection.js`)
- [ ] Application starts without errors (`npm run dev`)
- [ ] Can access the application in browser

---

## 📚 Additional Resources

- **Database Setup:** See `DATABASE_SETUP_GUIDE.md`
- **Git Workflow:** See `GITHUB_WORKFLOW_GUIDE.md`
- **Deployment:** See `DEPLOYMENT_README.md`

---

**Need Help?** Check the troubleshooting section or review the error messages in the console.

