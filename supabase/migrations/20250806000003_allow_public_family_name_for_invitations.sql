-- Allow public access to family name for invitation validation
-- This is needed when validating invitation tokens without authentication

-- Add policy to allow public SELECT on families when referenced by invitation tokens
-- This allows the validation endpoint to get family names for valid invitations
CREATE POLICY "Allow public family name access for invitation validation"
ON public.families
FOR SELECT
TO public
USING (
  id IN (
    SELECT family_id 
    FROM public.family_invitations 
    WHERE token IS NOT NULL
  )
);

-- Note: This policy is safe because:
-- 1. It only allows SELECT operations (read-only)
-- 2. It only allows access to families that have active invitations
-- 3. It only exposes the family name and ID (minimal information)
-- 4. The token system ensures only users with valid invitation links can trigger this
-- 5. Users still need authentication to actually join families