-- Add onboarding step tracking to user_settings table
-- This allows tracking individual step completion independent of data existence

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS onboarding_step_1_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step_2_completed BOOLEAN DEFAULT FALSE, 
ADD COLUMN IF NOT EXISTS onboarding_step_3_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 1;

-- Update existing users who have onboarding_completed = true to have all steps completed
UPDATE user_settings 
SET 
  onboarding_step_1_completed = TRUE,
  onboarding_step_2_completed = TRUE, 
  onboarding_step_3_completed = TRUE,
  onboarding_current_step = 3
WHERE onboarding_completed = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN user_settings.onboarding_step_1_completed IS 'Tracks if user completed step 1 (settings setup)';
COMMENT ON COLUMN user_settings.onboarding_step_2_completed IS 'Tracks if user completed step 2 (account setup)';
COMMENT ON COLUMN user_settings.onboarding_step_3_completed IS 'Tracks if user completed step 3 (category setup)';
COMMENT ON COLUMN user_settings.onboarding_current_step IS 'Current step user is on or should resume from'; 