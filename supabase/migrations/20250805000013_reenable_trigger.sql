-- Re-enable the trigger now that RLS is disabled on both tables
-- This will test the complete automated flow

-- Re-create the trigger that automatically adds the creator as admin
CREATE TRIGGER trigger_add_creator_as_admin
    AFTER INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION add_creator_as_admin();

-- Comment to document this
COMMENT ON TRIGGER trigger_add_creator_as_admin ON families IS 'Re-enabled: Automatically adds family creator as admin member';