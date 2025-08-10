-- Fix RLS policy on family_members to allow trigger to insert family creator as admin
-- The trigger add_creator_as_admin() needs to insert into family_members but doesn't have auth context

-- Drop the existing ALL policy that's too restrictive for INSERTs
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;

-- INSERT policy that allows:
-- 1. Family admins to add members (normal case)
-- 2. Trigger to add family creator as admin (special case for family creation)
CREATE POLICY "Family admins and triggers can add members" ON family_members FOR INSERT
WITH CHECK (
  -- Allow if user is family admin (normal case)
  (SELECT private.user_is_family_admin(family_id)) OR
  -- Allow if this is the family creator being added as admin by the trigger
  -- (family just created, user being added matches family creator, role is admin)
  (
    role = 'admin' AND 
    user_id IN (
      SELECT created_by 
      FROM families 
      WHERE id = family_id 
      AND created_at > NOW() - INTERVAL '1 minute'  -- Recent family creation
    )
  )
);

-- UPDATE policy 
CREATE POLICY "Family admins can update members" ON family_members FOR UPDATE
USING ((SELECT private.user_is_family_admin(family_id)));

-- DELETE policy
CREATE POLICY "Family admins can remove members" ON family_members FOR DELETE  
USING ((SELECT private.user_is_family_admin(family_id)));

-- Comment to document this fix
COMMENT ON POLICY "Family admins and triggers can add members" ON family_members IS 'Family Sharing Fix: Allows trigger to add family creator as admin during family creation';