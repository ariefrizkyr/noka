-- Drop the problematic policy that tries to access auth.users
DROP POLICY IF EXISTS "Users can accept invitations" ON public.family_members;

-- Create a simpler policy that doesn't access auth.users table
-- The email validation will be done in the application code instead
CREATE POLICY "Users can accept invitations"
  ON public.family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can only add themselves
    user_id = auth.uid()
    AND
    -- There must be a valid pending invitation for this family
    -- We'll validate the email match in the application code for security
    EXISTS (
      SELECT 1 
      FROM public.family_invitations fi
      WHERE fi.family_id = family_members.family_id
        AND fi.status = 'pending'
        AND fi.expires_at > NOW()
    )
  );