-- Add get_transaction_user_email function
-- Creates a SECURITY DEFINER function to safely access user emails for transaction attribution

-- Create security definer function to get user email for transaction attribution
CREATE OR REPLACE FUNCTION get_transaction_user_email(p_user_id UUID)
RETURNS VARCHAR(255)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_email VARCHAR(255);
BEGIN
    -- If requesting info about the current user, return their email directly
    IF p_user_id = auth.uid() THEN
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = p_user_id;
        
        RETURN COALESCE(user_email, 'Unknown user');
    END IF;
    
    -- Check if the requesting user and target user share any families
    IF EXISTS (
        SELECT 1 
        FROM public.family_members fm1
        JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
        WHERE fm1.user_id = auth.uid() 
        AND fm2.user_id = p_user_id
    ) THEN
        -- Users share a family, return the actual email
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = p_user_id;
        
        RETURN COALESCE(user_email, 'Unknown family member');
    ELSE
        -- Users don't share a family, return generic identifier
        RETURN 'Another user';
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_transaction_user_email(UUID) TO authenticated;

-- Add comment to document the function
COMMENT ON FUNCTION get_transaction_user_email(UUID) IS 'SECURITY DEFINER function to get user email for transaction attribution, only returns actual emails for family members';