-- Add automatic logged_by_user_id population via database trigger
-- This ensures every transaction is automatically tagged with who logged it
-- without requiring manual intervention in the API layer

-- =============================================================================
-- STEP 1: Create function to automatically set logged_by_user_id
-- =============================================================================

CREATE OR REPLACE FUNCTION private.set_logged_by_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically set logged_by_user_id to the current authenticated user
    -- This happens on INSERT and UPDATE operations
    NEW.logged_by_user_id = auth.uid();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- Add function comment for documentation
COMMENT ON FUNCTION private.set_logged_by_user_id() IS 
'Automatically sets logged_by_user_id to auth.uid() for transaction attribution. Used by trigger on transactions table.';

-- =============================================================================
-- STEP 2: Create trigger to automatically populate logged_by_user_id
-- =============================================================================

-- Drop trigger if it exists (for idempotent migration)
DROP TRIGGER IF EXISTS trigger_set_logged_by_user_id ON transactions;

-- Create trigger that fires BEFORE INSERT and UPDATE
-- This ensures logged_by_user_id is always set to the current user
CREATE TRIGGER trigger_set_logged_by_user_id
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION private.set_logged_by_user_id();

-- Add trigger comment for documentation
COMMENT ON TRIGGER trigger_set_logged_by_user_id ON transactions IS 
'Automatically populates logged_by_user_id with auth.uid() for transaction attribution tracking';

-- =============================================================================
-- EXPECTED BEHAVIOR
-- =============================================================================

-- After this migration:
-- ✅ Every INSERT into transactions automatically gets logged_by_user_id = auth.uid()
-- ✅ Every UPDATE to transactions updates logged_by_user_id = auth.uid() 
-- ✅ API layer no longer needs to manually set logged_by_user_id
-- ✅ Transaction attribution works consistently across all transaction creation methods
-- ✅ Family members can see who logged each transaction in joint accounts

-- =============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =============================================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS trigger_set_logged_by_user_id ON transactions;
-- DROP FUNCTION IF EXISTS private.set_logged_by_user_id();