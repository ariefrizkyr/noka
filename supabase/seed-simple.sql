-- Simple Seed File for Noka Financial Tracker
-- This file provides basic sample data that can be loaded without RLS issues
-- Suitable for development and testing environments

-- =============================================================================
-- DEVELOPMENT NOTICE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== NOKA FINANCIAL TRACKER - SIMPLE SEED DATA ===';
    RAISE NOTICE 'This seed file creates basic sample data for development.';
    RAISE NOTICE 'Includes test user: ariefrizkyr@gmail.com with password "omgoogle"';
    RAISE NOTICE 'For full testing, create users through the application first.';
    RAISE NOTICE '================================================';
END $$;

-- =============================================================================
-- TEST USER FOR DEVELOPMENT
-- =============================================================================

-- Create a test user in the auth.users table
-- This allows direct login without registration during development
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'ariefrizkyr@gmail.com',
    crypt('omgoogle', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"email": "ariefrizkyr@gmail.com"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Create corresponding profile entry (if profiles table exists and has trigger)
-- Note: This may be automatically created by trigger, but we ensure it exists
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'ariefrizkyr@gmail.com';
    
    -- Insert into profiles table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        INSERT INTO profiles (id, email, updated_at) 
        VALUES (user_uuid, 'ariefrizkyr@gmail.com', NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Test user created: ariefrizkyr@gmail.com (password: omgoogle)';
        RAISE NOTICE 'User UUID: %', user_uuid;
    END IF;
END $$;

-- =============================================================================
-- BASIC CATEGORIES (without user_id for global reference)
-- =============================================================================

-- Note: These categories won't be visible through the app due to RLS
-- They serve as reference data for development and testing

-- Income Categories
INSERT INTO categories (name, type, icon, budget_amount, budget_frequency, is_active) VALUES
('Salary', 'income', '💰', 5000.00, 'monthly', true),
('Freelance Work', 'income', '💼', 1500.00, 'monthly', true),
('Investment Returns', 'income', '📈', 500.00, 'monthly', true),
('Rental Income', 'income', '🏠', 800.00, 'monthly', true),
('Side Hustle', 'income', '💻', 600.00, 'monthly', true),
('Bonus', 'income', '🎉', NULL, NULL, true),
('Tax Refund', 'income', '🧾', NULL, NULL, true),
('Gifts', 'income', '🎁', NULL, NULL, true),
('Other Income', 'income', '💵', NULL, NULL, true);

-- Expense Categories
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

-- Other expenses
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
-- BASIC ACCOUNTS (without user_id for global reference)
-- =============================================================================

-- Note: These accounts won't be visible through the app due to RLS
-- They serve as reference data for development and testing

-- Bank accounts
INSERT INTO accounts (name, type, initial_balance, current_balance, is_active) VALUES
('Primary Checking', 'bank_account', 2500.00, 2500.00, true),
('Emergency Savings', 'bank_account', 10000.00, 10000.00, true),
('Vacation Fund', 'bank_account', 3000.00, 3000.00, true),
('House Down Payment', 'bank_account', 25000.00, 25000.00, true);

-- Credit cards
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
-- INFORMATION AND GUIDANCE
-- =============================================================================

DO $$
DECLARE
    category_count INTEGER;
    account_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT count(*) INTO category_count FROM categories;
    SELECT count(*) INTO account_count FROM accounts;
    SELECT count(*) INTO user_count FROM auth.users WHERE email = 'ariefrizkyr@gmail.com';
    
    RAISE NOTICE '=== SIMPLE SEED DATA SUMMARY ===';
    RAISE NOTICE 'Test users created: %', user_count;
    RAISE NOTICE 'Categories created: %', category_count; 
    RAISE NOTICE 'Sample accounts created: %', account_count;
    RAISE NOTICE '';
    RAISE NOTICE 'TEST USER CREDENTIALS:';
    RAISE NOTICE 'Email: ariefrizkyr@gmail.com';
    RAISE NOTICE 'Password: omgoogle';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT NOTES:';
    RAISE NOTICE '- Test user can be used to login immediately after db reset';
    RAISE NOTICE '- Reference data (categories/accounts) not visible due to RLS';
    RAISE NOTICE '- Use reference data as templates for creating realistic test scenarios';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Start your application: npm run dev';
    RAISE NOTICE '2. Login with the test user credentials above';
    RAISE NOTICE '3. Create categories and accounts through the UI';
    RAISE NOTICE '4. Use the seeded data as reference for realistic values';
    RAISE NOTICE '';
    RAISE NOTICE 'FOR ADVANCED TESTING:';
    RAISE NOTICE '- Disable RLS temporarily to test with this seed data';
    RAISE NOTICE '- Or use the specialized seed files with proper user context';
    RAISE NOTICE '- Or create test data programmatically in your tests';
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Simple seed data installation completed!';
END $$;