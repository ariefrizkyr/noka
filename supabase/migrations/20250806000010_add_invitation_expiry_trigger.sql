-- Add automatic invitation expiry checking via database trigger
-- This trigger will automatically update invitation status to 'expired' when accessed after expiry date

-- Create the trigger function
CREATE OR REPLACE FUNCTION check_invitation_expiry() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if invitation has expired and is still pending
  IF NEW.expires_at < NOW() AND NEW.status = 'pending' THEN
    -- Mark the invitation as expired
    NEW.status = 'expired';
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that fires on UPDATE operations
-- This will check expiry when invitation records are modified (like during validation queries)
CREATE TRIGGER invitation_expiry_check
  BEFORE UPDATE ON family_invitations
  FOR EACH ROW
  EXECUTE FUNCTION check_invitation_expiry();

-- Add a comment explaining the trigger's purpose
COMMENT ON TRIGGER invitation_expiry_check ON family_invitations IS 
'Automatically marks invitations as expired when they are accessed after their expiry date';

COMMENT ON FUNCTION check_invitation_expiry() IS 
'Trigger function that checks and updates invitation expiry status on access';