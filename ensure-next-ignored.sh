#!/bin/bash
# Script to ensure .next is properly ignored and removed from git if accidentally tracked

echo "🔍 Checking if .next is tracked in Git..."
echo ""

cd /opt/zaytoonz-ngo

# Check if .next is tracked
TRACKED=$(git ls-files .next 2>/dev/null | wc -l)

if [ "$TRACKED" -gt 0 ]; then
    echo "❌ .next folder IS tracked in Git!"
    echo "Removing from Git (but keeping local files)..."
    git rm -r --cached .next 2>/dev/null || true
    echo "✅ Removed from Git tracking"
else
    echo "✅ .next folder is NOT tracked in Git (correct)"
fi

# Verify .gitignore
echo ""
echo "Checking .gitignore..."
if grep -q "^/.next/" .gitignore 2>/dev/null; then
    echo "✅ .gitignore correctly excludes /.next/"
else
    echo "⚠️  .gitignore might not exclude .next properly"
    echo "Adding /.next/ to .gitignore..."
    echo "/.next/" >> .gitignore
    echo "✅ Updated .gitignore"
fi

# Remove .next if it exists locally (on VPS)
if [ -d ".next" ]; then
    echo ""
    echo "⚠️  .next folder exists locally"
    echo "This is the build cache - it will be regenerated during build"
    echo "To remove it: rm -rf .next"
else
    echo ""
    echo "✅ No .next folder locally (will be created during build)"
fi

echo ""
echo "✅ Verification complete!"
