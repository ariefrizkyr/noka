-- Family Sharing Foundation: Drop old get_budget_progress function
-- Required before creating new version with different return type

-- Drop the existing get_budget_progress function so we can recreate it with new columns
DROP FUNCTION IF EXISTS get_budget_progress(UUID);

-- Comment to document this migration
COMMENT ON SCHEMA public IS 'Family Sharing: Dropped old get_budget_progress function to allow recreation with family support';