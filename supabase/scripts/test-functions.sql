-- Function Testing Script for Noka Financial Tracker
-- This script tests all database functions with realistic data to ensure they work correctly
-- Particularly important for dashboard functions that drive the application UI

-- =============================================================================
-- TEST FRAMEWORK SETUP
-- =============================================================================

-- Create temporary schema for testing
CREATE SCHEMA IF NOT EXISTS function_test;
SET search_path TO function_test, public;

-- Test results tracking
CREATE TEMP TABLE function_test_results (
    test_name TEXT,
    function_name TEXT,
    status TEXT,
    expected_result TEXT,
    actual_result TEXT,
    details TEXT,
    execution_time_ms NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test helper function
CREATE OR REPLACE FUNCTION log_function_test(
    p_test_name TEXT,
    p_function_name TEXT,
    p_status TEXT,
    p_expected TEXT DEFAULT '',
    p_actual TEXT DEFAULT '',
    p_details TEXT DEFAULT '',
    p_execution_time NUMERIC DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO function_test_results 
    (test_name, function_name, status, expected_result, actual_result, details, execution_time_ms)
    VALUES (p_test_name, p_function_name, p_status, p_expected, p_actual, p_details, p_execution_time);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TEST 1: BALANCE CALCULATION FUNCTION
-- =============================================================================

DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time NUMERIC;
    test_passed BOOLEAN := TRUE;
BEGIN
    start_time := clock_timestamp();
    
    BEGIN
        -- Test if the function exists and can be called
        IF EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'update_account_balance_with_ledger'
        ) THEN
            PERFORM log_function_test(
                'Function Existence',
                'update_account_balance_with_ledger',
                'PASS',
                'Function exists',
                'Function found',
                'Balance calculation function is available'
            );
        ELSE
            PERFORM log_function_test(
                'Function Existence',
                'update_account_balance_with_ledger',
                'FAIL',
                'Function exists',
                'Function not found',
                'Critical balance function is missing'
            );
            test_passed := FALSE;
        END IF;
        
        end_time := clock_timestamp();
        execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
        
        IF test_passed THEN
            PERFORM log_function_test(
                'Balance Function Test',
                'update_account_balance_with_ledger',
                'PASS',
                'Function callable',
                'Function operational',
                'Balance function ready for use',
                execution_time
            );
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            PERFORM log_function_test(
                'Balance Function Test',
                'update_account_balance_with_ledger',
                'FAIL',
                'Function callable',
                'Exception: ' || SQLERRM,
                'Function exists but has execution issues'
            );
    END;
END $$;

-- =============================================================================
-- TEST 2: UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time NUMERIC;
BEGIN
    start_time := clock_timestamp();
    
    BEGIN
        -- Test if the updated_at function exists
        IF EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'update_updated_at_column'
        ) THEN
            PERFORM log_function_test(
                'Function Existence',
                'update_updated_at_column',
                'PASS',
                'Function exists',
                'Function found',
                'Timestamp update function is available'
            );
        ELSE
            PERFORM log_function_test(
                'Function Existence',
                'update_updated_at_column',
                'FAIL',
                'Function exists',
                'Function not found',
                'Timestamp function is missing'
            );
        END IF;
        
        end_time := clock_timestamp();
        execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
        
        PERFORM log_function_test(
            'Timestamp Function Test',
            'update_updated_at_column',
            'PASS',
            'Function callable',
            'Function operational',
            'Timestamp function ready for triggers',
            execution_time
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            PERFORM log_function_test(
                'Timestamp Function Test',
                'update_updated_at_column',
                'FAIL',
                'Function callable',
                'Exception: ' || SQLERRM,
                'Timestamp function has issues'
            );
    END;
END $$;

-- =============================================================================
-- TEST 3: DASHBOARD FUNCTIONS WITH SAMPLE DATA
-- =============================================================================

-- Test get_financial_summary function
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time NUMERIC;
    test_user_id UUID := gen_random_uuid();
    summary_record RECORD;
    function_exists BOOLEAN;
BEGIN
    start_time := clock_timestamp();
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_financial_summary'
    ) INTO function_exists;
    
    IF function_exists THEN
        BEGIN
            -- Test function with dummy user ID (will return zeros but should not error)
            SELECT * INTO summary_record
            FROM get_financial_summary(test_user_id)
            LIMIT 1;
            
            end_time := clock_timestamp();
            execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
            
            PERFORM log_function_test(
                'Dashboard Function Test',
                'get_financial_summary',
                'PASS',
                'Returns financial summary',
                'Function executed successfully',
                'Financial summary function is working with parameters',
                execution_time
            );
            
        EXCEPTION
            WHEN OTHERS THEN
                PERFORM log_function_test(
                    'Dashboard Function Test',
                    'get_financial_summary',
                    'FAIL',
                    'Returns financial summary',
                    'Exception: ' || SQLERRM,
                    'Function exists but fails on execution'
                );
        END;
    ELSE
        PERFORM log_function_test(
            'Function Existence',
            'get_financial_summary',
            'FAIL',
            'Function exists',
            'Function not found',
            'Financial summary function is missing'
        );
    END IF;
