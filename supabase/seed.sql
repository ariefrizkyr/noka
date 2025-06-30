-- Main Seed File for Noka Financial Tracker
-- This file provides comprehensive sample data for development and testing
-- It creates realistic financial data scenarios for testing dashboard functions

-- =============================================================================
-- HELPER FUNCTIONS FOR SEEDING
-- =============================================================================

-- Create a function to generate dates for the last 6 months
CREATE OR REPLACE FUNCTION generate_transaction_date(months_ago INTEGER, day_of_month INTEGER DEFAULT 1)
RETURNS DATE AS $$
BEGIN
    RETURN (CURRENT_DATE - INTERVAL '1 month' * months_ago + INTERVAL '1 day' * (day_of_month - EXTRACT(DAY FROM CURRENT_DATE - INTERVAL '1 month' * months_ago)))::DATE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE CATEGORIES WITH ICONS AND BUDGET TEMPLATES
-- =============================================================================

-- Note: These categories are created without user_id for global reference
-- In production, categories should be created per user through the application
-- This seed data is for development and testing purposes only

-- Income Categories
INSERT INTO categories (name, type, icon, budget_amount, budget_frequency, is_active) VALUES
-- Primary income sources
('Salary', 'income', '💰', 5000.00, 'monthly', true),
('Freelance Work', 'income', '💼', 1500.00, 'monthly', true),
('Business Income', 'income', '🏢', 2000.00, 'monthly', true),
('Investment Returns', 'income', '📈', 500.00, 'monthly', true),
('Rental Income', 'income', '🏠', 800.00, 'monthly', true),
('Side Hustle', 'income', '💻', 600.00, 'monthly', true),
-- Occasional income
('Gifts', 'income', '🎁', NULL, NULL, true),
('Tax Refund', 'income', '🧾', NULL, NULL, true),
('Bonus', 'income', '🎉', NULL, NULL, true),
('Other Income', 'income', '💵', NULL, NULL, true);

-- Expense Categories with realistic budget amounts
INSERT INTO categories (name, type, icon, budget_amount, budget_frequency, is_active) VALUES
-- Essential expenses
('Groceries', 'expense', '🍕', 600.00, 'monthly', true),
('Transportation', 'expense', '🚗', 400.00, 'monthly', true),
('Housing', 'expense', '🏠', 1500.00, 'monthly', true),
('Utilities', 'expense', '💡', 200.00, 'monthly', true),
('Healthcare', 'expense', '⚕️', 300.00, 'monthly', true),
('Insurance', 'expense', '🛡️', 250.00, 'monthly', true),
('Phone', 'expense', '📱', 80.00, 'monthly', true),
('Internet', 'expense', '🌐', 60.00, 'monthly', true),
-- Lifestyle expenses
('Entertainment', 'expense', '🎬', 200.00, 'monthly', true),
('Dining Out', 'expense', '🍽️', 300.00, 'monthly', true),
('Shopping', 'expense', '🛒', 400.00, 'monthly', true),
('Fitness', 'expense', '💪', 100.00, 'monthly', true),
('Subscriptions', 'expense', '📺', 50.00, 'monthly', true),
('Personal Care', 'expense', '💄', 100.00, 'monthly', true),
('Travel', 'expense', '✈️', 500.00, 'monthly', true),
('Education', 'expense', '📚', 200.00, 'monthly', true),
-- Financial expenses
('Loan Payment', 'expense', '🏦', 800.00, 'monthly', true),
('Credit Card Payment', 'expense', '💳', 500.00, 'monthly', true),
('Bank Fees', 'expense', '🏪', 50.00, 'monthly', true),
-- Irregular expenses
('Gifts', 'expense', '🎁', 200.00, 'monthly', true),
('Charity', 'expense', '❤️', 100.00, 'monthly', true),
('Emergency Fund', 'expense', '🚨', 300.00, 'monthly', true),
('Car Maintenance', 'expense', '🔧', 100.00, 'monthly', true),
('Home Maintenance', 'expense', '🏠', 150.00, 'monthly', true),
('Other Expenses', 'expense', '📋', NULL, NULL, true);

