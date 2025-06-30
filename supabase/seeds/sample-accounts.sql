-- Sample Accounts Seed Script for Noka Financial Tracker
-- This file creates various account examples demonstrating different financial scenarios
-- These accounts represent realistic financial situations for testing and development

-- =============================================================================
-- BANK ACCOUNTS (Checking and Savings)
-- =============================================================================

-- Primary checking accounts with different balance scenarios
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
-- Main checking accounts
('Primary Checking', 'bank_account', 2500.00, 2500.00, true),
('Secondary Checking', 'bank_account', 800.00, 800.00, true),
('Business Checking', 'bank_account', 5000.00, 5000.00, true),
('Joint Checking', 'bank_account', 3200.00, 3200.00, true),

-- Savings accounts with various purposes
('Emergency Savings', 'bank_account', 10000.00, 10000.00, true),
('High Yield Savings', 'bank_account', 15000.00, 15000.00, true),
('Vacation Fund', 'bank_account', 3000.00, 3000.00, true),
('House Down Payment', 'bank_account', 25000.00, 25000.00, true),
('Car Fund', 'bank_account', 8000.00, 8000.00, true),
('Wedding Fund', 'bank_account', 12000.00, 12000.00, true),
('Baby Fund', 'bank_account', 4500.00, 4500.00, true),
('Holiday Fund', 'bank_account', 1500.00, 1500.00, true),

-- Money market and specialized savings
('Money Market Account', 'bank_account', 20000.00, 20000.00, true),
('CD Account 1 Year', 'bank_account', 10000.00, 10000.00, true),
('CD Account 5 Year', 'bank_account', 25000.00, 25000.00, true),
('Health Savings Account', 'bank_account', 3500.00, 3500.00, true),

-- Business and specialized accounts
('Business Savings', 'bank_account', 18000.00, 18000.00, true),
('Tax Savings', 'bank_account', 6000.00, 6000.00, true),
('Equipment Fund', 'bank_account', 4000.00, 4000.00, true);

-- =============================================================================
-- CREDIT CARD ACCOUNTS (Various balance scenarios)
-- =============================================================================

-- Credit cards with different balance situations
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
-- Credit cards with balances (debt)
('Main Credit Card', 'credit_card', 1500.00, 1500.00, true),
('Rewards Credit Card', 'credit_card', 800.00, 800.00, true),
('Travel Credit Card', 'credit_card', 2200.00, 2200.00, true),
('Store Credit Card', 'credit_card', 450.00, 450.00, true),
('Gas Station Card', 'credit_card', 280.00, 280.00, true),

-- Credit cards with no balance
('Backup Credit Card', 'credit_card', 0.00, 0.00, true),
('Business Credit Card', 'credit_card', 3500.00, 3500.00, true),
('Emergency Credit Card', 'credit_card', 0.00, 0.00, true),

-- Credit cards with credit balances (overpayments)
('Cashback Credit Card', 'credit_card', -150.00, -150.00, true),
('Department Store Card', 'credit_card', 0.00, 0.00, true),

-- High balance scenarios for testing
('High Balance Card', 'credit_card', 8500.00, 8500.00, true),
('Consolidation Card', 'credit_card', 12000.00, 12000.00, true);

-- =============================================================================
-- INVESTMENT ACCOUNTS (Different types and balance ranges)
-- =============================================================================

-- Retirement accounts
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('401k Retirement', 'investment_account', 75000.00, 75000.00, true),
('Roth IRA', 'investment_account', 15000.00, 15000.00, true),
('Traditional IRA', 'investment_account', 25000.00, 25000.00, true),
('SEP IRA', 'investment_account', 45000.00, 45000.00, true),
('Solo 401k', 'investment_account', 38000.00, 38000.00, true),

-- Taxable investment accounts
('Stock Portfolio', 'investment_account', 12500.00, 12500.00, true),
('Growth Portfolio', 'investment_account', 8800.00, 8800.00, true),
('Dividend Portfolio', 'investment_account', 18500.00, 18500.00, true),
('Bond Portfolio', 'investment_account', 22000.00, 22000.00, true),
('International Fund', 'investment_account', 9500.00, 9500.00, true),

-- Alternative investments
('Crypto Wallet', 'investment_account', 2800.00, 2800.00, true),
('Real Estate Fund', 'investment_account', 35000.00, 35000.00, true),
('REIT Portfolio', 'investment_account', 15500.00, 15500.00, true),
('Commodities Fund', 'investment_account', 5200.00, 5200.00, true),
('Precious Metals', 'investment_account', 8800.00, 8800.00, true),

-- Education and goal-based investments
('529 Education Plan', 'investment_account', 12000.00, 12000.00, true),
('Coverdell ESA', 'investment_account', 4500.00, 4500.00, true),

-- Business investments
('Business Investment', 'investment_account', 50000.00, 50000.00, true),
('Startup Investment', 'investment_account', 15000.00, 15000.00, true),

-- Conservative investments
('Treasury Bills', 'investment_account', 25000.00, 25000.00, true),
('Government Bonds', 'investment_account', 18000.00, 18000.00, true);

