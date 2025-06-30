import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Test database client with service role key for admin operations
let testClient: ReturnType<typeof createClient<Database>> | null = null;

export function getTestClient() {
  if (!testClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
    }
    
    testClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
  return testClient;
}

// Test user management
export async function createTestUser(email: string, password: string = 'TestPassword123!') {
  const client = getTestClient();
  
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }
  
  return data.user;
}

export async function deleteTestUser(userId: string) {
  const client = getTestClient();
  
  const { error } = await client.auth.admin.deleteUser(userId);
  
  if (error) {
    throw new Error(`Failed to delete test user: ${error.message}`);
  }
}

// Test data cleanup utilities
export async function cleanupTestData(userId: string) {
  const client = getTestClient();
  
  try {
    // First get account IDs for this user
    const { data: accounts } = await client
      .from('accounts')
      .select('id')
      .eq('user_id', userId);
    
    if (accounts && accounts.length > 0) {
      const accountIds = accounts.map(account => account.id);
      
      // Delete balance ledger entries for these accounts
      await client
        .from('balance_ledger')
        .delete()
        .in('account_id', accountIds);
    }
    
    // Delete in reverse dependency order
    await client.from('transactions').delete().eq('user_id', userId);
    await client.from('categories').delete().eq('user_id', userId);
    await client.from('accounts').delete().eq('user_id', userId);
    await client.from('user_settings').delete().eq('user_id', userId);
    
    console.log(`✅ Cleaned up test data for user: ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to cleanup test data for user ${userId}:`, error);
    throw error;
  }
}

// Test account creation
export async function createTestAccount(
  userId: string, 
  name: string, 
  type: 'bank_account' | 'credit_card' | 'investment_account',
  initialBalance: number = 0
) {
  const client = getTestClient();
  
  const { data, error } = await client
    .from('accounts')
    .insert({
      user_id: userId,
      name,
      type,
      initial_balance: initialBalance,
      current_balance: initialBalance
    })
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to create test account: ${error.message}`);
  }
  
  return data;
}

// Test category creation
export async function createTestCategory(
  userId: string,
  name: string,
  type: 'expense' | 'income' | 'investment',
  budgetAmount?: number,
  budgetFrequency?: 'weekly' | 'monthly' | 'one_time'
) {
  const client = getTestClient();
  
  const { data, error } = await client
    .from('categories')
    .insert({
      user_id: userId,
      name,
      type,
      budget_amount: budgetAmount,
      budget_frequency: budgetFrequency
    })
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to create test category: ${error.message}`);
  }
  
  return data;
}

// Test transaction creation
export async function createTestTransaction(
  userId: string,
  type: 'income' | 'expense' | 'transfer',
  amount: number,
  description: string,
  transactionDate: string,
  accountId?: string,
  categoryId?: string,
  fromAccountId?: string,
  toAccountId?: string
) {
  const client = getTestClient();
  
  const transactionData: any = {
    user_id: userId,
    type,
    amount,
    description,
    transaction_date: transactionDate
  };
  
  if (type === 'transfer') {
    transactionData.from_account_id = fromAccountId;
    transactionData.to_account_id = toAccountId;
  } else {
    transactionData.account_id = accountId;
    transactionData.category_id = categoryId;
  }
  
  const { data, error } = await client
    .from('transactions')
    .insert(transactionData)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to create test transaction: ${error.message}`);
  }
  
  return data;
}

// Get account balance
export async function getAccountBalance(accountId: string) {
  const client = getTestClient();
  
  const { data, error } = await client
    .from('accounts')
    .select('current_balance')
    .eq('id', accountId)
    .single();
    
  if (error) {
    throw new Error(`Failed to get account balance: ${error.message}`);
  }
  
  return data.current_balance;
}

// Get balance ledger entries
export async function getBalanceLedgerEntries(accountId: string) {
  const client = getTestClient();
  
  const { data, error } = await client
    .from('balance_ledger')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: true });
    
  if (error) {
    throw new Error(`Failed to get balance ledger entries: ${error.message}`);
  }
  
  return data;
}