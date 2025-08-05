-- Fix RLS policies with simpler, more reliable logic
-- Based on Supabase best practices from context7 documentation

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can create families" ON families;
DROP POLICY IF EXISTS "Users can read their families" ON families;
DROP POLICY IF EXISTS "Family creators can update families" ON families;
DROP POLICY IF EXISTS "Family creators can delete families" ON families;

DROP POLICY IF EXISTS "Family creators and triggers can add members" ON family_members;
DROP POLICY IF EXISTS "Users can read family members" ON family_members;
DROP POLICY IF EXISTS "Family admins can update member roles" ON family_members;
DROP POLICY IF EXISTS "Family creators can remove members" ON family_members;

-- ===== FAMILIES TABLE POLICIES =====

-- Simple INSERT policy: authenticated users can create families
CREATE POLICY "Authenticated users can create families" ON families FOR INSERT
TO authenticated 
WITH CHECK ( (select auth.uid()) IS NOT NULL );

-- Simple SELECT policy: users can read families they created or are members of
CREATE POLICY "Users can read their families" ON families FOR SELECT
TO authenticated 
USING (
  created_by = (select auth.uid()) OR 
  id IN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = (select auth.uid())
  )
);

-- Simple UPDATE policy: only family creators can update
CREATE POLICY "Family creators can update families" ON families FOR UPDATE
TO authenticated 
USING ( created_by = (select auth.uid()) )
WITH CHECK ( created_by = (select auth.uid()) );

-- Simple DELETE policy: only family creators can delete
CREATE POLICY "Family creators can delete families" ON families FOR DELETE
TO authenticated 
USING ( created_by = (select auth.uid()) );

-- ===== FAMILY_MEMBERS TABLE POLICIES =====

-- Simple INSERT policy: only family creators can add members
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

-- Simple SELECT policy: users can see members of families they belong to
CREATE POLICY "Users can read family members" ON family_members FOR SELECT
TO authenticated 
USING (
  -- User can see members of families they created
  EXISTS (
    SELECT 1 FROM families 
    WHERE id = family_members.family_id 
    AND created_by = (select auth.uid())
  )
  OR
  -- User can see members of families they belong to
  EXISTS (
    SELECT 1 FROM family_members fm 
    WHERE fm.family_id = family_members.family_id 
    AND fm.user_id = (select auth.uid())
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
COMMENT ON TABLE families IS 'RLS enabled: Simple policies using (select auth.uid()) pattern';
COMMENT ON TABLE family_members IS 'RLS enabled: Simple policies, triggers bypass RLS with SECURITY DEFINER';