-- =============================================================================
-- ACCOUNT SCENARIOS FOR DIFFERENT USER PROFILES
-- =============================================================================

-- Additional accounts representing different life stages and financial situations

-- Young Professional (just starting career)
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Student Checking', 'bank_account', 800.00, 800.00, true),
('Student Credit Card', 'credit_card', 1200.00, 1200.00, true),
('Starter Emergency Fund', 'bank_account', 2000.00, 2000.00, true),
('First 401k', 'investment_account', 3500.00, 3500.00, true);

-- Family with Children
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Family Checking', 'bank_account', 4500.00, 4500.00, true),
('Kids Activities Fund', 'bank_account', 1200.00, 1200.00, true),
('College Savings 529', 'investment_account', 18000.00, 18000.00, true),
('Family Emergency Fund', 'bank_account', 15000.00, 15000.00, true);

-- Pre-retirement (high savings phase)
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Pre-retirement Checking', 'bank_account', 6000.00, 6000.00, true),
('Retirement Savings', 'bank_account', 35000.00, 35000.00, true),
('Maxed 401k', 'investment_account', 285000.00, 285000.00, true),
('Taxable Investments', 'investment_account', 150000.00, 150000.00, true);

-- Small Business Owner
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Business Operating', 'bank_account', 12000.00, 12000.00, true),
('Business Savings', 'bank_account', 25000.00, 25000.00, true),
('Business Credit Line', 'credit_card', 5500.00, 5500.00, true),
('Business Investment', 'investment_account', 75000.00, 75000.00, true);

-- =============================================================================
-- INACTIVE AND CLOSED ACCOUNTS (for testing account lifecycle)
-- =============================================================================

-- Some inactive accounts to test filtering and display
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Old Checking Account', 'bank_account', 0.00, 0.00, false),
('Closed Credit Card', 'credit_card', 0.00, 0.00, false),
('Transferred 401k', 'investment_account', 0.00, 0.00, false),
('Paid Off Loan Account', 'bank_account', 0.00, 0.00, false);

-- =============================================================================
-- ACCOUNT STATISTICS AND SUMMARY
-- =============================================================================

DO $$
DECLARE
    total_accounts INTEGER;
    bank_accounts INTEGER;
    credit_cards INTEGER;
    investment_accounts INTEGER;
    active_accounts INTEGER;
    total_bank_balance DECIMAL(15,2);
    total_credit_debt DECIMAL(15,2);
    total_investments DECIMAL(15,2);
    net_worth DECIMAL(15,2);
BEGIN
    SELECT count(*) INTO total_accounts FROM accounts;
    SELECT count(*) INTO bank_accounts FROM accounts WHERE type = 'bank_account';
    SELECT count(*) INTO credit_cards FROM accounts WHERE type = 'credit_card';
    SELECT count(*) INTO investment_accounts FROM accounts WHERE type = 'investment_account';
    SELECT count(*) INTO active_accounts FROM accounts WHERE is_active = true;
    
    -- Calculate total balances by account type
    SELECT COALESCE(sum(current_balance), 0) INTO total_bank_balance 
    FROM accounts WHERE type = 'bank_account' AND is_active = true;
    
    SELECT COALESCE(sum(current_balance), 0) INTO total_credit_debt 
    FROM accounts WHERE type = 'credit_card' AND is_active = true;
    
    SELECT COALESCE(sum(current_balance), 0) INTO total_investments 
    FROM accounts WHERE type = 'investment_account' AND is_active = true;
    
    net_worth := total_bank_balance + total_investments - total_credit_debt;
    
    RAISE NOTICE '=== SAMPLE ACCOUNTS SUMMARY ===';
    RAISE NOTICE 'Total accounts created: %', total_accounts;
    RAISE NOTICE 'Active accounts: %', active_accounts;
    RAISE NOTICE '';
    RAISE NOTICE 'By account type:';
    RAISE NOTICE '- Bank accounts: %', bank_accounts;
    RAISE NOTICE '- Credit cards: %', credit_cards;
    RAISE NOTICE '- Investment accounts: %', investment_accounts;
    RAISE NOTICE '';
    RAISE NOTICE 'Financial summary (sample data):';
    RAISE NOTICE '- Total bank balance: $%', total_bank_balance;
    RAISE NOTICE '- Total credit debt: $%', total_credit_debt;
    RAISE NOTICE '- Total investments: $%', total_investments;
    RAISE NOTICE '- Net worth: $%', net_worth;
    RAISE NOTICE '';
    RAISE NOTICE 'Account scenarios included:';
    RAISE NOTICE '- Young professional starting career';
    RAISE NOTICE '- Family with children and education savings';
    RAISE NOTICE '- Pre-retirement high savings phase';
    RAISE NOTICE '- Small business owner accounts';
    RAISE NOTICE '- Various credit card balance situations';
    RAISE NOTICE '- Diverse investment portfolio types';
    RAISE NOTICE '- Emergency and goal-based savings';
    RAISE NOTICE '==============================';
END $$;