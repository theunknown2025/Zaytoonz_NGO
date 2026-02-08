#!/usr/bin/env node
/**
 * Verify Build Output - Check what Next.js actually built
 * This script checks the .next build folder to see what page component is actually being used
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Next.js Build Output...\n');

// Check source file
const sourcePagePath = path.join(__dirname, 'app', 'page.tsx');
console.log('📄 Checking source file: app/page.tsx');
if (fs.existsSync(sourcePagePath)) {
  const sourceContent = fs.readFileSync(sourcePagePath, 'utf8');
  const hasSMLanding = sourceContent.includes('ZaytoonzSMLanding');
  // Check for LandingPage in actual code (not comments)
  const hasLandingPage = /import.*LandingPage|from.*LandingPage|<LandingPage/.test(sourceContent);
  
  console.log(`   ✅ File exists`);
  console.log(`   ${hasSMLanding ? '✅' : '❌'} Contains ZaytoonzSMLanding: ${hasSMLanding}`);
  console.log(`   ${!hasLandingPage ? '✅' : '❌'} Does NOT contain LandingPage: ${!hasLandingPage}`);
  
  if (hasSMLanding && !hasLandingPage) {
    console.log('   ✅ Source file is CORRECT\n');
  } else {
    console.log('   ❌ Source file is INCORRECT!\n');
  }
} else {
  console.log('   ❌ Source file NOT FOUND!\n');
}

// Check build output
const nextBuildPath = path.join(__dirname, '.next');
console.log('📦 Checking build output: .next folder');

if (!fs.existsSync(nextBuildPath)) {
  console.log('   ⚠️  .next folder does not exist - build has not been run yet\n');
  process.exit(0);
}

console.log('   ✅ .next folder exists\n');

// Check server build
const serverAppPath = path.join(nextBuildPath, 'server', 'app');
console.log('🔍 Checking server build output...');

if (fs.existsSync(serverAppPath)) {
  const pagePath = path.join(serverAppPath, 'page.js');
  const pageJsPath = path.join(serverAppPath, 'page.js');
  const pageMjsPath = path.join(serverAppPath, 'page.mjs');
  
  const buildFiles = [pagePath, pageJsPath, pageMjsPath].filter(f => fs.existsSync(f));
  
  if (buildFiles.length > 0) {
    console.log(`   ✅ Found ${buildFiles.length} build file(s)`);
    
    buildFiles.forEach(file => {
      console.log(`\n   📄 Checking: ${path.basename(file)}`);
      try {
        const content = fs.readFileSync(file, 'utf8');
        const hasSMLanding = content.includes('ZaytoonzSMLanding') || content.includes('zaytoonz-sm-root');
        const hasLandingPage = content.includes('LandingPage') && !content.includes('app/page');
        
        console.log(`      ${hasSMLanding ? '✅' : '❌'} Contains ZaytoonzSMLanding: ${hasSMLanding}`);
        console.log(`      ${!hasLandingPage ? '✅' : '❌'} Does NOT contain LandingPage: ${!hasLandingPage}`);
        
        if (hasSMLanding && !hasLandingPage) {
          console.log(`      ✅ Build output is CORRECT`);
        } else {
          console.log(`      ❌ Build output is INCORRECT!`);
          console.log(`      ⚠️  This build needs to be cleared and rebuilt`);
        }
      } catch (err) {
        console.log(`      ⚠️  Could not read file: ${err.message}`);
      }
    });
  } else {
    console.log('   ⚠️  No page build files found');
  }
} else {
  console.log('   ⚠️  Server build folder does not exist');
}

// Check static build
const staticAppPath = path.join(nextBuildPath, 'static', 'chunks');
console.log('\n🔍 Checking static chunks...');

if (fs.existsSync(staticAppPath)) {
  const chunks = fs.readdirSync(staticAppPath).filter(f => f.includes('app/page'));
  if (chunks.length > 0) {
    console.log(`   ✅ Found ${chunks.length} page chunk(s)`);
    chunks.slice(0, 3).forEach(chunk => {
      const chunkPath = path.join(staticAppPath, chunk);
      try {
        const content = fs.readFileSync(chunkPath, 'utf8');
        const hasSMLanding = content.includes('ZaytoonzSMLanding') || content.includes('zaytoonz-sm-root');
        const hasLandingPage = content.includes('LandingPage') && !content.includes('app/page');
        
        console.log(`   📄 ${chunk}:`);
        console.log(`      ${hasSMLanding ? '✅' : '❌'} Contains SM Landing: ${hasSMLanding}`);
        console.log(`      ${!hasLandingPage ? '✅' : '❌'} Does NOT contain LandingPage: ${!hasLandingPage}`);
      } catch (err) {
        console.log(`   ⚠️  Could not read chunk: ${chunk}`);
      }
    });
  } else {
    console.log('   ⚠️  No page chunks found');
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));

const sourceContent = fs.existsSync(sourcePagePath) ? fs.readFileSync(sourcePagePath, 'utf8') : '';
const sourceCorrect = fs.existsSync(sourcePagePath) && 
  sourceContent.includes('ZaytoonzSMLanding') &&
  !/import.*LandingPage|from.*LandingPage|<LandingPage/.test(sourceContent);

if (sourceCorrect) {
  console.log('✅ Source file (app/page.tsx) is CORRECT');
  console.log('⚠️  If build output is wrong, you need to:');
  console.log('   1. Remove .next folder: rm -rf .next');
  console.log('   2. Rebuild: npm run build');
} else {
  console.log('❌ Source file (app/page.tsx) is INCORRECT');
  console.log('   Fix app/page.tsx first!');
}

console.log('='.repeat(60));
