-- Create Balance Ledger Table (Balance History) as specified in the PRD

CREATE TABLE balance_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    change_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ledger_account ON balance_ledger(account_id);
CREATE INDEX idx_ledger_transaction ON balance_ledger(transaction_id);
CREATE INDEX idx_ledger_created ON balance_ledger(created_at);
