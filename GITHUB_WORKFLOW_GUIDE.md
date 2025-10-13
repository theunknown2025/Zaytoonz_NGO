# GitHub Workflow Guide

This guide will help you push your changes to GitHub and pull them on other machines.

---

## 📤 Part 1: Pushing Changes to GitHub

### Step 1: Check Current Status

```bash
# Check which files have been modified
git status
```

### Step 2: Stage Your Changes

```bash
# Add all modified files
git add .

# Or add specific files
git add .env.local
git add .env
git add Scrape_Master/.env
git add morchid-ai-service/config.py
```

### Step 3: Commit Your Changes

```bash
# Commit with a descriptive message
git commit -m "Configure Supabase to use VPS instance at 195.35.28.149:8000"
```

### Step 4: Push to GitHub

```bash
# Push to the main branch
git push origin main

# Or if you're on a different branch
git push origin your-branch-name
```

### Step 5: Verify Push

```bash
# Check the remote repository status
git remote -v
git log --oneline -5
```

---

## 📥 Part 2: Pulling Changes from GitHub

### Method 1: Pull on the Same Machine (Update Local Copy)

If you've made changes on another machine and want to update your current machine:

```bash
# Pull the latest changes
git pull origin main

# Or if you want to see what changed first
git fetch origin
git log HEAD..origin/main
git pull origin main
```

### Method 2: Pull on a Different Machine (Clone Repository)

If you want to set up the project on a new machine:

#### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git

# Navigate to the project directory
cd your-repo-name
```

#### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or if using yarn
yarn install
```

#### Step 3: Set Up Environment Variables

```bash
# Copy the environment template
cp .env.example .env.local

# Edit the .env.local file with your credentials
# The Supabase URL should already be set to: http://195.35.28.149:8000
```

#### Step 4: Verify Configuration

```bash
# Test the Supabase connection
node test-supabase-connection.js
```

---

## 🔄 Common Git Workflows

### Workflow 1: Daily Development

```bash
# 1. Start your day - pull latest changes
git pull origin main

# 2. Make your changes
# ... edit files ...

# 3. Stage and commit
git add .
git commit -m "Description of changes"

# 4. Push to GitHub
git push origin main
```

### Workflow 2: Working with Branches

```bash
# 1. Create a new branch for a feature
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push the branch to GitHub
git push origin feature/new-feature

# 4. Create a Pull Request on GitHub
# (Go to GitHub website and create PR)

# 5. After PR is merged, switch back to main
git checkout main
git pull origin main

# 6. Delete the local branch
git branch -d feature/new-feature
```

### Workflow 3: Undo Changes

```bash
# Undo changes to a specific file
git checkout -- filename

# Undo all changes
git checkout -- .

# Undo the last commit (keep changes)
git reset --soft HEAD~1

# Undo the last commit (discard changes)
git reset --hard HEAD~1
```

---

## 🔐 Important: Environment Variables

### ⚠️ Never Commit Sensitive Data

Your `.env.local` file contains sensitive information. Make sure it's in `.gitignore`:

```bash
# Check if .env.local is ignored
cat .gitignore | grep .env

# If not, add it to .gitignore
echo ".env.local" >> .gitignore
```

### ✅ Safe to Commit

These files are safe to commit:
- `.env.example` - Template file (no real credentials)
- `complete_database_schema.sql` - Database schema
- `test-supabase-connection.js` - Test script
- Configuration files with public URLs only

### ❌ Never Commit

- `.env.local` - Contains real credentials
- `.env` - May contain credentials
- `node_modules/` - Dependencies (use npm install)
- API keys and secrets

---

## 📋 Quick Reference Commands

### Check Status
```bash
git status              # See what's changed
git log --oneline -10   # See last 10 commits
git diff                # See what changed
```

### Stage and Commit
```bash
git add .               # Stage all changes
git add filename        # Stage specific file
git commit -m "msg"     # Commit with message
git commit -am "msg"    # Stage and commit (modified files only)
```

### Push and Pull
```bash
git push origin main    # Push to GitHub
git pull origin main    # Pull from GitHub
git fetch origin        # Download changes without merging
```

### Branch Management
```bash
git branch              # List branches
git branch -a           # List all branches (local + remote)
git checkout -b name    # Create and switch to new branch
git checkout branch     # Switch to branch
git branch -d name      # Delete local branch
```

### Undo Changes
```bash
git checkout -- file    # Undo changes to file
git reset HEAD file     # Unstage file
git reset --hard HEAD   # Discard all changes
```

---

## 🎯 Example: Complete Workflow

Here's a complete example of pushing your Supabase configuration changes:

```bash
# 1. Check what changed
git status

# 2. Review the changes
git diff .env.local

# 3. Stage the files
git add .env.local .env Scrape_Master/.env morchid-ai-service/config.py

# 4. Commit with a clear message
git commit -m "Configure Supabase to use VPS instance at 195.35.28.149:8000

- Updated .env.local with VPS Supabase URL
- Updated .env with VPS Supabase URL
- Updated Scrape_Master/.env with VPS Supabase URL
- Updated morchid-ai-service/config.py with VPS Supabase URL
- Created test-supabase-connection.js to verify connection
- Created DATABASE_SETUP_GUIDE.md
- Created GITHUB_WORKFLOW_GUIDE.md"

# 5. Push to GitHub
git push origin main

# 6. Verify the push
git log --oneline -1
```

---

## 🆘 Troubleshooting

### Issue: "fatal: not a git repository"
**Solution:** You're not in a git repository. Run `git init` first.

### Issue: "fatal: remote origin already exists"
**Solution:** The remote is already configured. Use `git remote set-url origin <url>` to change it.

### Issue: "failed to push some refs"
**Solution:** Someone else pushed changes. Run `git pull origin main` first, then push again.

### Issue: "merge conflict"
**Solution:** 
```bash
# See the conflicts
git status

# Edit the conflicted files
# Look for <<<<<<< HEAD and >>>>>>> markers

# After resolving, stage and commit
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

---

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Happy Coding! 🚀**

