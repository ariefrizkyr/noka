-- Complete Missing RLS Policies

-- Add missing DELETE policy for user_settings table
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Enable Row Level Security on balance_ledger table
ALTER TABLE balance_ledger ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for balance_ledger table
-- Note: balance_ledger doesn't have user_id directly, so we join through accounts table

CREATE POLICY "Users can view own balance ledger" ON balance_ledger FOR SELECT 
USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own balance ledger" ON balance_ledger FOR INSERT 
WITH CHECK (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own balance ledger" ON balance_ledger FOR UPDATE 
USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own balance ledger" ON balance_ledger FOR DELETE 
USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())); 