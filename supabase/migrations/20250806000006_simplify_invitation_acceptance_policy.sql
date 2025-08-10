-- Drop the current policy and create a very simple one for testing
DROP POLICY IF EXISTS "Users can accept invitations" ON public.family_members;

-- Create the simplest possible policy that just allows authenticated users to insert themselves
-- We'll validate everything in the application code
CREATE POLICY "Users can accept invitations"
  ON public.family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());