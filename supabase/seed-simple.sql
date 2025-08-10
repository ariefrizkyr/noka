-- Simple Seed File for Noka Financial Tracker
-- This file provides basic sample data that can be loaded without RLS issues
-- Suitable for development and testing environments

-- =============================================================================
-- DEVELOPMENT NOTICE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== NOKA FINANCIAL TRACKER - COMPREHENSIVE SEED DATA ===';
    RAISE NOTICE 'This seed file creates comprehensive sample data for development.';
    RAISE NOTICE 'Includes complete family sharing setup:';
    RAISE NOTICE '- 2 test users with Indonesian financial settings';
    RAISE NOTICE '- 1 family "ARTI" with admin/member roles';
    RAISE NOTICE '- 15 realistic categories with IDR budgets';
    RAISE NOTICE '- 8 accounts (6 personal + 2 joint family)';
    RAISE NOTICE '- Complete user settings and onboarding';
    RAISE NOTICE 'Ready for immediate family feature testing!';
    RAISE NOTICE '====================================================';
END $$;

-- =============================================================================
-- TEST USERS FOR DEVELOPMENT
-- =============================================================================

-- Create test users in the auth.users table
-- This allows direct login without registration during development

DO $$
DECLARE
    user_uuid1 UUID := gen_random_uuid();
    user_uuid2 UUID := gen_random_uuid();
    family_uuid UUID := gen_random_uuid();
BEGIN
    -- First test user
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
        user_uuid1,
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

    -- Second test user
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
        user_uuid2,
        'authenticated',
        'authenticated',
        'agustianazhen@gmail.com',
        crypt('omgoogle', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"email": "agustianazhen@gmail.com"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );

    -- Create corresponding profile entries (if profiles table exists and has trigger)
    -- Note: This may be automatically created by trigger, but we ensure it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        INSERT INTO profiles (id, email, updated_at) 
        VALUES (user_uuid1, 'ariefrizkyr@gmail.com', NOW())
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO profiles (id, email, updated_at) 
        VALUES (user_uuid2, 'agustianazhen@gmail.com', NOW())
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- =============================================================================
    -- FAMILY INFRASTRUCTURE
    -- =============================================================================

    -- Create the ARTI family
    INSERT INTO families (
        id,
        name,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        family_uuid,
        'ARTI',
        user_uuid1,
        NOW(),
        NOW()
    );

    -- Add family memberships
    -- Note: user_uuid1 (creator) is automatically added as admin by trigger
    -- We only need to manually add the second user as member
    INSERT INTO family_members (
        id,
        family_id,
        user_id,
        role,
        joined_at
    ) VALUES 
    (
        gen_random_uuid(),
        family_uuid,
        user_uuid2,
        'member',
        NOW()
    );

    -- Add family invitation (accepted)
    INSERT INTO family_invitations (
        id,
        family_id,
        email,
        role,
        token,
        status,
        invited_by,
        expires_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        family_uuid,
        'agustianazhen@gmail.com',
        'member',
        gen_random_uuid()::text,
        'accepted',
        user_uuid1,
        NOW() + INTERVAL '7 days',
        NOW(),
        NOW()
    );

    -- =============================================================================
    -- CATEGORIES (15 FAMILY-SHARED CATEGORIES)
    -- =============================================================================

    -- Income Categories
    INSERT INTO categories (
        id, user_id, name, type, icon, budget_amount, budget_frequency, 
        is_active, family_id, is_shared, created_at, updated_at
    ) VALUES 
    (
        gen_random_uuid(), NULL, 'Salary', 'income', '💰', NULL, NULL, 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Side Hustle', 'income', '💼', NULL, NULL, 
        true, family_uuid, true, NOW(), NOW()
    ),

    -- Expense Categories
    (
        gen_random_uuid(), NULL, 'KPR', 'expense', '🏡', 3500000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Groceries', 'expense', '🛒', 6380000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Bills', 'expense', '🔁', 3565000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Transport', 'expense', '🚙', 2740000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Insurance', 'expense', '🛡️', 2550000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Zakat', 'expense', '🙏', 1200000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Chorus', 'expense', '🧤', 2000000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Weekend Spending', 'expense', '🛍️', 1000000.00, 'weekly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Workday Spending', 'expense', '🍔', 750000.00, 'weekly', 
        true, family_uuid, true, NOW(), NOW()
    ),

    -- Investment Categories
    (
        gen_random_uuid(), NULL, 'KPR Advancement', 'investment', '🏦', 6600000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Nora''s Investment', 'investment', '🧒', 2000000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Holiday', 'investment', '🏖️', 1000000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'Car Maintenance', 'investment', '🚗', 1000000.00, 'monthly', 
        true, family_uuid, true, NOW(), NOW()
    );

    -- =============================================================================
    -- ACCOUNTS (PERSONAL AND JOINT)
    -- =============================================================================

    -- Personal Accounts for User 1 (ariefrizkyr@gmail.com)
    INSERT INTO accounts (
        id, user_id, name, type, initial_balance, current_balance, 
        is_active, family_id, account_scope, created_at, updated_at
    ) VALUES 
    (
        gen_random_uuid(), user_uuid1, 'BCA', 'bank_account', 0.00, 0.00, 
        true, NULL, 'personal', NOW(), NOW()
    ),
    (
        gen_random_uuid(), user_uuid1, 'UOB Privimiles', 'credit_card', 0.00, 0.00, 
        true, NULL, 'personal', NOW(), NOW()
    ),
    (
        gen_random_uuid(), user_uuid1, 'UOB Garuda Arief', 'credit_card', 0.00, 0.00, 
        true, NULL, 'personal', NOW(), NOW()
    );

    -- Personal Accounts for User 2 (agustianazhen@gmail.com)  
    INSERT INTO accounts (
        id, user_id, name, type, initial_balance, current_balance, 
        is_active, family_id, account_scope, created_at, updated_at
    ) VALUES 
    (
        gen_random_uuid(), user_uuid2, 'BCA', 'bank_account', 0.00, 0.00, 
        true, NULL, 'personal', NOW(), NOW()
    ),
    (
        gen_random_uuid(), user_uuid2, 'BCA', 'bank_account', 0.00, 0.00, 
        true, NULL, 'personal', NOW(), NOW()
    ),
    (
        gen_random_uuid(), user_uuid2, 'BCA', 'bank_account', 0.00, 0.00, 
        true, NULL, 'personal', NOW(), NOW()
    );

    -- Joint Family Accounts
    INSERT INTO accounts (
        id, user_id, name, type, initial_balance, current_balance, 
        is_active, family_id, account_scope, created_at, updated_at
    ) VALUES 
    (
        gen_random_uuid(), NULL, 'BCA Bersama', 'bank_account', 0.00, 0.00, 
        true, family_uuid, 'joint', NOW(), NOW()
    ),
    (
        gen_random_uuid(), NULL, 'UOB Garuda Tia', 'credit_card', 0.00, 0.00, 
        true, family_uuid, 'joint', NOW(), NOW()
    );

    -- =============================================================================
    -- USER SETTINGS (INDONESIAN CONFIGURATION)
    -- =============================================================================

    -- User Settings for both users
    INSERT INTO user_settings (
        id, user_id, currency_code, financial_month_start_day, financial_week_start_day,
        onboarding_completed, onboarding_step_1_completed, onboarding_step_2_completed, 
        onboarding_step_3_completed, onboarding_current_step, weekend_end_handling,
        created_at, updated_at
    ) VALUES 
    (
        gen_random_uuid(), user_uuid1, 'IDR', 25, 1,
        true, true, true, true, 3, 'move_to_friday',
        NOW(), NOW()
    ),
    (
        gen_random_uuid(), user_uuid2, 'IDR', 25, 1,
        true, true, true, true, 3, 'move_to_friday',
        NOW(), NOW()
    );

    -- Log completion
    RAISE NOTICE 'Test user created: ariefrizkyr@gmail.com (password: omgoogle)';
    RAISE NOTICE 'User UUID: %', user_uuid1;
    RAISE NOTICE 'Test user created: agustianazhen@gmail.com (password: omgoogle)';
    RAISE NOTICE 'User UUID: %', user_uuid2;
    RAISE NOTICE 'Family created: ARTI';
    RAISE NOTICE 'Family UUID: %', family_uuid;

