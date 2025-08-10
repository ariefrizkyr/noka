-- Family Sharing Foundation: Phase 2A - Add Columns to Existing Tables
-- Zero-downtime migration - Add family support columns to existing tables

-- Add family support to accounts table
ALTER TABLE accounts 
ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE CASCADE,
ADD COLUMN account_scope account_scope NOT NULL DEFAULT 'personal';

-- Add family support to categories table  
ALTER TABLE categories
ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE CASCADE,
ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE;

-- Add attribution to transactions table
ALTER TABLE transactions
ADD COLUMN logged_by_user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT;

-- Comment to document this migration phase
COMMENT ON COLUMN accounts.family_id IS 'Family Sharing Phase 2A: Links joint accounts to families';
COMMENT ON COLUMN accounts.account_scope IS 'Family Sharing Phase 2A: Distinguishes personal vs joint accounts';
COMMENT ON COLUMN categories.family_id IS 'Family Sharing Phase 2A: Links shared categories to families';
COMMENT ON COLUMN categories.is_shared IS 'Family Sharing Phase 2A: Marks categories as family-wide shared';
COMMENT ON COLUMN transactions.logged_by_user_id IS 'Family Sharing Phase 2A: Tracks which family member created the transaction';