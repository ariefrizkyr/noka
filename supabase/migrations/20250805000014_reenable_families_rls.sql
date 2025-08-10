-- Re-enable RLS on families table with proper policy
-- Only authenticated users can insert families

-- Re-enable RLS on families table
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Drop any existing test policies
DROP POLICY IF EXISTS "Simple test policy" ON families;

-- Create proper policy: only authenticated users can insert families
CREATE POLICY "Authenticated users can create families" ON families FOR INSERT
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can only read families they created or are members of
CREATE POLICY "Users can read their families" ON families FOR SELECT
TO authenticated 
USING (
  created_by = auth.uid() OR 
  id IN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = auth.uid()
  )
);

-- Only family creators can update their families
CREATE POLICY "Family creators can update families" ON families FOR UPDATE
TO authenticated 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Only family creators can delete their families
CREATE POLICY "Family creators can delete families" ON families FOR DELETE
TO authenticated 
USING (created_by = auth.uid());

-- Comment to document this policy
COMMENT ON TABLE families IS 'RLS enabled: Authenticated users can create families, access restricted to creators and members';