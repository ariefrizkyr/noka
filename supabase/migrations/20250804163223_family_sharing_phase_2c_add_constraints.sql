-- Family Sharing Foundation: Phase 2C - Add Constraints
-- Zero-downtime migration - Add data consistency constraints

-- Add check constraints for data consistency
ALTER TABLE accounts
ADD CONSTRAINT chk_account_scope_consistency CHECK (
    (account_scope = 'personal' AND family_id IS NULL AND user_id IS NOT NULL) OR
    (account_scope = 'joint' AND family_id IS NOT NULL AND user_id IS NULL)
);

ALTER TABLE categories
ADD CONSTRAINT chk_category_sharing_consistency CHECK (
    (is_shared = FALSE AND family_id IS NULL AND user_id IS NOT NULL) OR
    (is_shared = TRUE AND family_id IS NOT NULL AND user_id IS NULL)
);

-- Comment to document this migration phase
COMMENT ON CONSTRAINT chk_account_scope_consistency ON accounts IS 'Family Sharing Phase 2C: Ensures personal accounts belong to users, joint accounts belong to families';
COMMENT ON CONSTRAINT chk_category_sharing_consistency ON categories IS 'Family Sharing Phase 2C: Ensures personal categories belong to users, shared categories belong to families';