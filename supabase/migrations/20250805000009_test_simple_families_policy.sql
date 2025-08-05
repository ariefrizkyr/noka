-- Replace the complex INSERT policy with a simple one for testing
-- This will help us isolate if the issue is with auth.uid() or something else

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create families" ON families;

-- Create a super simple policy that allows ANY authenticated user to insert
CREATE POLICY "Simple test policy" ON families FOR INSERT
TO authenticated 
WITH CHECK (true);

-- Comment to document this test
COMMENT ON POLICY "Simple test policy" ON families IS 'TESTING ONLY: Allows any authenticated user to insert families - remove after testing';