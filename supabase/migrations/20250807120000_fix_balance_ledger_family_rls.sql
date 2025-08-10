-- Fix Balance Ledger RLS Policies for Family Sharing
-- This migration updates balance_ledger RLS policies to support family-aware access patterns
-- allowing users to create transactions with joint accounts and shared categories

-- Comprehensive fix for family sharing balance ledger access
-- Ensures balance_ledger table supports both:
-- 1. Personal accounts (account_scope = 'personal', user_id = auth.uid(), family_id = NULL)  
-- 2. Joint accounts (account_scope = 'joint', user_id = NULL, family_id = valid family)

-- =============================================================================
-- STEP 1: Drop Existing Balance Ledger RLS Policies
-- =============================================================================

-- Remove old policies that only support direct user ownership
DROP POLICY IF EXISTS "Users can view own balance ledger" ON balance_ledger;
DROP POLICY IF EXISTS "Users can insert own balance ledger" ON balance_ledger;
DROP POLICY IF EXISTS "Users can update own balance ledger" ON balance_ledger;
DROP POLICY IF EXISTS "Users can delete own balance ledger" ON balance_ledger;

-- =============================================================================
-- STEP 2: Create Family-Aware Balance Ledger RLS Policies (Complete CRUD)
-- =============================================================================

-- SELECT Policy: Users can view balance ledger for accounts they have access to
-- Supports both personal accounts (direct ownership) and joint accounts (family membership)
CREATE POLICY "Users can view accessible balance ledger" ON balance_ledger FOR SELECT
USING (
    account_id IN (
        SELECT id FROM accounts 
        WHERE (account_scope = 'personal' AND user_id = auth.uid()) 
           OR (account_scope = 'joint' AND family_id = ANY(private.user_family_ids()))
    )
);

-- INSERT Policy: Database triggers can create balance entries for accessible accounts
-- Critical for transaction creation - allows triggers to insert balance ledger entries
-- for both personal and joint account transactions
CREATE POLICY "Users can insert accessible balance ledger" ON balance_ledger FOR INSERT
WITH CHECK (
    account_id IN (
        SELECT id FROM accounts 
        WHERE (account_scope = 'personal' AND user_id = auth.uid()) 
           OR (account_scope = 'joint' AND family_id = ANY(private.user_family_ids()))
    )
);

-- UPDATE Policy: Allow balance adjustments for accessible accounts
-- Supports transaction updates that recalculate balances
CREATE POLICY "Users can update accessible balance ledger" ON balance_ledger FOR UPDATE
USING (
    account_id IN (
        SELECT id FROM accounts 
        WHERE (account_scope = 'personal' AND user_id = auth.uid()) 
           OR (account_scope = 'joint' AND family_id = ANY(private.user_family_ids()))
    )
);

-- DELETE Policy: Allow balance entry removal for accessible accounts  
-- Supports transaction deletion that reverses balance effects
CREATE POLICY "Users can delete accessible balance ledger" ON balance_ledger FOR DELETE
USING (
    account_id IN (
        SELECT id FROM accounts 
        WHERE (account_scope = 'personal' AND user_id = auth.uid()) 
           OR (account_scope = 'joint' AND family_id = ANY(private.user_family_ids()))
    )
);

-- =============================================================================
-- STEP 3: Add Comments for Documentation
-- =============================================================================

COMMENT ON POLICY "Users can view accessible balance ledger" ON balance_ledger IS 
'Family-aware SELECT policy: Users can view balance ledger entries for personal accounts they own and joint accounts in families they belong to';

COMMENT ON POLICY "Users can insert accessible balance ledger" ON balance_ledger IS 
'Family-aware INSERT policy: Database triggers can create balance entries for both personal and joint accounts the user has access to. Critical for joint account transaction creation.';

COMMENT ON POLICY "Users can update accessible balance ledger" ON balance_ledger IS 
'Family-aware UPDATE policy: Supports balance adjustments for transaction updates on both personal and joint accounts';

COMMENT ON POLICY "Users can delete accessible balance ledger" ON balance_ledger IS 
'Family-aware DELETE policy: Supports balance entry removal for transaction deletions on both personal and joint accounts';

-- =============================================================================
-- STEP 4: Verification Queries (for testing)
-- =============================================================================

-- These queries can be used to verify the policies work correctly:

-- Test 1: Check that user can see balance ledger for their personal accounts
-- SELECT * FROM balance_ledger bl 
-- JOIN accounts a ON a.id = bl.account_id 
-- WHERE a.account_scope = 'personal' AND a.user_id = auth.uid();

-- Test 2: Check that user can see balance ledger for joint accounts in their families  
-- SELECT * FROM balance_ledger bl
-- JOIN accounts a ON a.id = bl.account_id
-- WHERE a.account_scope = 'joint' AND a.family_id = ANY(private.user_family_ids());

-- Test 3: Verify security isolation - user should NOT see other users' personal accounts
-- This should return empty results when tested across different users

-- =============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =============================================================================

-- To rollback this migration, run:
-- 
-- DROP POLICY IF EXISTS "Users can view accessible balance ledger" ON balance_ledger;
-- DROP POLICY IF EXISTS "Users can insert accessible balance ledger" ON balance_ledger; 
-- DROP POLICY IF EXISTS "Users can update accessible balance ledger" ON balance_ledger;
-- DROP POLICY IF EXISTS "Users can delete accessible balance ledger" ON balance_ledger;
--
-- -- Restore original policies:
-- CREATE POLICY "Users can view own balance ledger" ON balance_ledger FOR SELECT 
-- USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
-- CREATE POLICY "Users can insert own balance ledger" ON balance_ledger FOR INSERT 
-- WITH CHECK (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
-- CREATE POLICY "Users can update own balance ledger" ON balance_ledger FOR UPDATE 
-- USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
-- CREATE POLICY "Users can delete own balance ledger" ON balance_ledger FOR DELETE 
-- USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

-- =============================================================================
-- EXPECTED RESULTS
-- =============================================================================

-- After this migration:
-- ✅ Users can create transactions with joint accounts (no more RLS errors)
-- ✅ Database triggers can create balance ledger entries for joint account transactions
-- ✅ Balance ledger supports full CRUD operations for both personal and joint accounts  
-- ✅ Family members can view balance history for joint accounts
-- ✅ Personal account functionality remains unchanged
-- ✅ Security isolation between families is maintained
-- ✅ Performance should be similar to existing account table policies