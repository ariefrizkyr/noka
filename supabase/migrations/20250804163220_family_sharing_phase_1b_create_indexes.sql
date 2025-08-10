-- Family Sharing Foundation: Phase 1B - Create Indexes
-- Zero-downtime migration - Create performance indexes for new family tables

-- Indexes for families table
CREATE INDEX idx_families_created_by ON families(created_by);

-- Indexes for family_members table
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_user_family ON family_members(user_id, family_id);

-- Indexes for family_invitations table
CREATE INDEX idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX idx_family_invitations_email ON family_invitations(email);
CREATE INDEX idx_family_invitations_token ON family_invitations(token);
CREATE INDEX idx_family_invitations_status ON family_invitations(status);
CREATE INDEX idx_family_invitations_expires_at ON family_invitations(expires_at);

-- Comment to document this migration phase
COMMENT ON INDEX idx_families_created_by IS 'Family Sharing Phase 1B: Performance index for family creator queries';
COMMENT ON INDEX idx_family_members_user_family IS 'Family Sharing Phase 1B: Composite index for user-family membership lookups';