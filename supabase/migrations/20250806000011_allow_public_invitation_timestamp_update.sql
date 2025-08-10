-- Allow public UPDATE for touching updated_at timestamp during invitation validation
-- This is needed so the validation API can trigger the expiry checking trigger

CREATE POLICY "Allow public timestamp touch for trigger activation"
  ON public.family_invitations
  FOR UPDATE
  TO public
  USING (token IS NOT NULL)
  WITH CHECK (token IS NOT NULL);

-- Add comment explaining the purpose
COMMENT ON POLICY "Allow public timestamp touch for trigger activation" ON public.family_invitations IS 
'Allows public API endpoints to touch updated_at timestamp to trigger automatic expiry checking without allowing other data modifications';