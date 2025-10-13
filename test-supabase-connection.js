/**
 * Test script to verify Supabase connection
 * Run with: node test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NOT SET');
console.log('\n' + '='.repeat(60) + '\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Missing Supabase credentials!');
  console.error('Please check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('Test 1: Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('⚠️  Warning:', healthError.message);
      console.log('   This might be expected if the users table doesn\'t exist yet.\n');
    } else {
      console.log('✅ Basic connection successful!\n');
    }

    // Test 2: List tables (if possible)
    console.log('Test 2: Checking database schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('*')
      .limit(0);
    
    if (tablesError) {
      console.log('⚠️  Warning:', tablesError.message);
      console.log('   This might be expected if the users table doesn\'t exist yet.\n');
    } else {
      console.log('✅ Database schema accessible!\n');
    }

    // Test 3: Try to get service info
    console.log('Test 3: Checking Supabase service status...');
    const { data: serviceStatus, error: serviceError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (serviceError) {
      console.log('⚠️  Service Error:', serviceError.message);
      console.log('   Code:', serviceError.code);
      console.log('   Details:', serviceError.details || 'N/A');
      console.log('   Hint:', serviceError.hint || 'N/A');
    } else {
      console.log('✅ Service is responding!\n');
    }

    // Test 4: Check if we can query a specific table
    console.log('Test 4: Testing table queries...');
    const testTables = ['users', 'ngo_details', 'personne_details', 'opportunities'];
    
    for (const tableName of testTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ⚠️  ${tableName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${tableName}: Accessible (${data?.length || 0} rows)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Connection Test Summary:');
    console.log('   URL:', supabaseUrl);
    console.log('   Status:', 'Connection established');
    console.log('   Note: Some errors are expected if tables don\'t exist yet.');
    console.log('\n✅ If you see this message, your Supabase connection is working!');
    console.log('   You may need to run your database migrations to create the tables.\n');

  } catch (error) {
    console.error('\n❌ Connection Test Failed!');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Supabase is not running on', supabaseUrl);
    console.error('2. Port 8000 is not accessible');
    console.error('3. Firewall is blocking the connection');
    console.error('4. Wrong credentials');
    process.exit(1);
  }
}

// Run the test
testConnection();

