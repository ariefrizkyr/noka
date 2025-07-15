-- Main Seed File for Noka Financial Tracker
-- This file provides initial setup data for development with a default user
-- Creates a default user and their financial setup with IDR currency

-- =============================================================================
-- DEFAULT USER SETUP
-- =============================================================================

-- Create default user in auth.users table
-- Note: In Supabase, users are typically created through the auth flow
-- This is for development/testing purposes only
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
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
    '{}',
    false,
    '',
    '',
    '',
    ''
);

-- Get the user ID for further references
-- We'll use a variable to store the user ID
DO $$
DECLARE
    default_user_id UUID;
BEGIN
    -- Get the user ID we just created
    SELECT id INTO default_user_id 
    FROM auth.users 
    WHERE email = 'ariefrizkyr@gmail.com' 
    LIMIT 1;

    -- =============================================================================
    -- USER SETTINGS WITH IDR CURRENCY
    -- =============================================================================
    
    -- Create user settings with IDR currency, monthly start on 25th, weekly start on Monday
    INSERT INTO user_settings (
        user_id, 
        currency_code, 
        financial_month_start_day, 
        financial_week_start_day, 
        onboarding_completed,
        income_tracking_enabled,
        account_tracking_enabled,
        budgeting_enabled,
        investment_target_enabled
    ) VALUES (
        default_user_id,
        'IDR',
        25,  -- Monthly financial period starts on 25th
        1,   -- Weekly starts on Monday (1 = Monday in ISO standard)
        true,
        true,
        true,
        true,
        true
    );

    -- =============================================================================
    -- INCOME CATEGORIES FOR IDR USER
    -- =============================================================================
    
    INSERT INTO categories (user_id, name, type, icon, budget_amount, budget_frequency, is_active) VALUES
    -- Primary income sources with IDR amounts
    (default_user_id, 'Gaji', 'income', '💰', 15000000.00, 'monthly', true),
    (default_user_id, 'Freelance', 'income', '💼', 5000000.00, 'monthly', true),
    (default_user_id, 'Bisnis', 'income', '🏢', 8000000.00, 'monthly', true),
    (default_user_id, 'Investasi', 'income', '📈', 2000000.00, 'monthly', true),
    (default_user_id, 'Sewa Properti', 'income', '🏠', 3000000.00, 'monthly', true),
    (default_user_id, 'Usaha Sampingan', 'income', '💻', 2500000.00, 'monthly', true),
    -- Occasional income
    (default_user_id, 'Hadiah', 'income', '🎁', NULL, NULL, true),
    (default_user_id, 'Bonus', 'income', '🎉', NULL, NULL, true),
    (default_user_id, 'Pendapatan Lain', 'income', '💵', NULL, NULL, true);

    -- =============================================================================
    -- EXPENSE CATEGORIES FOR IDR USER
    -- =============================================================================
    
    INSERT INTO categories (user_id, name, type, icon, budget_amount, budget_frequency, is_active) VALUES
    -- Essential expenses in IDR
    (default_user_id, 'Belanja', 'expense', '🛒', 2000000.00, 'monthly', true),
    (default_user_id, 'Transportasi', 'expense', '🚗', 1500000.00, 'monthly', true),
    (default_user_id, 'Rumah/Sewa', 'expense', '🏠', 5000000.00, 'monthly', true),
    (default_user_id, 'Listrik & Air', 'expense', '💡', 800000.00, 'monthly', true),
    (default_user_id, 'Kesehatan', 'expense', '⚕️', 1000000.00, 'monthly', true),
    (default_user_id, 'Asuransi', 'expense', '🛡️', 750000.00, 'monthly', true),
    (default_user_id, 'Pulsa & Internet', 'expense', '📱', 300000.00, 'monthly', true),
    
    -- Lifestyle expenses
    (default_user_id, 'Hiburan', 'expense', '🎬', 600000.00, 'monthly', true),
    (default_user_id, 'Makan Luar', 'expense', '🍽️', 1000000.00, 'monthly', true),
    (default_user_id, 'Belanja Pakaian', 'expense', '👕', 800000.00, 'monthly', true),
    (default_user_id, 'Olahraga', 'expense', '💪', 400000.00, 'monthly', true),
    (default_user_id, 'Langganan', 'expense', '📺', 200000.00, 'monthly', true),
    (default_user_id, 'Perawatan Diri', 'expense', '💄', 400000.00, 'monthly', true),
    (default_user_id, 'Traveling', 'expense', '✈️', 2000000.00, 'monthly', true),
    (default_user_id, 'Pendidikan', 'expense', '📚', 1000000.00, 'monthly', true),
    
    -- Financial expenses
    (default_user_id, 'Cicilan KPR', 'expense', '🏦', 3000000.00, 'monthly', true),
    (default_user_id, 'Cicilan Mobil', 'expense', '🚗', 2000000.00, 'monthly', true),
    (default_user_id, 'Kartu Kredit', 'expense', '💳', 1500000.00, 'monthly', true),
    (default_user_id, 'Biaya Bank', 'expense', '🏪', 100000.00, 'monthly', true),
    
    -- Other expenses
    (default_user_id, 'Hadiah & Donasi', 'expense', '🎁', 500000.00, 'monthly', true),
    (default_user_id, 'Dana Darurat', 'expense', '🚨', 1000000.00, 'monthly', true),
    (default_user_id, 'Perawatan Kendaraan', 'expense', '🔧', 500000.00, 'monthly', true),
    (default_user_id, 'Perawatan Rumah', 'expense', '🏠', 600000.00, 'monthly', true),
    (default_user_id, 'Lain-lain', 'expense', '📋', NULL, NULL, true);

    -- =============================================================================
    -- INVESTMENT CATEGORIES FOR IDR USER
    -- =============================================================================
    
    INSERT INTO categories (user_id, name, type, icon, budget_amount, budget_frequency, is_active) VALUES
    (default_user_id, 'Saham', 'investment', '📊', 3000000.00, 'monthly', true),
    (default_user_id, 'Obligasi', 'investment', '📜', 2000000.00, 'monthly', true),
    (default_user_id, 'Reksadana', 'investment', '📈', 2500000.00, 'monthly', true),
    (default_user_id, 'Emas', 'investment', '🥇', 1500000.00, 'monthly', true),
    (default_user_id, 'Properti', 'investment', '🏘️', 5000000.00, 'monthly', true),
    (default_user_id, 'Dana Pensiun', 'investment', '🏦', 2000000.00, 'monthly', true),
    (default_user_id, 'Deposito', 'investment', '💰', 3000000.00, 'monthly', true),
    (default_user_id, 'Cryptocurrency', 'investment', '₿', 1000000.00, 'monthly', true),
    (default_user_id, 'Dana Pendidikan', 'investment', '🎓', 1500000.00, 'monthly', true);

    -- =============================================================================
    -- SAMPLE ACCOUNTS FOR IDR USER
    -- =============================================================================
    
    -- Bank Accounts with IDR balances
    INSERT INTO accounts (user_id, name, type, initial_balance, current_balance, is_active) VALUES
    (default_user_id, 'BCA Utama', 'bank_account', 10000000.00, 10000000.00, true),
    (default_user_id, 'Mandiri Tabungan', 'bank_account', 5000000.00, 5000000.00, true),
    (default_user_id, 'BNI Giro', 'bank_account', 15000000.00, 15000000.00, true),
    (default_user_id, 'Dana Darurat', 'bank_account', 50000000.00, 50000000.00, true),
    (default_user_id, 'Tabungan Liburan', 'bank_account', 12000000.00, 12000000.00, true);
    
    -- Credit Cards with IDR balances
    INSERT INTO accounts (user_id, name, type, initial_balance, current_balance, is_active) VALUES
    (default_user_id, 'BCA Platinum', 'credit_card', 2500000.00, 2500000.00, true),
    (default_user_id, 'Mandiri World', 'credit_card', 1800000.00, 1800000.00, true),
    (default_user_id, 'CIMB Gold', 'credit_card', 0.00, 0.00, true);
    
    -- Investment Accounts with IDR balances
    INSERT INTO accounts (user_id, name, type, initial_balance, current_balance, is_active) VALUES
    (default_user_id, 'Saham Mirae Asset', 'investment_account', 25000000.00, 25000000.00, true),
    (default_user_id, 'Reksadana Bareksa', 'investment_account', 15000000.00, 15000000.00, true),
    (default_user_id, 'Dana Pensiun DPLK', 'investment_account', 75000000.00, 75000000.00, true),
    (default_user_id, 'Deposito BRI', 'investment_account', 100000000.00, 100000000.00, true),
    (default_user_id, 'Emas Antam', 'investment_account', 20000000.00, 20000000.00, true);

