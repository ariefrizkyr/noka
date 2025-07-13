-- Fix foreign key constraint issue by changing DELETE trigger timing
-- This migration fixes the issue where AFTER DELETE trigger tries to insert
-- balance_ledger entries referencing the deleted transaction

-- Drop the existing trigger
DROP TRIGGER IF EXISTS trigger_update_account_balance ON transactions;

-- Create separate triggers for INSERT and DELETE with proper timing
-- AFTER INSERT for new transactions (keeps existing behavior)
CREATE TRIGGER trigger_update_account_balance_insert
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();

-- BEFORE DELETE for transaction deletions (fixes foreign key issue)
CREATE TRIGGER trigger_update_account_balance_delete
BEFORE DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();

-- Add comment to document the fix
COMMENT ON TRIGGER trigger_update_account_balance_insert ON transactions IS 'Handles account balance updates for new transactions after insertion';
COMMENT ON TRIGGER trigger_update_account_balance_delete ON transactions IS 'Handles account balance reversals before transaction deletion to maintain referential integrity';