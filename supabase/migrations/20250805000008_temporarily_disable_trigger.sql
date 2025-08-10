-- Temporarily disable the trigger to test if it's causing the RLS violation
-- This will help us confirm that the trigger is the root cause of the issue

-- Disable the trigger
DROP TRIGGER IF EXISTS trigger_add_creator_as_admin ON families;

-- Comment to document this temporary fix
COMMENT ON TABLE families IS 'TEMPORARY: Disabled trigger_add_creator_as_admin to test if it causes RLS violations';