-- Production Deployment Script for Noka Financial Tracker
-- This script ensures all migrations are applied in the correct order for production deployment
-- Run this script with appropriate database privileges

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify current database state
DO $$
BEGIN
    -- Check if this is a fresh database or if migrations are needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supabase_migrations' AND table_schema = 'supabase_migrations') THEN
        RAISE NOTICE 'Fresh database detected. All migrations will be applied.';
    ELSE
        RAISE NOTICE 'Existing database detected. Only new migrations will be applied.';
    END IF;
END $$;

-- Create migration tracking table if it doesn't exist
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version TEXT PRIMARY KEY,
    inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- List of all migrations in dependency order
-- This should be updated whenever new migrations are added
DO $$
DECLARE
    migration_files TEXT[] := ARRAY[
        '20250629085550_create_database_enums.sql',
        '20250629085556_create_user_settings_table.sql',
        '20250629085602_create_accounts_table.sql',
        '20250629085607_create_categories_table.sql',
        '20250629085614_create_transactions_table.sql',
        '20250629085615_create_balance_ledger_table.sql',
        '20250629085616_complete_rls_policies.sql',
        '20250629085617_create_database_functions_and_triggers.sql',
        '20250629094304_fix_credit_card_transfer_logic.sql',
        '20250629094305_fix_investment_progress_function.sql',
        '20250630000000_fix_credit_card_income_logic.sql'
    ];
    migration_file TEXT;
BEGIN
    -- Verify all expected migrations are present
    FOREACH migration_file IN ARRAY migration_files
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM supabase_migrations.schema_migrations 
            WHERE version = migration_file
        ) THEN
            RAISE NOTICE 'Migration % needs to be applied', migration_file;
        ELSE
            RAISE NOTICE 'Migration % already applied', migration_file;
        END IF;
    END LOOP;
END $$;

-- Production deployment checklist
DO $$
BEGIN
    RAISE NOTICE '=== PRODUCTION DEPLOYMENT CHECKLIST ===';
    RAISE NOTICE '1. Backup current database before proceeding';
    RAISE NOTICE '2. Run supabase db push to apply pending migrations';
    RAISE NOTICE '3. Run validation script after deployment';
    RAISE NOTICE '4. Test critical functions with sample data';
    RAISE NOTICE '5. Verify Row Level Security policies are active';
    RAISE NOTICE '==========================================';
END $$;

-- Verify essential components exist after migration
DO $$
BEGIN
    -- Check tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        RAISE EXCEPTION 'Critical table user_settings missing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
        RAISE EXCEPTION 'Critical table accounts missing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        RAISE EXCEPTION 'Critical table transactions missing';
    END IF;
    
    -- Check functions
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'update_account_balance_with_ledger'
    ) THEN
        RAISE EXCEPTION 'Critical function update_account_balance_with_ledger missing';
    END IF;
    
    -- Check enums
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        RAISE EXCEPTION 'Critical enum account_type missing';
    END IF;
    
    RAISE NOTICE 'All critical components verified successfully';
END $$;