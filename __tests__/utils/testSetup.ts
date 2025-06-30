import { 
  createTestUser, 
  deleteTestUser, 
  cleanupTestData,
  createTestAccount,
  createTestCategory
} from './testDatabase';

export interface TestUser {
  id: string;
  email: string;
  cleanup: () => Promise<void>;
}

export interface TestSetup {
  user: TestUser;
  bankAccount: any;
  creditCardAccount: any;
  expenseCategory: any;
  incomeCategory: any;
  cleanup: () => Promise<void>;
}

/**
 * Creates a test user with a unique email
 */
export async function setupTestUser(namePrefix: string = 'test'): Promise<TestUser> {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const email = `${namePrefix}_${timestamp}_${randomId}@test.com`;
  
  const user = await createTestUser(email);
  
  return {
    id: user.id,
    email: user.email!,
    cleanup: async () => {
      await cleanupTestData(user.id);
      await deleteTestUser(user.id);
    }
  };
}

/**
 * Creates a complete test setup with user, accounts, and categories
 */
export async function setupCreditCardTest(): Promise<TestSetup> {
  const user = await setupTestUser('cctest');
  
  try {
    // Create test accounts
    const bankAccount = await createTestAccount(
      user.id,
      'Test Bank Account',
      'bank_account',
      1000.00
    );
    
    const creditCardAccount = await createTestAccount(
      user.id,
      'Test Credit Card',
      'credit_card',
      0.00 // Start with no debt
    );
    
    // Create test categories
    const expenseCategory = await createTestCategory(
      user.id,
      'Test Expenses',
      'expense'
    );
    
    const incomeCategory = await createTestCategory(
      user.id,
      'Test Income',
      'income'
    );
    
    return {
      user,
      bankAccount,
      creditCardAccount,
      expenseCategory,
      incomeCategory,
      cleanup: async () => {
        await user.cleanup();
      }
    };
  } catch (error) {
    // Clean up user if setup fails
    await user.cleanup();
    throw error;
  }
}

/**
 * Helper to wait for a short delay (useful for timing-sensitive tests)
 */
export function waitMs(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a test transaction date (today by default)
 */
export function getTestDate(daysFromToday: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}