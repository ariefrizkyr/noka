-- Add get_family_members_with_emails function
-- Creates a SECURITY DEFINER function to safely access family member emails from auth.users

-- Create security definer function to get family members with their emails
CREATE OR REPLACE FUNCTION get_family_members_with_emails(p_family_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email VARCHAR(255),
    role family_role,
    joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Verify user has access to this family (security check)
    IF NOT EXISTS (
        SELECT 1 FROM public.family_members fm 
        WHERE fm.family_id = p_family_id 
        AND fm.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied to family data';
    END IF;
    
    -- Return family members with their emails from auth.users
    RETURN QUERY
    SELECT 
        fm.id,
        fm.user_id,
        u.email,
        fm.role,
        fm.joined_at
    FROM public.family_members fm
    JOIN auth.users u ON u.id = fm.user_id
    WHERE fm.family_id = p_family_id
    ORDER BY fm.joined_at ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_family_members_with_emails(UUID) TO authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION get_family_members_with_emails(UUID) IS 'SECURITY DEFINER function to get family members with emails for family member display, ensures single source of truth for email data';