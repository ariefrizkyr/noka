-- Add UPDATE support to the existing trigger setup
-- This migration preserves the separate INSERT/DELETE triggers for timing
-- but adds a new UPDATE trigger to handle transaction edits

-- Create UPDATE trigger for transaction edits with BEFORE timing to match DELETE
-- BEFORE timing ensures we can access both OLD and NEW values properly
CREATE TRIGGER trigger_update_account_balance_update
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();

-- Add comment to document the UPDATE trigger
COMMENT ON TRIGGER trigger_update_account_balance_update ON transactions IS 'Handles account balance updates when transactions are edited by reversing old effects and applying new ones';