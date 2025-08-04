-- Family Sharing Foundation: Phase 1C - Enable RLS for New Tables
-- Zero-downtime migration - Enable Row Level Security for new family tables

-- Enable RLS on new tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for families (will be enhanced in Phase 3)
CREATE POLICY "Users can view families they created" ON families FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Users can create families" ON families FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family creators can update family" ON families FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Family creators can delete family" ON families FOR DELETE
USING (created_by = auth.uid());

-- Create basic RLS policies for family_members (will be enhanced in Phase 3)
CREATE POLICY "Users can view their own memberships" ON family_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Family creators can manage members" ON family_members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM families f 
        WHERE f.id = family_id AND f.created_by = auth.uid()
    )
);

-- Create basic RLS policies for family_invitations (will be enhanced in Phase 3)
CREATE POLICY "Users can view invitations for their families" ON family_invitations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM families f 
        WHERE f.id = family_id AND f.created_by = auth.uid()
    ) OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Family creators can manage invitations" ON family_invitations FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM families f 
        WHERE f.id = family_id AND f.created_by = auth.uid()
    )
);

-- Comment to document this migration phase
COMMENT ON POLICY "Users can view families they created" ON families IS 'Family Sharing Phase 1C: Basic RLS - users see families they created';
COMMENT ON POLICY "Family creators can manage members" ON family_members IS 'Family Sharing Phase 1C: Basic RLS - family creators manage membership';