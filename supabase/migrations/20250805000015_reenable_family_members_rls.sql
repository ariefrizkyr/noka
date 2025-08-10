-- Re-enable RLS on family_members table with proper admin-only insert policy
-- Only family creators (admins) can insert members by checking created_by field

-- Re-enable RLS on family_members table
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Drop any existing test policies
DROP POLICY IF EXISTS "Simple family members insert policy" ON family_members;

-- Policy 1: Only family creators can insert members (checking created_by in families table)
-- Also allow SECURITY DEFINER functions (triggers) to insert
CREATE POLICY "Family creators and triggers can add members" ON family_members FOR INSERT
TO authenticated 
WITH CHECK (
  -- Allow if current user is the family creator
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = auth.uid()
  )
  -- Note: SECURITY DEFINER functions (triggers) will bypass RLS automatically
);

-- Policy 2: Users can read family members of families they belong to
CREATE POLICY "Users can read family members" ON family_members FOR SELECT
TO authenticated 
USING (
  -- User can see members of families they created
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = auth.uid()
  )
  OR
  -- User can see members of families they belong to
  EXISTS (
    SELECT 1 FROM family_members fm 
    WHERE fm.family_id = family_members.family_id 
    AND fm.user_id = auth.uid()
  )
);

-- Policy 3: Only family admins can update member roles
CREATE POLICY "Family admins can update member roles" ON family_members FOR UPDATE
TO authenticated 
USING (
  -- Only family creators can update member roles
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = auth.uid()
  )
)
WITH CHECK (
  -- Only family creators can update member roles
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = auth.uid()
  )
);

-- Policy 4: Only family creators can remove members
CREATE POLICY "Family creators can remove members" ON family_members FOR DELETE
TO authenticated 
USING (
  -- Only family creators can remove members
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = auth.uid()
  )
);

-- Comment to document this policy
COMMENT ON TABLE family_members IS 'RLS enabled: Only family creators can manage members, triggers bypass RLS with SECURITY DEFINER';