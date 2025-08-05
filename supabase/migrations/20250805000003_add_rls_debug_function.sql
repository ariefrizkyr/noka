-- Add debugging function to test the exact RLS condition
CREATE OR REPLACE FUNCTION test_family_insert_policy(test_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT test_user_id = auth.uid();
$$;