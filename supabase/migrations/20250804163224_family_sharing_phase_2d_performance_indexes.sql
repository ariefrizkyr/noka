-- Family Sharing Foundation: Phase 2D - Create Performance Indexes
-- Zero-downtime migration - Create performance indexes for family-scoped queries

-- Performance indexes for family-scoped queries on accounts table
CREATE INDEX idx_accounts_family_id ON accounts(family_id);
CREATE INDEX idx_accounts_scope ON accounts(account_scope);
CREATE INDEX idx_accounts_user_family ON accounts(user_id, family_id);

-- Performance indexes for family-scoped queries on categories table
CREATE INDEX idx_categories_family_id ON categories(family_id);
CREATE INDEX idx_categories_is_shared ON categories(is_shared);
CREATE INDEX idx_categories_user_family ON categories(user_id, family_id);

-- Performance indexes for transaction attribution
CREATE INDEX idx_transactions_logged_by ON transactions(logged_by_user_id);
CREATE INDEX idx_transactions_logged_by_date ON transactions(logged_by_user_id, created_at);

-- Comment to document this migration phase
COMMENT ON INDEX idx_accounts_user_family IS 'Family Sharing Phase 2D: Composite index for efficient personal/family account queries';
COMMENT ON INDEX idx_categories_user_family IS 'Family Sharing Phase 2D: Composite index for efficient personal/family category queries';
COMMENT ON INDEX idx_transactions_logged_by_date IS 'Family Sharing Phase 2D: Composite index for family member contribution tracking';