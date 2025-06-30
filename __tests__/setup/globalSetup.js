// Global setup that runs once before all test suites
const { createClient } = require('@supabase/supabase-js');

module.exports = async function globalSetup() {
  console.log('🚀 Setting up test environment...');
  
  // Ensure we have test environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️  Missing Supabase environment variables for testing');
    console.warn('   Make sure to set up test environment variables');
  }
  
  // Store test configuration globally
  globalThis.__TEST_CONFIG__ = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  
  console.log('✅ Test environment setup complete');
};