-- Schema Validation Script for Noka Financial Tracker
-- This script comprehensively validates that all database schema components are correctly installed
-- and configured according to the PRD specifications

-- =============================================================================
-- VALIDATION FRAMEWORK SETUP
-- =============================================================================

-- Create temporary validation tables
CREATE TEMP TABLE schema_validation_results (
    component_type TEXT,
    component_name TEXT,
    expected_count INTEGER,
    actual_count INTEGER,
    status TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation function
CREATE OR REPLACE FUNCTION validate_component(
    p_component_type TEXT,
    p_component_name TEXT,
    p_expected_count INTEGER,
    p_actual_count INTEGER,
    p_details TEXT DEFAULT ''
)
RETURNS VOID AS $$
DECLARE
    v_status TEXT;
BEGIN
    IF p_actual_count = p_expected_count THEN
        v_status := 'PASS';
    ELSE
        v_status := 'FAIL';
    END IF;
    
    INSERT INTO schema_validation_results 
    (component_type, component_name, expected_count, actual_count, status, details)
    VALUES (p_component_type, p_component_name, p_expected_count, p_actual_count, v_status, p_details);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE VALIDATION
-- =============================================================================

-- Validate all required tables exist
DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'user_settings', 'accounts', 'categories', 'transactions', 'balance_ledger'
    ];
    table_name TEXT;
    table_count INTEGER;
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        SELECT count(*) INTO table_count
        FROM information_schema.tables
        WHERE table_name = table_name AND table_schema = 'public';
        
        PERFORM validate_component('TABLE', table_name, 1, table_count,
            CASE WHEN table_count = 0 THEN 'Table does not exist' ELSE 'Table exists' END);
    END LOOP;
END $$;

