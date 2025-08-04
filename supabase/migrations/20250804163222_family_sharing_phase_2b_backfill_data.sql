-- Family Sharing Foundation: Phase 2B - Backfill Data
-- Zero-downtime migration - Backfill existing data with safe defaults

-- Backfill existing data with safe defaults
-- All existing accounts are personal (default already set via DEFAULT 'personal')
-- All existing categories are not shared (default already set via DEFAULT FALSE)

-- Backfill logged_by_user_id with user_id for existing transactions
UPDATE transactions 
SET logged_by_user_id = user_id 
WHERE logged_by_user_id IS NULL;

-- Make logged_by_user_id required after backfill
ALTER TABLE transactions 
ALTER COLUMN logged_by_user_id SET NOT NULL;

-- Comment to document this migration phase
COMMENT ON COLUMN transactions.logged_by_user_id IS 'Family Sharing Phase 2B: Required field after backfill - tracks transaction creator for family attribution';