-- Investment Categories
INSERT INTO categories (name, type, icon, budget_amount, budget_frequency, is_active) VALUES
('Stock Market', 'investment', '📊', 1000.00, 'monthly', true),
('Bonds', 'investment', '📜', 500.00, 'monthly', true),
('Cryptocurrency', 'investment', '₿', 300.00, 'monthly', true),
('Real Estate', 'investment', '🏘️', 2000.00, 'monthly', true),
('Retirement Fund', 'investment', '🏦', 800.00, 'monthly', true),
('Emergency Fund', 'investment', '🛡️', 500.00, 'monthly', true),
('Education Fund', 'investment', '🎓', 300.00, 'monthly', true),
('Mutual Funds', 'investment', '📈', 600.00, 'monthly', true);

-- =============================================================================
-- SAMPLE ACCOUNTS FOR DIFFERENT SCENARIOS
-- =============================================================================

-- Sample accounts for a typical user scenario
-- Note: In real usage, these would be created by users through the application
-- This seed data is for development and testing purposes

-- The accounts will be created with initial balances that reflect realistic scenarios
-- These accounts demonstrate various account types and balance situations

-- Main checking account (primary spending account)
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Primary Checking', 'bank_account', 2500.00, 2500.00, true);

-- Savings accounts
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Emergency Savings', 'bank_account', 10000.00, 10000.00, true),
('Vacation Fund', 'bank_account', 3000.00, 3000.00, true),
('House Down Payment', 'bank_account', 25000.00, 25000.00, true);

-- Credit cards with realistic balances
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Main Credit Card', 'credit_card', 1500.00, 1500.00, true),
('Rewards Credit Card', 'credit_card', 800.00, 800.00, true),
('Store Credit Card', 'credit_card', 0.00, 0.00, true);

-- Investment accounts
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('401k Retirement', 'investment_account', 75000.00, 75000.00, true),
('Roth IRA', 'investment_account', 15000.00, 15000.00, true),
('Stock Portfolio', 'investment_account', 12500.00, 12500.00, true),
('Crypto Wallet', 'investment_account', 2800.00, 2800.00, true);

-- =============================================================================
-- SAMPLE TRANSACTIONS FOR REALISTIC SCENARIOS
-- =============================================================================

-- Note: These sample transactions demonstrate various financial scenarios
-- In production, transactions are created by users through the application
-- This seed data helps test dashboard functions and balance calculations

-- Sample income transactions (last 3 months)
-- Monthly salary (consistent income)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('income', 5000.00, 'Monthly Salary - March', '2024-03-01', 
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1)),
('income', 5000.00, 'Monthly Salary - February', '2024-02-01',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1)),
('income', 5000.00, 'Monthly Salary - January', '2024-01-01',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1));

