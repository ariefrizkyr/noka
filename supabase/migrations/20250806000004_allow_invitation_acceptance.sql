-- Allow users to accept invitations and add themselves to families
-- This policy allows INSERT to family_members when there's a valid pending invitation

CREATE POLICY "Users can accept invitations"
  ON public.family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can only add themselves
    user_id = auth.uid()
    AND
    -- There must be a valid pending invitation for this family and email
    EXISTS (
      SELECT 1 
      FROM public.family_invitations fi
      JOIN auth.users u ON u.email = fi.email
      WHERE fi.family_id = family_members.family_id
        AND u.id = auth.uid()
        AND fi.status = 'pending'
        AND fi.expires_at > NOW()
    )
  );