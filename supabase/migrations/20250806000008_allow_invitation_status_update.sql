-- Allow users to update invitation status for invitations sent to their email
-- This is needed so users can mark invitations as accepted/declined

CREATE POLICY "Users can update their own invitations"
  ON public.family_invitations
  FOR UPDATE
  TO authenticated
  USING (
    -- User can update invitations sent to their email
    EXISTS (
      SELECT 1 
      FROM auth.users u 
      WHERE u.id = auth.uid() 
        AND u.email = family_invitations.email
    )
  )
  WITH CHECK (
    -- Same condition for the updated data
    EXISTS (
      SELECT 1 
      FROM auth.users u 
      WHERE u.id = auth.uid() 
        AND u.email = family_invitations.email
    )
  );