-- Add debugging function to check what auth.uid() returns
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;