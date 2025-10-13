#!/usr/bin/env node

/**
 * Supabase Environment Manager
 * 
 * This script helps manage the transition from the previous Supabase instance
 * to the new VPS Supabase instance.
 * 
 * Usage:
 *   node supabase-env-manager.js check          - Check current configuration
 *   node supabase-env-manager.js test           - Test Supabase connection
 *   node supabase-env-manager.js switch         - Switch to VPS Supabase
 *   node supabase-env-manager.js switch-back    - Switch back to old Supabase
 *   node supabase-env-manager.js info           - Show configuration info
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const OLD_SUPABASE_URL = 'https://uroirdudxkfppocqcorm.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyb2lyZHVkeGtmcHBvY3Fjb3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDA4MzMsImV4cCI6MjA2MTI3NjgzM30.6sFQhGrngaFTnsDS7EqjUI2F86iKefTfCn_M1BitcPM';

const NEW_VPS_SUPABASE_URL = 'http://195.35.28.149:8000';
const NEW_VPS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

const ENV_FILES = ['.env.local', '.env'];
const PYTHON_ENV_FILES = ['Scrape_Master/.env', 'morchid-ai-service/.env'];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

// Read environment file
function readEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    logError(`Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

// Write environment file
function writeEnvFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    logError(`Error writing ${filePath}: ${error.message}`);
    return false;
  }
}

// Update environment variables in a file
function updateEnvFile(filePath, url, anonKey, isPython = false) {
  const content = readEnvFile(filePath);
  if (!content) {
    return false;
  }

  let updated = content;
  
  if (isPython) {
    // Python environment files
    updated = updated.replace(
      /SUPABASE_URL=.*/g,
      `SUPABASE_URL=${url}`
    );
    updated = updated.replace(
      /SUPABASE_ANON_KEY=.*/g,
      `SUPABASE_ANON_KEY=${anonKey}`
    );
  } else {
    // Node.js environment files
    updated = updated.replace(
      /NEXT_PUBLIC_SUPABASE_URL=.*/g,
      `NEXT_PUBLIC_SUPABASE_URL=${url}`
    );
    updated = updated.replace(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/g,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`
    );
  }

  return writeEnvFile(filePath, updated);
}

// Check current configuration
function checkConfiguration() {
  logHeader('Checking Current Configuration');
  
  const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const currentKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  logInfo('Current Supabase Configuration:');
  console.log(`  URL: ${currentUrl || 'Not set'}`);
  console.log(`  Anon Key: ${currentKey ? currentKey.substring(0, 20) + '...' : 'Not set'}`);
  console.log();
  
  if (currentUrl === NEW_VPS_SUPABASE_URL) {
    logSuccess('Currently using VPS Supabase instance');
  } else if (currentUrl === OLD_SUPABASE_URL) {
    logWarning('Currently using old Supabase instance');
  } else {
    logWarning('Unknown Supabase configuration');
  }
  
  console.log();
  
  // Check all environment files
  logInfo('Environment Files Status:');
  [...ENV_FILES, ...PYTHON_ENV_FILES].forEach(file => {
    const exists = fs.existsSync(file);
    if (exists) {
      logSuccess(`${file} exists`);
    } else {
      logWarning(`${file} not found`);
    }
  });
}

// Test Supabase connection
async function testConnection(url, anonKey, label) {
  logInfo(`Testing ${label}...`);
  
  try {
    const supabase = createClient(url, anonKey);
    
    // Try to query the users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      logError(`${label} connection failed: ${error.message}`);
      return false;
    }
    
    logSuccess(`${label} connection successful!`);
    return true;
  } catch (error) {
    logError(`${label} connection failed: ${error.message}`);
    return false;
  }
}

// Test both Supabase instances
async function testBothConnections() {
  logHeader('Testing Supabase Connections');
  
  const oldResult = await testConnection(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY, 'Old Supabase');
  console.log();
  const newResult = await testConnection(NEW_VPS_SUPABASE_URL, NEW_VPS_SUPABASE_ANON_KEY, 'VPS Supabase');
  
  console.log();
  logInfo('Connection Test Summary:');
  console.log(`  Old Supabase: ${oldResult ? '✓ Connected' : '✗ Failed'}`);
  console.log(`  VPS Supabase: ${newResult ? '✓ Connected' : '✗ Failed'}`);
}

// Switch to VPS Supabase
function switchToVPS() {
  logHeader('Switching to VPS Supabase');
  
  let successCount = 0;
  let failCount = 0;
  
  // Update Node.js environment files
  logInfo('Updating Node.js environment files...');
  ENV_FILES.forEach(file => {
    if (updateEnvFile(file, NEW_VPS_SUPABASE_URL, NEW_VPS_SUPABASE_ANON_KEY, false)) {
      logSuccess(`Updated ${file}`);
      successCount++;
    } else {
      logError(`Failed to update ${file}`);
      failCount++;
    }
  });
  
  // Update Python environment files
  logInfo('Updating Python environment files...');
  PYTHON_ENV_FILES.forEach(file => {
    if (updateEnvFile(file, NEW_VPS_SUPABASE_URL, NEW_VPS_SUPABASE_ANON_KEY, true)) {
      logSuccess(`Updated ${file}`);
      successCount++;
    } else {
      logError(`Failed to update ${file}`);
      failCount++;
    }
  });
  
  // Update morchid-ai-service config.py
  logInfo('Updating morchid-ai-service config.py...');
  const configPath = 'morchid-ai-service/config.py';
  const configContent = readEnvFile(configPath);
  if (configContent) {
    let updated = configContent;
    updated = updated.replace(
      /SUPABASE_URL = os\.getenv\("SUPABASE_URL", ".*"\)/g,
      `SUPABASE_URL = os.getenv("SUPABASE_URL", "${NEW_VPS_SUPABASE_URL}")`
    );
    updated = updated.replace(
      /SUPABASE_ANON_KEY = os\.getenv\("SUPABASE_ANON_KEY", ".*"\)/g,
      `SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "${NEW_VPS_SUPABASE_ANON_KEY}")`
    );
    
    if (writeEnvFile(configPath, updated)) {
      logSuccess(`Updated ${configPath}`);
      successCount++;
    } else {
      logError(`Failed to update ${configPath}`);
      failCount++;
    }
  }
  
  console.log();
  logInfo('Switch Summary:');
  console.log(`  Successful updates: ${successCount}`);
  console.log(`  Failed updates: ${failCount}`);
  
  if (failCount === 0) {
    logSuccess('Successfully switched to VPS Supabase!');
    logInfo('Next steps:');
    console.log('  1. Run: node supabase-env-manager.js test');
    console.log('  2. Restart your application');
    console.log('  3. Test the connection');
  } else {
    logWarning('Some files could not be updated. Please check the errors above.');
  }
}

// Switch back to old Supabase
function switchBackToOld() {
  logHeader('Switching Back to Old Supabase');
  
  let successCount = 0;
  let failCount = 0;
  
  // Update Node.js environment files
  logInfo('Updating Node.js environment files...');
  ENV_FILES.forEach(file => {
    if (updateEnvFile(file, OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY, false)) {
      logSuccess(`Updated ${file}`);
      successCount++;
    } else {
      logError(`Failed to update ${file}`);
      failCount++;
    }
  });
  
  // Update Python environment files
  logInfo('Updating Python environment files...');
  PYTHON_ENV_FILES.forEach(file => {
    if (updateEnvFile(file, OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY, true)) {
      logSuccess(`Updated ${file}`);
      successCount++;
    } else {
      logError(`Failed to update ${file}`);
      failCount++;
    }
  });
  
  // Update morchid-ai-service config.py
  logInfo('Updating morchid-ai-service config.py...');
  const configPath = 'morchid-ai-service/config.py';
  const configContent = readEnvFile(configPath);
  if (configContent) {
    let updated = configContent;
    updated = updated.replace(
      /SUPABASE_URL = os\.getenv\("SUPABASE_URL", ".*"\)/g,
      `SUPABASE_URL = os.getenv("SUPABASE_URL", "${OLD_SUPABASE_URL}")`
    );
    updated = updated.replace(
      /SUPABASE_ANON_KEY = os\.getenv\("SUPABASE_ANON_KEY", ".*"\)/g,
      `SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "${OLD_SUPABASE_ANON_KEY}")`
    );
    
    if (writeEnvFile(configPath, updated)) {
      logSuccess(`Updated ${configPath}`);
      successCount++;
    } else {
      logError(`Failed to update ${configPath}`);
      failCount++;
    }
  }
  
  console.log();
  logInfo('Switch Summary:');
  console.log(`  Successful updates: ${successCount}`);
  console.log(`  Failed updates: ${failCount}`);
  
  if (failCount === 0) {
    logSuccess('Successfully switched back to old Supabase!');
    logInfo('Next steps:');
    console.log('  1. Run: node supabase-env-manager.js test');
    console.log('  2. Restart your application');
  } else {
    logWarning('Some files could not be updated. Please check the errors above.');
  }
}

// Show configuration info
function showInfo() {
  logHeader('Supabase Environment Manager');
  
  console.log('This tool helps manage the transition between Supabase instances.');
  console.log();
  
  logInfo('Available Commands:');
  console.log('  check          - Check current configuration');
  console.log('  test           - Test Supabase connections');
  console.log('  switch         - Switch to VPS Supabase');
  console.log('  switch-back    - Switch back to old Supabase');
  console.log('  info           - Show this help message');
  console.log();
  
  logInfo('Supabase Instances:');
  console.log('  Old Supabase:');
  console.log(`    URL: ${OLD_SUPABASE_URL}`);
  console.log(`    Anon Key: ${OLD_SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log();
  console.log('  VPS Supabase:');
  console.log(`    URL: ${NEW_VPS_SUPABASE_URL}`);
  console.log(`    Anon Key: ${NEW_VPS_SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log();
  
  logInfo('Files That Will Be Updated:');
  [...ENV_FILES, ...PYTHON_ENV_FILES, 'morchid-ai-service/config.py'].forEach(file => {
    console.log(`  - ${file}`);
  });
}

// Main function
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      checkConfiguration();
      break;
    case 'test':
      await testBothConnections();
      break;
    case 'switch':
      switchToVPS();
      break;
    case 'switch-back':
      switchBackToOld();
      break;
    case 'info':
    case 'help':
    case undefined:
      showInfo();
      break;
    default:
      logError(`Unknown command: ${command}`);
      console.log();
      showInfo();
      process.exit(1);
  }
}

// Run the script
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

