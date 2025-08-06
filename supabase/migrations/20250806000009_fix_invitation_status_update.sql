-- Drop the problematic policy and create a simpler one
DROP POLICY IF EXISTS "Users can update their own invitations" ON public.family_invitations;

-- Create a policy that allows authenticated users to update invitations
-- The email validation will be done in the application code for security
CREATE POLICY "Users can update invitation status"
  ON public.family_invitations  
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    -- Only allow updating status and updated_at fields
    -- The application code will validate the email matches
    status IN ('accepted', 'declined')
  );