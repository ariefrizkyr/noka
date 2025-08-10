-- Fix families INSERT policy to target the correct role
-- The policy exists but targets {public} role instead of {authenticated} role
-- Supabase authenticated users need policies targeting 'authenticated' role

-- Drop the existing INSERT policy with wrong role
DROP POLICY IF EXISTS "Users can create families" ON families;

-- Create INSERT policy targeting authenticated role (not public)
CREATE POLICY "Users can create families" ON families FOR INSERT
TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Comment to document this fix
COMMENT ON POLICY "Users can create families" ON families IS 'Family Sharing Fix: Corrected role from {public} to {authenticated} for Supabase auth compatibility';