-- Validate table structure and constraints
DO $$
DECLARE
    constraint_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Check foreign key constraints
    SELECT count(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
    
    PERFORM validate_component('CONSTRAINT', 'Foreign Keys', 8, constraint_count,
        'Expected at least 8 FK constraints across all tables');
    
    -- Check unique constraints
    SELECT count(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'UNIQUE' AND table_schema = 'public';
    
    PERFORM validate_component('CONSTRAINT', 'Unique Constraints', 1, constraint_count,
        'user_settings.user_id should have unique constraint');
    
    -- Check primary key constraints
    SELECT count(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'PRIMARY KEY' AND table_schema = 'public';
    
    PERFORM validate_component('CONSTRAINT', 'Primary Keys', 5, constraint_count,
        'Each table should have a primary key');
    
    -- Check check constraints
    SELECT count(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'CHECK' AND table_schema = 'public';
    
    PERFORM validate_component('CONSTRAINT', 'Check Constraints', 3, constraint_count,
        'User settings and categories should have check constraints');
END $$;

-- =============================================================================
-- ENUM VALIDATION
-- =============================================================================

DO $$
DECLARE
    required_enums TEXT[] := ARRAY['account_type', 'category_type', 'transaction_type', 'budget_frequency'];
    enum_name TEXT;
    enum_count INTEGER;
    enum_values TEXT[];
BEGIN
    FOREACH enum_name IN ARRAY required_enums
    LOOP
        SELECT count(*) INTO enum_count
        FROM pg_type
        WHERE typname = enum_name;
        
        PERFORM validate_component('ENUM', enum_name, 1, enum_count,
            CASE WHEN enum_count = 0 THEN 'Enum does not exist' ELSE 'Enum exists' END);
    END LOOP;
    
    -- Validate specific enum values
    -- account_type enum
    SELECT array_agg(enumlabel ORDER BY enumsortorder) INTO enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'account_type';
    
    IF enum_values @> ARRAY['bank_account', 'credit_card', 'investment_account'] THEN
        PERFORM validate_component('ENUM_VALUES', 'account_type', 3, array_length(enum_values, 1),
            'Contains required values: ' || array_to_string(enum_values, ', '));
    ELSE
        PERFORM validate_component('ENUM_VALUES', 'account_type', 3, 0,
            'Missing required values. Found: ' || COALESCE(array_to_string(enum_values, ', '), 'none'));
    END IF;
    
    -- category_type enum
    SELECT array_agg(enumlabel ORDER BY enumsortorder) INTO enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'category_type';
    
    IF enum_values @> ARRAY['expense', 'income', 'investment'] THEN
        PERFORM validate_component('ENUM_VALUES', 'category_type', 3, array_length(enum_values, 1),
            'Contains required values: ' || array_to_string(enum_values, ', '));
    ELSE
        PERFORM validate_component('ENUM_VALUES', 'category_type', 3, 0,
            'Missing required values. Found: ' || COALESCE(array_to_string(enum_values, ', '), 'none'));
    END IF;
END $$;

-- =============================================================================
-- FUNCTION AND TRIGGER VALIDATION
-- =============================================================================

DO $$
DECLARE
    required_functions TEXT[] := ARRAY[
        'update_account_balance_with_ledger',
        'update_updated_at_column',
        'get_financial_summary',
        'get_budget_progress',
        'get_investment_progress'
    ];
    function_name TEXT;
    function_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Validate functions exist
    FOREACH function_name IN ARRAY required_functions
    LOOP
        SELECT count(*) INTO function_count
        FROM information_schema.routines
        WHERE routine_name = function_name;
        
        PERFORM validate_component('FUNCTION', function_name, 1, function_count,
            CASE WHEN function_count = 0 THEN 'Function does not exist' ELSE 'Function exists' END);
    END LOOP;
    
    -- Validate triggers
    SELECT count(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_name = 'trigger_update_account_balance';
    
    PERFORM validate_component('TRIGGER', 'trigger_update_account_balance', 1, trigger_count,
        'Balance update trigger on transactions table');
    
    -- Count updated_at triggers
    SELECT count(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_name LIKE '%updated_at%';
    
    PERFORM validate_component('TRIGGER', 'updated_at triggers', 4, trigger_count,
        'Should have updated_at triggers on user_settings, accounts, categories, transactions');
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY VALIDATION
-- =============================================================================

DO $$
DECLARE
    rls_tables TEXT[] := ARRAY['user_settings', 'accounts', 'categories', 'transactions', 'balance_ledger'];
    table_name TEXT;
    rls_enabled BOOLEAN;
    policy_count INTEGER;
    total_policies INTEGER := 0;
BEGIN
    FOREACH table_name IN ARRAY rls_tables
    LOOP
        -- Check if RLS is enabled
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relname = table_name AND n.nspname = 'public';
        
        PERFORM validate_component('RLS_ENABLED', table_name, 1, 
            CASE WHEN COALESCE(rls_enabled, FALSE) THEN 1 ELSE 0 END,
            CASE WHEN COALESCE(rls_enabled, FALSE) THEN 'RLS enabled' ELSE 'RLS not enabled' END);
        
        -- Count policies for this table
        SELECT count(*) INTO policy_count
        FROM pg_policies
        WHERE tablename = table_name;
        
        total_policies := total_policies + policy_count;
        
        PERFORM validate_component('RLS_POLICIES', table_name || '_policies', 4, policy_count,
            'Expected SELECT, INSERT, UPDATE, DELETE policies');
    END LOOP;
    
    -- Overall policy count
    PERFORM validate_component('RLS_POLICIES', 'total_policies', 20, total_policies,
        'Expected ~20 total policies across all tables (4 per table)');
END $$;

-- =============================================================================
-- INDEX VALIDATION
-- =============================================================================

DO $$
DECLARE
    index_count INTEGER;
    expected_indexes TEXT[] := ARRAY[
        'idx_accounts_user_id', 'idx_accounts_type',
        'idx_categories_user_id', 'idx_categories_type',
        'idx_transactions_user_id', 'idx_transactions_date', 'idx_transactions_type',
        'idx_transactions_account', 'idx_transactions_category',
        'idx_ledger_account', 'idx_ledger_transaction', 'idx_ledger_created'
    ];
    index_name TEXT;
    actual_index_count INTEGER;
BEGIN
    -- Count specific expected indexes
    FOREACH index_name IN ARRAY expected_indexes
    LOOP
        SELECT count(*) INTO actual_index_count
        FROM pg_indexes
        WHERE indexname = index_name;
        
        PERFORM validate_component('INDEX', index_name, 1, actual_index_count,
            CASE WHEN actual_index_count = 0 THEN 'Index missing' ELSE 'Index exists' END);
    END LOOP;
    
    -- Count total indexes on our tables (excluding system indexes)
    SELECT count(*) INTO index_count
    FROM pg_indexes
    WHERE tablename IN ('user_settings', 'accounts', 'categories', 'transactions', 'balance_ledger')
    AND indexname NOT LIKE '%_pkey';  -- Exclude primary key indexes
    
    PERFORM validate_component('INDEX', 'total_custom_indexes', 12, index_count,
        'Expected 12 custom indexes across all tables');
END $$;

-- =============================================================================
-- DATA TYPE AND PRECISION VALIDATION
-- =============================================================================

DO $$
DECLARE
    precision_count INTEGER;
BEGIN
    -- Validate DECIMAL(15,2) precision for financial fields
    SELECT count(*) INTO precision_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND data_type = 'numeric'
    AND numeric_precision = 15
    AND numeric_scale = 2
    AND column_name IN ('initial_balance', 'current_balance', 'budget_amount', 'amount', 'balance_before', 'balance_after', 'change_amount');
    
    PERFORM validate_component('DATA_TYPE', 'decimal_precision', 7, precision_count,
        'Financial fields should use DECIMAL(15,2)');
    
    -- Validate UUID fields
    SELECT count(*) INTO precision_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND data_type = 'uuid'
    AND column_name LIKE '%_id';
    
    PERFORM validate_component('DATA_TYPE', 'uuid_fields', 15, precision_count,
        'ID fields should use UUID type');
    
    -- Validate timestamp fields
    SELECT count(*) INTO precision_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND data_type = 'timestamp with time zone'
    AND column_name IN ('created_at', 'updated_at');
    
    PERFORM validate_component('DATA_TYPE', 'timestamp_fields', 10, precision_count,
        'Timestamp fields should use TIMESTAMPTZ');
END $$;

-- =============================================================================
-- MIGRATION HISTORY VALIDATION
-- =============================================================================

DO $$
DECLARE
    migration_count INTEGER;
    latest_migration TEXT;
BEGIN
    -- Check if migration tracking table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'schema_migrations' AND table_schema = 'supabase_migrations'
    ) THEN
        SELECT count(*) INTO migration_count
        FROM supabase_migrations.schema_migrations;
        
        SELECT version INTO latest_migration
        FROM supabase_migrations.schema_migrations
        ORDER BY inserted_at DESC
        LIMIT 1;
        
        PERFORM validate_component('MIGRATION', 'migration_count', 11, migration_count,
            'Expected all 11 migrations applied. Latest: ' || COALESCE(latest_migration, 'none'));
    ELSE
        PERFORM validate_component('MIGRATION', 'migration_tracking', 1, 0,
            'Migration tracking table not found');
    END IF;
END $$;

-- =============================================================================
-- DISPLAY VALIDATION RESULTS
-- =============================================================================

DO $$
DECLARE
    result RECORD;
    total_tests INTEGER;
    passed_tests INTEGER;
    failed_tests INTEGER;
    critical_failures INTEGER := 0;
BEGIN
    RAISE NOTICE '=== SCHEMA VALIDATION RESULTS ===';
    RAISE NOTICE '';
    
    -- Display results by category
    FOR result IN 
        SELECT component_type, component_name, expected_count, actual_count, status, details
        FROM schema_validation_results
        ORDER BY component_type, component_name
    LOOP
        RAISE NOTICE '[%] % (% -> %): %', 
            result.status, 
            result.component_type || '.' || result.component_name,
            result.expected_count,
            result.actual_count,
            COALESCE(result.details, '');
        
        -- Count critical failures
        IF result.status = 'FAIL' AND result.component_type IN ('TABLE', 'ENUM', 'FUNCTION') THEN
            critical_failures := critical_failures + 1;
        END IF;
    END LOOP;
    
    -- Summary statistics
    SELECT 
        count(*),
        count(*) FILTER (WHERE status = 'PASS'),
        count(*) FILTER (WHERE status = 'FAIL')
    INTO total_tests, passed_tests, failed_tests
    FROM schema_validation_results;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== VALIDATION SUMMARY ===';
    RAISE NOTICE 'Total validations: %', total_tests;
    RAISE NOTICE 'Passed: %', passed_tests;
    RAISE NOTICE 'Failed: %', failed_tests;
    RAISE NOTICE 'Critical failures: %', critical_failures;
    RAISE NOTICE '';
    
    IF failed_tests = 0 THEN
        RAISE NOTICE 'SCHEMA VALIDATION PASSED: All database components are correctly configured';
        RAISE NOTICE 'The database is ready for production use.';
    ELSIF critical_failures > 0 THEN
        RAISE NOTICE 'SCHEMA VALIDATION FAILED: Critical components are missing or misconfigured';
        RAISE NOTICE 'Please review failed validations and fix issues before proceeding.';
    ELSE
        RAISE NOTICE 'SCHEMA VALIDATION WARNING: Some non-critical issues found';
        RAISE NOTICE 'Database is functional but may have optimization opportunities.';
    END IF;
    
    RAISE NOTICE '===========================';
END $$;

-- Cleanup
DROP FUNCTION IF EXISTS validate_component(TEXT, TEXT, INTEGER, INTEGER, TEXT);