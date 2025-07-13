-- Final fix for transaction UPDATE trigger to properly handle balance updates
-- This migration ensures UPDATE operations are supported after all previous migrations

-- Drop ALL existing triggers related to account balance updates
DROP TRIGGER IF EXISTS trigger_update_account_balance_insert ON transactions;
DROP TRIGGER IF EXISTS trigger_update_account_balance_delete ON transactions;
DROP TRIGGER IF EXISTS trigger_update_account_balance ON transactions;

-- Create the comprehensive trigger to handle INSERT, UPDATE and DELETE operations
CREATE TRIGGER trigger_update_account_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();

-- Add a comment to document the final fix
COMMENT ON TRIGGER trigger_update_account_balance ON transactions IS 'Final comprehensive trigger that handles balance updates for all transaction operations (INSERT, UPDATE, DELETE). UPDATE operations now work by reversing old transaction effects and applying new ones.';