-- Add weekend end handling configuration to user_settings table
-- This allows users to configure how financial periods handle weekends

-- Create enum for weekend handling options
CREATE TYPE weekend_handling AS ENUM ('no_adjustment', 'move_to_friday', 'move_to_monday');

-- Add weekend_end_handling column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN weekend_end_handling weekend_handling DEFAULT 'no_adjustment';

-- Add comment for documentation
COMMENT ON COLUMN user_settings.weekend_end_handling IS 'How to handle financial period end dates that fall on weekends: no_adjustment (default), move_to_friday (previous Friday), move_to_monday (following Monday)';

-- Update the update trigger to include the new column
-- (The trigger should automatically handle this, but we ensure it's included)