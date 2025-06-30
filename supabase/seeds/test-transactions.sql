-- Test Transactions Seed Script for Noka Financial Tracker
-- This file creates comprehensive transaction scenarios for testing dashboard functions
-- Includes realistic transaction patterns over multiple months for various financial scenarios

-- =============================================================================
-- NOTE: Helper functions are defined in the main seed.sql file
-- =============================================================================

-- =============================================================================
-- RECURRING INCOME TRANSACTIONS (6 months of data)
-- =============================================================================

-- Monthly salary (consistent primary income)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
-- Last 6 months of salary
('income', 5000.00, 'Monthly Salary - Current Month', generate_transaction_date(0), 
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1)),
('income', 5000.00, 'Monthly Salary - 1 Month Ago', generate_transaction_date(1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1)),
('income', 5000.00, 'Monthly Salary - 2 Months Ago', generate_transaction_date(2),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1)),
('income', 5000.00, 'Monthly Salary - 3 Months Ago', generate_transaction_date(3),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1)),
('income', 5000.00, 'Monthly Salary - 4 Months Ago', generate_transaction_date(4),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1)),
('income', 5000.00, 'Monthly Salary - 5 Months Ago', generate_transaction_date(5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Salary' AND type = 'income' LIMIT 1));

-- Freelance income (variable amounts and timing)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('income', 1200.00, 'Web Development Project', generate_transaction_date(0, 15),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Freelance Work' AND type = 'income' LIMIT 1)),
('income', 800.00, 'Consulting Work', generate_transaction_date(1, 20),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Freelance Work' AND type = 'income' LIMIT 1)),
('income', 1500.00, 'Large Project Completion', generate_transaction_date(2, 10),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Freelance Work' AND type = 'income' LIMIT 1)),
('income', 600.00, 'Small Website Project', generate_transaction_date(3, 25),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Freelance Work' AND type = 'income' LIMIT 1));

-- Investment income (quarterly and monthly)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('income', 450.00, 'Stock Dividends Q1', generate_transaction_date(0, 28),
 (SELECT id FROM accounts WHERE name = 'Stock Portfolio' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Investment Returns' AND type = 'income' LIMIT 1)),
('income', 425.00, 'Stock Dividends Q4', generate_transaction_date(3, 28),
 (SELECT id FROM accounts WHERE name = 'Stock Portfolio' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Investment Returns' AND type = 'income' LIMIT 1)),
('income', 125.00, 'Crypto Staking Rewards', generate_transaction_date(0, 1),
 (SELECT id FROM accounts WHERE name = 'Crypto Wallet' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Investment Returns' AND type = 'income' LIMIT 1)),
('income', 110.00, 'Crypto Staking Rewards', generate_transaction_date(1, 1),
 (SELECT id FROM accounts WHERE name = 'Crypto Wallet' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Investment Returns' AND type = 'income' LIMIT 1));

-- Rental income (monthly)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('income', 800.00, 'Rental Property Income', generate_transaction_date(0, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Rental Income' AND type = 'income' LIMIT 1)),
('income', 800.00, 'Rental Property Income', generate_transaction_date(1, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Rental Income' AND type = 'income' LIMIT 1)),
('income', 800.00, 'Rental Property Income', generate_transaction_date(2, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Rental Income' AND type = 'income' LIMIT 1));

-- =============================================================================
-- RECURRING EXPENSE TRANSACTIONS (Monthly patterns)
-- =============================================================================

-- Housing expenses (monthly, consistent)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
-- Rent/mortgage payments
('expense', 1500.00, 'Monthly Rent', generate_transaction_date(0, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Rent/Mortgage' AND type = 'expense' LIMIT 1)),
('expense', 1500.00, 'Monthly Rent', generate_transaction_date(1, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Rent/Mortgage' AND type = 'expense' LIMIT 1)),
('expense', 1500.00, 'Monthly Rent', generate_transaction_date(2, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Rent/Mortgage' AND type = 'expense' LIMIT 1));

-- Utilities (monthly, variable amounts)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 180.00, 'Electricity Bill', generate_transaction_date(0, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Electricity' AND type = 'expense' LIMIT 1)),
('expense', 165.00, 'Electricity Bill', generate_transaction_date(1, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Electricity' AND type = 'expense' LIMIT 1)),
('expense', 210.00, 'Electricity Bill (Summer)', generate_transaction_date(2, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Electricity' AND type = 'expense' LIMIT 1)),
('expense', 60.00, 'Internet Bill', generate_transaction_date(0, 10),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Internet' AND type = 'expense' LIMIT 1)),
('expense', 60.00, 'Internet Bill', generate_transaction_date(1, 10),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Internet' AND type = 'expense' LIMIT 1));

-- =============================================================================
-- GROCERY AND FOOD TRANSACTIONS (Weekly patterns)
-- =============================================================================

-- Weekly grocery shopping (realistic variability)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
-- Current month groceries
('expense', 125.00, 'Weekly Groceries - Week 4', generate_transaction_date(0, 25),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),
('expense', 89.50, 'Weekly Groceries - Week 3', generate_transaction_date(0, 18),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),
('expense', 156.75, 'Weekly Groceries - Week 2', generate_transaction_date(0, 11),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),
('expense', 98.30, 'Weekly Groceries - Week 1', generate_transaction_date(0, 4),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),

-- Previous month groceries
('expense', 110.20, 'Weekly Groceries', generate_transaction_date(1, 26),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),
('expense', 134.80, 'Weekly Groceries', generate_transaction_date(1, 19),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),
('expense', 87.45, 'Weekly Groceries', generate_transaction_date(1, 12),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1)),
('expense', 142.60, 'Weekly Groceries', generate_transaction_date(1, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Groceries' AND type = 'expense' LIMIT 1));

-- Dining out (irregular patterns)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 45.00, 'Lunch with Colleagues', generate_transaction_date(0, 22),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Dining Out' AND type = 'expense' LIMIT 1)),
('expense', 78.50, 'Date Night Dinner', generate_transaction_date(0, 14),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Dining Out' AND type = 'expense' LIMIT 1)),
('expense', 23.40, 'Quick Lunch', generate_transaction_date(0, 8),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Dining Out' AND type = 'expense' LIMIT 1)),
('expense', 156.80, 'Birthday Celebration', generate_transaction_date(1, 15),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Dining Out' AND type = 'expense' LIMIT 1));

-- =============================================================================
-- TRANSPORTATION EXPENSES
-- =============================================================================

-- Gas purchases (bi-weekly pattern)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 55.00, 'Gas Station Fill-up', generate_transaction_date(0, 20),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Gasoline' AND type = 'expense' LIMIT 1)),
('expense', 48.75, 'Gas Station Fill-up', generate_transaction_date(0, 6),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Gasoline' AND type = 'expense' LIMIT 1)),
('expense', 52.30, 'Gas Station Fill-up', generate_transaction_date(1, 23),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Gasoline' AND type = 'expense' LIMIT 1)),
('expense', 61.20, 'Gas Station Fill-up', generate_transaction_date(1, 9),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Gasoline' AND type = 'expense' LIMIT 1));

-- Parking and transportation
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 25.00, 'Downtown Parking', generate_transaction_date(0, 15),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Parking' AND type = 'expense' LIMIT 1)),
('expense', 12.50, 'Airport Parking', generate_transaction_date(1, 8),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Parking' AND type = 'expense' LIMIT 1)),
('expense', 35.00, 'Uber Ride', generate_transaction_date(0, 12),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Rideshare/Taxi' AND type = 'expense' LIMIT 1));

-- =============================================================================
-- SUBSCRIPTION AND RECURRING SERVICES
-- =============================================================================

-- Monthly subscriptions
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 15.99, 'Netflix Subscription', generate_transaction_date(0, 1),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Streaming Services' AND type = 'expense' LIMIT 1)),
('expense', 15.99, 'Netflix Subscription', generate_transaction_date(1, 1),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Streaming Services' AND type = 'expense' LIMIT 1)),
('expense', 12.99, 'Spotify Premium', generate_transaction_date(0, 3),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Streaming Services' AND type = 'expense' LIMIT 1)),
('expense', 12.99, 'Spotify Premium', generate_transaction_date(1, 3),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Streaming Services' AND type = 'expense' LIMIT 1)),
('expense', 80.00, 'Phone Bill', generate_transaction_date(0, 8),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Phone' AND type = 'expense' LIMIT 1)),
('expense', 80.00, 'Phone Bill', generate_transaction_date(1, 8),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Phone' AND type = 'expense' LIMIT 1));

-- Gym and fitness
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 50.00, 'Gym Membership', generate_transaction_date(0, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Gym Membership' AND type = 'expense' LIMIT 1)),
('expense', 50.00, 'Gym Membership', generate_transaction_date(1, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Gym Membership' AND type = 'expense' LIMIT 1));

-- =============================================================================
-- CREDIT CARD SCENARIOS AND TRANSACTIONS
-- =============================================================================

-- Credit card purchases (various amounts and categories)
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
-- Shopping transactions on credit cards
('expense', 200.00, 'Clothing Shopping', generate_transaction_date(0, 8),
 (SELECT id FROM accounts WHERE name = 'Rewards Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Clothing' AND type = 'expense' LIMIT 1)),
('expense', 89.99, 'Online Purchase - Electronics', generate_transaction_date(0, 16),
 (SELECT id FROM accounts WHERE name = 'Rewards Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Shopping' AND type = 'expense' LIMIT 1)),
('expense', 156.75, 'Home Improvement Store', generate_transaction_date(1, 12),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Home Maintenance' AND type = 'expense' LIMIT 1)),

-- Credit card refunds (negative expense amounts)
('expense', -45.50, 'Return - Clothing Item', generate_transaction_date(0, 19),
 (SELECT id FROM accounts WHERE name = 'Rewards Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Clothing' AND type = 'expense' LIMIT 1)),
('expense', -23.99, 'Amazon Return', generate_transaction_date(1, 7),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Shopping' AND type = 'expense' LIMIT 1));

-- =============================================================================
-- TRANSFER TRANSACTIONS (Between accounts)
-- =============================================================================

-- Monthly savings transfers
INSERT INTO transactions (type, amount, description, transaction_date, from_account_id, to_account_id) VALUES
('transfer', 1000.00, 'Monthly Emergency Fund Contribution', generate_transaction_date(0, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Emergency Savings' LIMIT 1)),
('transfer', 1000.00, 'Monthly Emergency Fund Contribution', generate_transaction_date(1, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Emergency Savings' LIMIT 1)),
('transfer', 500.00, 'Vacation Fund Contribution', generate_transaction_date(0, 15),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Vacation Fund' LIMIT 1)),
('transfer', 500.00, 'Vacation Fund Contribution', generate_transaction_date(1, 15),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Vacation Fund' LIMIT 1));

-- Credit card payments (transfers to credit cards)
INSERT INTO transactions (type, amount, description, transaction_date, from_account_id, to_account_id) VALUES
('transfer', 800.00, 'Credit Card Payment', generate_transaction_date(0, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1)),
('transfer', 800.00, 'Credit Card Payment', generate_transaction_date(1, 5),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1)),
('transfer', 300.00, 'Rewards Card Payment', generate_transaction_date(0, 10),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Rewards Credit Card' LIMIT 1)),
('transfer', 300.00, 'Rewards Card Payment', generate_transaction_date(1, 10),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Rewards Credit Card' LIMIT 1));

-- Investment contributions
INSERT INTO transactions (type, amount, description, transaction_date, from_account_id, to_account_id) VALUES
('transfer', 600.00, 'Monthly 401k Contribution', generate_transaction_date(0, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = '401k Retirement' LIMIT 1)),
('transfer', 600.00, 'Monthly 401k Contribution', generate_transaction_date(1, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = '401k Retirement' LIMIT 1)),
('transfer', 500.00, 'IRA Contribution', generate_transaction_date(0, 15),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Roth IRA' LIMIT 1)),
('transfer', 500.00, 'IRA Contribution', generate_transaction_date(1, 15),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Roth IRA' LIMIT 1));

-- Cash advances (from credit card to checking)
INSERT INTO transactions (type, amount, description, transaction_date, from_account_id, to_account_id) VALUES
('transfer', 200.00, 'Emergency Cash Advance', generate_transaction_date(2, 20),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1));

-- =============================================================================
-- LARGE AND IRREGULAR TRANSACTIONS
-- =============================================================================

-- Annual or semi-annual large expenses
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('expense', 1200.00, 'Car Insurance - 6 months', generate_transaction_date(3, 1),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Car Insurance' AND type = 'expense' LIMIT 1)),
('expense', 800.00, 'Car Maintenance - Major Service', generate_transaction_date(2, 15),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Car Maintenance' AND type = 'expense' LIMIT 1)),
('expense', 2500.00, 'Vacation - Flight and Hotel', generate_transaction_date(1, 20),
 (SELECT id FROM accounts WHERE name = 'Main Credit Card' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Travel' AND type = 'expense' LIMIT 1));

-- One-time income
INSERT INTO transactions (type, amount, description, transaction_date, account_id, category_id) VALUES
('income', 2000.00, 'Annual Bonus', generate_transaction_date(3, 15),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Bonus' AND type = 'income' LIMIT 1)),
('income', 800.00, 'Tax Refund', generate_transaction_date(2, 28),
 (SELECT id FROM accounts WHERE name = 'Primary Checking' LIMIT 1),
 (SELECT id FROM categories WHERE name = 'Tax Refund' AND type = 'income' LIMIT 1));

-- =============================================================================
-- TRANSACTION SUMMARY
-- =============================================================================

-- Generate transaction summary
DO $$
DECLARE
    total_transactions INTEGER;
    income_transactions INTEGER;
    expense_transactions INTEGER;
    transfer_transactions INTEGER;
    total_income DECIMAL(15,2);
    total_expenses DECIMAL(15,2);
    total_transfers DECIMAL(15,2);
    net_income DECIMAL(15,2);
BEGIN
    SELECT count(*) INTO total_transactions FROM transactions;
    SELECT count(*) INTO income_transactions FROM transactions WHERE type = 'income';
    SELECT count(*) INTO expense_transactions FROM transactions WHERE type = 'expense';
    SELECT count(*) INTO transfer_transactions FROM transactions WHERE type = 'transfer';
    
    SELECT COALESCE(sum(amount), 0) INTO total_income FROM transactions WHERE type = 'income';
    SELECT COALESCE(sum(amount), 0) INTO total_expenses FROM transactions WHERE type = 'expense';
    SELECT COALESCE(sum(amount), 0) INTO total_transfers FROM transactions WHERE type = 'transfer';
    
    net_income := total_income - total_expenses;
    
    RAISE NOTICE '=== TEST TRANSACTIONS SUMMARY ===';
    RAISE NOTICE 'Total transactions created: %', total_transactions;
    RAISE NOTICE '';
    RAISE NOTICE 'By transaction type:';
    RAISE NOTICE '- Income transactions: %', income_transactions;
    RAISE NOTICE '- Expense transactions: %', expense_transactions;
    RAISE NOTICE '- Transfer transactions: %', transfer_transactions;
    RAISE NOTICE '';
    RAISE NOTICE 'Financial summary (6 months):';
    RAISE NOTICE '- Total income: $%', total_income;
    RAISE NOTICE '- Total expenses: $%', total_expenses;
    RAISE NOTICE '- Total transfers: $%', total_transfers;
    RAISE NOTICE '- Net income: $%', net_income;
    RAISE NOTICE '';
    RAISE NOTICE 'Transaction patterns included:';
    RAISE NOTICE '- Monthly recurring income (salary, rent)';
    RAISE NOTICE '- Variable income (freelance, investments)';
    RAISE NOTICE '- Weekly grocery shopping patterns';
    RAISE NOTICE '- Bi-weekly gas purchases';
    RAISE NOTICE '- Monthly subscription services';
    RAISE NOTICE '- Credit card purchase scenarios';
    RAISE NOTICE '- Credit card payment transfers';
    RAISE NOTICE '- Investment contribution transfers';
    RAISE NOTICE '- Savings account transfers';
    RAISE NOTICE '- Large irregular expenses';
    RAISE NOTICE '- Refunds and returns (negative amounts)';
    RAISE NOTICE '- Cash advance scenarios';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Test transactions ready for dashboard function testing!';
END $$;