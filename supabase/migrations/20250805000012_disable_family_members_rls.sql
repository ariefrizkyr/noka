-- Disable RLS entirely on family_members table to test
-- This is the most basic test to see if family creation works at all

-- Disable RLS on family_members table  
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;

-- Comment to document this test
COMMENT ON TABLE family_members IS 'TESTING ONLY: Disabled RLS entirely to test family member creation - must re-enable after testing';