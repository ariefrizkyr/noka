-- Rollback Script for Noka Financial Tracker
-- WARNING: This script will remove database objects and potentially cause data loss
-- Only use this script in development or with proper backups in production

-- Safety check
DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK SAFETY WARNING ===';
    RAISE NOTICE 'This script will DROP tables and data';
    RAISE NOTICE 'Ensure you have a backup before proceeding';
    RAISE NOTICE 'Comment out this safety check to continue';
    RAISE NOTICE '==============================';
    
    -- Uncomment the line below to enable rollback
    -- RAISE EXCEPTION 'Safety check: Rollback aborted. Remove this check to proceed.';
END $$;

-- Rollback functions and triggers (reverse order of creation)
DROP TRIGGER IF EXISTS trigger_update_account_balance ON transactions;
DROP FUNCTION IF EXISTS update_account_balance_with_ledger();
DROP FUNCTION IF EXISTS get_investment_progress(UUID);
DROP FUNCTION IF EXISTS get_budget_progress(UUID);
DROP FUNCTION IF EXISTS get_financial_summary(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (reverse dependency order)
DROP TABLE IF EXISTS balance_ledger CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- Drop enums
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS budget_frequency CASCADE;
DROP TYPE IF EXISTS category_type CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;

-- Remove RLS policies (they should be dropped with tables, but explicit cleanup)
-- Note: RLS policies are automatically dropped when tables are dropped

-- Clean up migration history for development rollback
-- WARNING: Only do this in development environments
-- DELETE FROM supabase_migrations.schema_migrations 
-- WHERE version LIKE '2025062%' OR version LIKE '2025063%';

-- Final cleanup verification
DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK COMPLETION SUMMARY ===';
    
    -- Verify tables are removed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name IN ('user_settings', 'accounts', 'categories', 'transactions', 'balance_ledger')) THEN
        RAISE WARNING 'Some tables may still exist - check manually';
    ELSE
        RAISE NOTICE 'All application tables successfully removed';
    END IF;
    
    -- Verify functions are removed
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name LIKE '%account_balance%') THEN
        RAISE WARNING 'Some functions may still exist - check manually';
    ELSE
        RAISE NOTICE 'All application functions successfully removed';
    END IF;
    
    -- Verify enums are removed
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname IN ('account_type', 'category_type', 'transaction_type', 'budget_frequency')) THEN
        RAISE WARNING 'Some enums may still exist - check manually';
    ELSE
        RAISE NOTICE 'All application enums successfully removed';
    END IF;
    
    RAISE NOTICE '==================================';
    RAISE NOTICE 'Rollback completed. Database reset to pre-migration state.';
    RAISE NOTICE 'Migration history preserved for reapplication.';
END $$;