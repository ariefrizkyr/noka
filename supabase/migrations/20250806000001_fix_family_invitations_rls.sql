-- Fix family_invitations RLS policy to remove auth.users dependency
-- This fixes the "permission denied for table users" error

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view invitations for their families" ON family_invitations;

-- Create a simpler policy that only allows family admins to see invitations
-- This aligns with the API endpoint purpose which is for admins to manage invitations
CREATE POLICY "Family admins can view invitations" ON family_invitations
FOR SELECT
TO authenticated
USING (private.user_is_family_admin(family_id));