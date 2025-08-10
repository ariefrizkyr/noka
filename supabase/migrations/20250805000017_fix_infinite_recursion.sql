-- Fix infinite recursion by simplifying policies
-- The issue is that families SELECT policy references family_members which references families

-- Drop all existing policies to start completely fresh
DROP POLICY IF EXISTS "Authenticated users can create families" ON families;
DROP POLICY IF EXISTS "Users can read their families" ON families;
DROP POLICY IF EXISTS "Family creators can update families" ON families;
DROP POLICY IF EXISTS "Family creators can delete families" ON families;

DROP POLICY IF EXISTS "Family creators can add members" ON family_members;
DROP POLICY IF EXISTS "Users can read family members" ON family_members;
DROP POLICY IF EXISTS "Family creators can update member roles" ON family_members;
DROP POLICY IF EXISTS "Family creators can remove members" ON family_members;

-- ===== FAMILIES TABLE POLICIES (NO CIRCULAR REFERENCES) =====

-- Simple INSERT policy: authenticated users can create families
CREATE POLICY "Authenticated users can create families" ON families FOR INSERT
TO authenticated 
WITH CHECK ( (select auth.uid()) = created_by );

-- Simple SELECT policy: users can only read families they created (no circular reference)
CREATE POLICY "Users can read families they created" ON families FOR SELECT
TO authenticated 
USING ( created_by = (select auth.uid()) );

-- Simple UPDATE policy: only family creators can update
CREATE POLICY "Family creators can update families" ON families FOR UPDATE
TO authenticated 
USING ( created_by = (select auth.uid()) )
WITH CHECK ( created_by = (select auth.uid()) );

-- Simple DELETE policy: only family creators can delete
CREATE POLICY "Family creators can delete families" ON families FOR DELETE
TO authenticated 
USING ( created_by = (select auth.uid()) );

-- ===== FAMILY_MEMBERS TABLE POLICIES (SIMPLE) =====

-- Simple INSERT policy: family creators can add members
-- SECURITY DEFINER functions (triggers) automatically bypass RLS
CREATE POLICY "Family creators can add members" ON family_members FOR INSERT
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = (select auth.uid())
  )
);

-- Simple SELECT policy: users can see members of families they created
CREATE POLICY "Users can read family members they created" ON family_members FOR SELECT
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = (select auth.uid())
  )
);

-- Simple UPDATE policy: only family creators can update roles
CREATE POLICY "Family creators can update member roles" ON family_members FOR UPDATE
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = (select auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = (select auth.uid())
  )
);

-- Simple DELETE policy: only family creators can remove members
CREATE POLICY "Family creators can remove members" ON family_members FOR DELETE
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = (select auth.uid())
  )
);

-- Update table comments
COMMENT ON TABLE families IS 'RLS enabled: Simple policies without circular references';
COMMENT ON TABLE family_members IS 'RLS enabled: Only references families table (no circular dependencies)';