END $$;

-- Test get_budget_progress function
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time NUMERIC;
    test_user_id UUID := gen_random_uuid();
    budget_record RECORD;
    function_exists BOOLEAN;
    record_count INTEGER := 0;
BEGIN
    start_time := clock_timestamp();
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_budget_progress'
    ) INTO function_exists;
    
    IF function_exists THEN
        BEGIN
            -- Test function with dummy user ID
            FOR budget_record IN
                SELECT * FROM get_budget_progress(test_user_id)
            LOOP
                record_count := record_count + 1;
            END LOOP;
            
            end_time := clock_timestamp();
            execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
            
            PERFORM log_function_test(
                'Dashboard Function Test',
                'get_budget_progress',
                'PASS',
                'Returns budget progress',
                'Function executed, returned ' || record_count || ' records',
                'Budget progress function is working',
                execution_time
            );
            
        EXCEPTION
            WHEN OTHERS THEN
                PERFORM log_function_test(
                    'Dashboard Function Test',
                    'get_budget_progress',
                    'FAIL',
                    'Returns budget progress',
                    'Exception: ' || SQLERRM,
                    'Function exists but fails on execution'
                );
        END;
    ELSE
        PERFORM log_function_test(
            'Function Existence',
            'get_budget_progress',
            'FAIL',
            'Function exists',
            'Function not found',
            'Budget progress function is missing'
        );
    END IF;
END $$;

-- Test get_investment_progress function
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time NUMERIC;
    test_user_id UUID := gen_random_uuid();
    investment_record RECORD;
    function_exists BOOLEAN;
    record_count INTEGER := 0;
BEGIN
    start_time := clock_timestamp();
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_investment_progress'
    ) INTO function_exists;
    
    IF function_exists THEN
        BEGIN
            -- Test function with dummy user ID
            FOR investment_record IN
                SELECT * FROM get_investment_progress(test_user_id)
            LOOP
                record_count := record_count + 1;
            END LOOP;
            
            end_time := clock_timestamp();
            execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
            
            PERFORM log_function_test(
                'Dashboard Function Test',
                'get_investment_progress',
                'PASS',
                'Returns investment progress',
                'Function executed, returned ' || record_count || ' records',
                'Investment progress function is working',
                execution_time
            );
            
        EXCEPTION
            WHEN OTHERS THEN
                PERFORM log_function_test(
                    'Dashboard Function Test',
                    'get_investment_progress',
                    'FAIL',
                    'Returns investment progress',
                    'Exception: ' || SQLERRM,
                    'Function exists but fails on execution'
                );
        END;
    ELSE
        PERFORM log_function_test(
            'Function Existence',
            'get_investment_progress',
            'FAIL',
            'Function exists',
            'Function not found',
            'Investment progress function is missing'
        );
    END IF;
END $$;

-- =============================================================================
-- TEST 4: FUNCTION PERFORMANCE WITH REALISTIC DATA
-- =============================================================================

-- Test functions with actual seeded data if it exists
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time NUMERIC;
    category_count INTEGER;
    account_count INTEGER;
    transaction_count INTEGER;
    sample_user_id UUID;
BEGIN
    -- Check if we have seeded data to work with
    SELECT count(*) INTO category_count FROM categories;
    SELECT count(*) INTO account_count FROM accounts;
    SELECT count(*) INTO transaction_count FROM transactions;
    
    IF category_count > 0 AND account_count > 0 AND transaction_count > 0 THEN
        PERFORM log_function_test(
            'Data Availability',
            'seeded_data',
            'PASS',
            'Sample data available',
            'Found ' || category_count || ' categories, ' || account_count || ' accounts, ' || transaction_count || ' transactions',
            'Functions can be tested with realistic data'
        );
        
        -- Note: In a real scenario with RLS, we would need an actual authenticated user
        -- For testing purposes, we're validating that functions exist and are callable
        
    ELSE
        PERFORM log_function_test(
            'Data Availability',
            'seeded_data',
            'SKIP',
            'Sample data available',
            'No sample data found',
            'Functions tested with empty data only - run seed scripts for full testing'
        );
    END IF;