END $$;

-- =============================================================================
-- INFORMATION AND GUIDANCE
-- =============================================================================

DO $$
DECLARE
    category_count INTEGER;
    account_count INTEGER;
    user_count INTEGER;
    family_count INTEGER;
    family_member_count INTEGER;
    settings_count INTEGER;
BEGIN
    SELECT count(*) INTO category_count FROM categories;
    SELECT count(*) INTO account_count FROM accounts;
    SELECT count(*) INTO user_count FROM auth.users WHERE email IN ('ariefrizkyr@gmail.com', 'agustianazhen@gmail.com');
    SELECT count(*) INTO family_count FROM families;
    SELECT count(*) INTO family_member_count FROM family_members;
    SELECT count(*) INTO settings_count FROM user_settings;
    
    RAISE NOTICE '=== COMPREHENSIVE SEED DATA SUMMARY ===';
    RAISE NOTICE 'Test users created: %', user_count;
    RAISE NOTICE 'Families created: %', family_count;
    RAISE NOTICE 'Family memberships: %', family_member_count;
    RAISE NOTICE 'Categories created: %', category_count;
    RAISE NOTICE 'Accounts created: %', account_count;
    RAISE NOTICE 'User settings configured: %', settings_count;
    RAISE NOTICE '';
    RAISE NOTICE 'TEST USER CREDENTIALS:';
    RAISE NOTICE 'Email: ariefrizkyr@gmail.com | Password: omgoogle (Family Admin)';
    RAISE NOTICE 'Email: agustianazhen@gmail.com | Password: omgoogle (Family Member)';
    RAISE NOTICE '';
    RAISE NOTICE 'FAMILY DATA INCLUDED:';
    RAISE NOTICE '- Family "ARTI" with admin and member roles';
    RAISE NOTICE '- 15 realistic Indonesian categories (Income/Expense/Investment)';
    RAISE NOTICE '- 8 accounts: 6 personal + 2 joint family accounts';
    RAISE NOTICE '- IDR currency with Indonesian financial settings';
    RAISE NOTICE '- Budget amounts ranging from 750K to 6.6M IDR';
    RAISE NOTICE '';
    RAISE NOTICE 'READY TO TEST:';
    RAISE NOTICE '- Family sharing features';
    RAISE NOTICE '- Joint account management';
    RAISE NOTICE '- Shared category budgeting';
    RAISE NOTICE '- Member role permissions';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Start your application: npm run dev';
    RAISE NOTICE '2. Login as either user to test family features';
    RAISE NOTICE '3. Test creating transactions in shared categories';
    RAISE NOTICE '4. Explore family dashboard and member contributions';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Comprehensive family seed data installation completed!';
END $$;