#!/bin/bash
# Verify that .next and other build artifacts are NOT in Git repository

echo "🔍 Verifying Git Repository Cleanliness"
echo "========================================"
echo ""

cd /opt/zaytoonz-ngo

# Check if .next is tracked
echo "1️⃣  Checking if .next is tracked in Git..."
TRACKED_NEXT=$(git ls-files .next 2>/dev/null | wc -l)
if [ "$TRACKED_NEXT" -gt 0 ]; then
    echo "   ❌ .next IS tracked! Removing..."
    git rm -r --cached .next 2>/dev/null || true
    echo "   ✅ Removed from Git"
else
    echo "   ✅ .next is NOT tracked (correct)"
fi

# Check if any .next files are in repository
echo ""
echo "2️⃣  Checking for any .next files in repository..."
NEXT_FILES=$(git ls-tree -r HEAD --name-only | grep "\.next" | wc -l)
if [ "$NEXT_FILES" -gt 0 ]; then
    echo "   ❌ Found .next files in repository:"
    git ls-tree -r HEAD --name-only | grep "\.next"
    echo "   ⚠️  These should be removed!"
else
    echo "   ✅ No .next files in repository (correct)"
fi

# Verify .gitignore
echo ""
echo "3️⃣  Verifying .gitignore..."
if grep -q "^/.next/" .gitignore 2>/dev/null || grep -q "^\.next/" .gitignore 2>/dev/null; then
    echo "   ✅ .gitignore properly excludes .next"
else
    echo "   ⚠️  .gitignore might not exclude .next"
    echo "   Adding /.next/ to .gitignore..."
    if ! grep -q ".next" .gitignore; then
        echo "" >> .gitignore
        echo "# Next.js build output" >> .gitignore
        echo "/.next/" >> .gitignore
        echo "   ✅ Updated .gitignore"
    fi
fi

# Check for other build artifacts
echo ""
echo "4️⃣  Checking for other build artifacts..."
BUILD_ARTIFACTS=$(git ls-files | grep -E "node_modules|\.next|dist|build" | wc -l)
if [ "$BUILD_ARTIFACTS" -gt 0 ]; then
    echo "   ⚠️  Found build artifacts in Git:"
    git ls-files | grep -E "node_modules|\.next|dist|build"
else
    echo "   ✅ No build artifacts tracked (correct)"
fi

# Summary
echo ""
echo "================================"
echo "✅ Verification complete!"
echo ""
echo "If .next was found in Git, it has been removed."
echo "The .next folder will be created during build and is properly ignored."