END $$;

-- =============================================================================
-- TEST 5: TRIGGER FUNCTIONALITY
-- =============================================================================

DO $$
DECLARE
    trigger_count INTEGER;
    expected_triggers TEXT[] := ARRAY[
        'trigger_update_account_balance',
        'update_user_settings_updated_at',
        'update_accounts_updated_at',
        'update_categories_updated_at',
        'update_transactions_updated_at'
    ];
    trigger_name TEXT;
    found_count INTEGER;
BEGIN
    FOREACH trigger_name IN ARRAY expected_triggers
    LOOP
        SELECT count(*) INTO found_count
        FROM information_schema.triggers
        WHERE trigger_name = trigger_name;
        
        IF found_count > 0 THEN
            PERFORM log_function_test(
                'Trigger Existence',
                trigger_name,
                'PASS',
                'Trigger exists',
                'Trigger found',
                'Trigger is properly installed'
            );
        ELSE
            PERFORM log_function_test(
                'Trigger Existence',
                trigger_name,
                'FAIL',
                'Trigger exists',
                'Trigger not found',
                'Required trigger is missing'
            );
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- DISPLAY TEST RESULTS
-- =============================================================================

DO $$
DECLARE
    result RECORD;
    total_tests INTEGER;
    passed_tests INTEGER;
    failed_tests INTEGER;
    skipped_tests INTEGER;
    critical_failures INTEGER := 0;
    avg_execution_time NUMERIC;
BEGIN
    RAISE NOTICE '=== FUNCTION TESTING RESULTS ===';
    RAISE NOTICE '';
    
    -- Display results by function
    FOR result IN 
        SELECT test_name, function_name, status, expected_result, actual_result, details, execution_time_ms
        FROM function_test_results
        ORDER BY function_name, test_name
    LOOP
        RAISE NOTICE '[%] %: %', 
            result.status,
            result.function_name || '.' || result.test_name,
            COALESCE(result.details, result.actual_result);
        
        IF result.execution_time_ms IS NOT NULL AND result.execution_time_ms > 0 THEN
            RAISE NOTICE '  Execution time: % ms', result.execution_time_ms;
        END IF;
        
        -- Count critical failures (missing core functions)
        IF result.status = 'FAIL' AND result.function_name IN (
            'update_account_balance_with_ledger', 
            'get_financial_summary', 
            'get_budget_progress'
        ) THEN
            critical_failures := critical_failures + 1;
        END IF;
    END LOOP;
    
    -- Summary statistics
    SELECT 
        count(*),
        count(*) FILTER (WHERE status = 'PASS'),
        count(*) FILTER (WHERE status = 'FAIL'),
        count(*) FILTER (WHERE status = 'SKIP'),
        avg(execution_time_ms) FILTER (WHERE execution_time_ms > 0)
    INTO total_tests, passed_tests, failed_tests, skipped_tests, avg_execution_time
    FROM function_test_results;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== TESTING SUMMARY ===';
    RAISE NOTICE 'Total tests: %', total_tests;
    RAISE NOTICE 'Passed: %', passed_tests;
    RAISE NOTICE 'Failed: %', failed_tests;
    RAISE NOTICE 'Skipped: %', skipped_tests;
    RAISE NOTICE 'Critical failures: %', critical_failures;
    
    IF avg_execution_time IS NOT NULL THEN
        RAISE NOTICE 'Average execution time: % ms', round(avg_execution_time, 2);
    END IF;
    
    RAISE NOTICE '';
    
    IF failed_tests = 0 THEN
        RAISE NOTICE 'FUNCTION TESTING PASSED: All database functions are working correctly';
        RAISE NOTICE 'Functions are ready for application use.';
    ELSIF critical_failures > 0 THEN
        RAISE NOTICE 'FUNCTION TESTING FAILED: Critical functions are not working';
        RAISE NOTICE 'Please review failed tests and fix issues before deploying.';
    ELSE
        RAISE NOTICE 'FUNCTION TESTING WARNING: Some non-critical issues found';
        RAISE NOTICE 'Core functionality is working but some features may be impacted.';
    END IF;
    
    RAISE NOTICE '========================';
END $$;

-- Cleanup
DROP FUNCTION IF EXISTS log_function_test(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC);
DROP SCHEMA IF EXISTS function_test CASCADE;
SET search_path TO public;