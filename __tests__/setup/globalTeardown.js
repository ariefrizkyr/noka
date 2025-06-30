// Global teardown that runs once after all test suites
module.exports = async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up any global resources
  if (globalThis.__TEST_CONFIG__) {
    delete globalThis.__TEST_CONFIG__;
  }
  
  console.log('✅ Test environment cleanup complete');
};