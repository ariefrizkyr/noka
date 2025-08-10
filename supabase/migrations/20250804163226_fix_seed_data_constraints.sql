-- Family Sharing Foundation: Fix seed data constraints
-- Temporarily adjust constraints to allow seed data without user_id

-- Drop the constraints temporarily to allow seed data
ALTER TABLE categories DROP CONSTRAINT IF EXISTS chk_category_sharing_consistency;
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS chk_account_scope_consistency;

-- Create more flexible constraints that allow seed data (without user_id)
ALTER TABLE categories
ADD CONSTRAINT chk_category_sharing_consistency_flexible CHECK (
    -- Allow seed data: no user_id, no family_id, not shared
    (user_id IS NULL AND family_id IS NULL AND is_shared = FALSE) OR
    -- Personal categories: has user_id, no family_id, not shared
    (is_shared = FALSE AND family_id IS NULL AND user_id IS NOT NULL) OR
    -- Shared categories: no user_id, has family_id, is shared
    (is_shared = TRUE AND family_id IS NOT NULL AND user_id IS NULL)
);

ALTER TABLE accounts
ADD CONSTRAINT chk_account_scope_consistency_flexible CHECK (
    -- Allow seed data: no user_id, no family_id, personal scope
    (user_id IS NULL AND family_id IS NULL AND account_scope = 'personal') OR
    -- Personal accounts: has user_id, no family_id, personal scope
    (account_scope = 'personal' AND family_id IS NULL AND user_id IS NOT NULL) OR
    -- Joint accounts: no user_id, has family_id, joint scope
    (account_scope = 'joint' AND family_id IS NOT NULL AND user_id IS NULL)
);

-- Comment to document this fix
COMMENT ON CONSTRAINT chk_category_sharing_consistency_flexible ON categories IS 'Family Sharing: Flexible constraint allowing seed data while enforcing family sharing rules';
COMMENT ON CONSTRAINT chk_account_scope_consistency_flexible ON accounts IS 'Family Sharing: Flexible constraint allowing seed data while enforcing account scope rules';