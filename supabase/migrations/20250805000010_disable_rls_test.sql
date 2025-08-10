-- Temporarily disable RLS entirely on families table to test if the issue is with RLS itself
-- This is the most basic test possible

-- Disable RLS on families table
ALTER TABLE families DISABLE ROW LEVEL SECURITY;

-- Comment to document this test
COMMENT ON TABLE families IS 'TESTING ONLY: Disabled RLS entirely to test if RLS is the issue - must re-enable after testing';