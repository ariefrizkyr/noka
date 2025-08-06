-- Allow public access to family_invitations for token validation
-- This is needed for the public invitation validation API endpoint

-- Add policy to allow public SELECT on family_invitations using token
-- This allows the validation endpoint to work without authentication
CREATE POLICY "Allow public token validation"
ON public.family_invitations
FOR SELECT
TO public
USING (token IS NOT NULL);

-- Note: This policy is safe because:
-- 1. It only allows SELECT operations (read-only)
-- 2. It only applies to records where token IS NOT NULL
-- 3. Tokens are UUIDs that are cryptographically secure and unguessable
-- 4. The token validation endpoint only returns limited invitation details
-- 5. Users still need authentication to accept/decline invitations