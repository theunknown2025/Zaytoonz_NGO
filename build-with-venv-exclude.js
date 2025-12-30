#!/usr/bin/env node
/**
 * Build script that temporarily excludes venv directory from Next.js build
 * This prevents Next.js from trying to process Python virtual environment files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const venvPath = path.join(__dirname, 'app/admin/Scrape_Master/venv');
const backupPath = path.join(__dirname, 'app/admin/Scrape_Master/.venv-backup');

// Function to move venv out of the way
function hideVenv() {
  if (fs.existsSync(venvPath)) {
    console.log('Temporarily moving venv directory to prevent Next.js from processing it...');
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true });
    }
    fs.renameSync(venvPath, backupPath);
    console.log('Venv directory moved successfully.');
  }
}

// Function to restore venv
function restoreVenv() {
  if (fs.existsSync(backupPath)) {
    console.log('Restoring venv directory...');
    if (fs.existsSync(venvPath)) {
      fs.rmSync(venvPath, { recursive: true, force: true });
    }
    fs.renameSync(backupPath, venvPath);
    console.log('Venv directory restored successfully.');
  }
}

// Handle cleanup on exit
process.on('exit', restoreVenv);
process.on('SIGINT', () => {
  restoreVenv();
  process.exit(1);
});
process.on('SIGTERM', () => {
  restoreVenv();
  process.exit(1);
});

// Main build process
try {
  hideVenv();
  console.log('Running Next.js build...');
  execSync('next build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} finally {
  restoreVenv();
}