-- Freelance income (variable)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('income', 1200.00, 'Web Development Project', '2024-03-15',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Freelance Work' AND type = 'income' LIMIT 1)),
('income', 800.00, 'Consulting Work', '2024-02-20',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Freelance Work' AND type = 'income' LIMIT 1));

-- Investment returns
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('income', 450.00, 'Stock Dividends Q1', '2024-03-30',
 (SELECT id FROM accounts WHERE name = 'Stock Portfolio' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Investment Returns' AND type = 'income' LIMIT 1)),
('income', 125.00, 'Crypto Staking Rewards', '2024-03-01',
 (SELECT id FROM accounts WHERE name = 'Crypto Wallet' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Investment Returns' AND type = 'income' LIMIT 1));

-- Sample expense transactions (realistic spending patterns)
-- Housing expenses
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 1500.00, 'Rent Payment - March', '2024-03-01',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Housing' AND type = 'expense' LIMIT 1)),
('expense', 180.00, 'Electricity Bill', '2024-03-05',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Utilities' AND type = 'expense' LIMIT 1)),
('expense', 60.00, 'Internet Bill', '2024-03-10',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Internet' AND type = 'expense' LIMIT 1));

-- Food and groceries
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 125.00, 'Weekly Groceries', '2024-03-25',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),
('expense', 89.50, 'Weekly Groceries', '2024-03-18',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),
('expense', 45.00, 'Lunch with Colleagues', '2024-03-22',
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Dining Out' AND type = 'expense' LIMIT 1));

-- Transportation
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 55.00, 'Gas Station', '2024-03-20',
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Transportation' AND type = 'expense' LIMIT 1)),
('expense', 25.00, 'Parking Fee', '2024-03-15',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Transportation' AND type = 'expense' LIMIT 1));

-- Entertainment and lifestyle
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 15.99, 'Netflix Subscription', '2024-03-01',
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Subscriptions' AND type = 'expense' LIMIT 1)),
('expense', 12.99, 'Movie Tickets', '2024-03-12',
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Entertainment' AND type = 'expense' LIMIT 1)),
('expense', 200.00, 'Shopping - Clothing', '2024-03-08',
 (SELECT id FROM accounts WHERE name = 'Rewards Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Shopping' AND type = 'expense' LIMIT 1));

-- Sample transfer transactions (between accounts)
-- Savings transfers
INSERT INTO transactions (type, amount, description, transaction_date, from_account_id, to_account_id) VALUES
('transfer', 1000.00, 'Monthly Emergency Fund Contribution', '2024-03-01',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Emergency Savings' LIMIT 1)),
('transfer', 500.00, 'Vacation Fund Contribution', '2024-03-15',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Vacation Fund' LIMIT 1));

-- Credit card payments
INSERT INTO transactions (type, amount, description, transaction_date, from_account_id, to_account_id) VALUES
('transfer', 800.00, 'Credit Card Payment', '2024-03-05',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1)),
('transfer', 300.00, 'Rewards Card Payment', '2024-03-10',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Rewards Credit Card' LIMIT 1));

-- Investment contributions
INSERT INTO transactions (type, amount, description, transaction_date, from_account_id, to_account_id) VALUES
('transfer', 600.00, 'Monthly 401k Contribution', '2024-03-01',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = '401k Retirement' LIMIT 1)),
('transfer', 500.00, 'IRA Contribution', '2024-03-15',
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Roth IRA' LIMIT 1));

-- =============================================================================
-- SAMPLE USER SETTINGS
-- =============================================================================

-- Note: These settings are examples for development/testing
-- In production, each user creates their own settings through the application

-- Default user settings template
-- This demonstrates typical user preferences for financial tracking

-- Example user settings (would be created per user in real application)
-- Commented out because user_id needs to be from actual authenticated users
/*
INSERT INTO user_settings (user_id, currency_code, financial_month_start_day, financial_week_start_day, onboarding_completed) VALUES
-- Example settings for different user preferences
(gen_random_uuid(), 'USD', 1, 1, true),   -- Standard calendar month/week
(gen_random_uuid(), 'USD', 15, 1, true),  -- Mid-month financial period
(gen_random_uuid(), 'EUR', 1, 1, true),   -- European user
(gen_random_uuid(), 'GBP', 25, 1, true);  -- UK user with pay-day aligned period
*/

-- =============================================================================
-- VERIFICATION AND STATISTICS
-- =============================================================================

-- Display seeding summary
DO $$
DECLARE
    category_count INTEGER;
    account_count INTEGER;
    transaction_count INTEGER;
BEGIN
    SELECT count(*) INTO category_count FROM categories;
    SELECT count(*) INTO account_count FROM accounts;
    SELECT count(*) INTO transaction_count FROM transactions;
    
    RAISE NOTICE '=== SEED DATA SUMMARY ===';
    RAISE NOTICE 'Categories created: %', category_count;
    RAISE NOTICE 'Sample accounts created: %', account_count;
    RAISE NOTICE 'Sample transactions created: %', transaction_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Income categories: %', (SELECT count(*) FROM categories WHERE type = 'income');
    RAISE NOTICE 'Expense categories: %', (SELECT count(*) FROM categories WHERE type = 'expense');
    RAISE NOTICE 'Investment categories: %', (SELECT count(*) FROM categories WHERE type = 'investment');
    RAISE NOTICE '';
    RAISE NOTICE 'Bank accounts: %', (SELECT count(*) FROM accounts WHERE type = 'bank_account');
    RAISE NOTICE 'Credit cards: %', (SELECT count(*) FROM accounts WHERE type = 'credit_card');
    RAISE NOTICE 'Investment accounts: %', (SELECT count(*) FROM accounts WHERE type = 'investment_account');
    RAISE NOTICE '';
    RAISE NOTICE 'Income transactions: %', (SELECT count(*) FROM transactions WHERE type = 'income');
    RAISE NOTICE 'Expense transactions: %', (SELECT count(*) FROM transactions WHERE type = 'expense');
    RAISE NOTICE 'Transfer transactions: %', (SELECT count(*) FROM transactions WHERE type = 'transfer');
    RAISE NOTICE '========================';
    RAISE NOTICE 'Seed data installation completed successfully!';
    RAISE NOTICE 'The database is now ready for development and testing.';
END $$;

-- =============================================================================
-- CLEANUP HELPER FUNCTIONS
-- =============================================================================

-- Drop the helper function after seeding is complete
DROP FUNCTION IF EXISTS generate_transaction_date(INTEGER, INTEGER);