END $$;

-- =============================================================================
-- VERIFICATION AND STATISTICS
-- =============================================================================

-- Display seeding summary
DO $$
DECLARE
    user_count INTEGER;
    category_count INTEGER;
    account_count INTEGER;
    default_user_id UUID;
BEGIN
    -- Get the default user ID
    SELECT id INTO default_user_id 
    FROM auth.users 
    WHERE email = 'ariefrizkyr@gmail.com' 
    LIMIT 1;
    
    SELECT count(*) INTO user_count FROM auth.users WHERE email = 'ariefrizkyr@gmail.com';
    SELECT count(*) INTO category_count FROM categories WHERE user_id = default_user_id;
    SELECT count(*) INTO account_count FROM accounts WHERE user_id = default_user_id;
    
    RAISE NOTICE '=== SEED DATA SUMMARY ===';
    RAISE NOTICE 'Default user created: % (ID: %)', 
        CASE WHEN user_count > 0 THEN 'ariefrizkyr@gmail.com' ELSE 'FAILED' END,
        COALESCE(default_user_id::text, 'NULL');
    RAISE NOTICE 'User settings: Currency IDR, Month starts on 25th, Week starts Monday';
    RAISE NOTICE '';
    RAISE NOTICE 'Categories created: %', category_count;
    RAISE NOTICE '- Income categories: %', (SELECT count(*) FROM categories WHERE user_id = default_user_id AND type = 'income');
    RAISE NOTICE '- Expense categories: %', (SELECT count(*) FROM categories WHERE user_id = default_user_id AND type = 'expense');
    RAISE NOTICE '- Investment categories: %', (SELECT count(*) FROM categories WHERE user_id = default_user_id AND type = 'investment');
    RAISE NOTICE '';
    RAISE NOTICE 'Accounts created: %', account_count;
    RAISE NOTICE '- Bank accounts: %', (SELECT count(*) FROM accounts WHERE user_id = default_user_id AND type = 'bank_account');
    RAISE NOTICE '- Credit cards: %', (SELECT count(*) FROM accounts WHERE user_id = default_user_id AND type = 'credit_card');
    RAISE NOTICE '- Investment accounts: %', (SELECT count(*) FROM accounts WHERE user_id = default_user_id AND type = 'investment_account');
    RAISE NOTICE '';
    RAISE NOTICE '========================';
    RAISE NOTICE 'Seed data installation completed successfully!';
    RAISE NOTICE 'Default user: ariefrizkyr@gmail.com / omgoogle';
    RAISE NOTICE 'Currency: IDR | Month starts: 25th | Week starts: Monday';
    RAISE NOTICE 'The database is now ready for development and testing.';
END $$;