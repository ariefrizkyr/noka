-- Correct the logic for credit card transfers in the balance update function.
-- A transfer FROM a credit card (cash advance) should INCREASE the balance (debt).
-- A transfer TO a credit card (payment) should DECREASE the balance (debt).

CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_balance_before DECIMAL(15, 2);
    v_balance_after DECIMAL(15, 2);
    v_amount DECIMAL(15, 2);
BEGIN
    -- Use absolute value for amount calculations in transfers
    v_amount := ABS(NEW.amount);
    
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'income' THEN
            -- For income: positive amount increases balance, negative amount (refund) decreases balance
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
            v_balance_after := v_balance_before + NEW.amount;
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
            
            -- Record in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
            
        ELSIF NEW.type = 'expense' THEN
            -- For expense: positive amount decreases balance (normal expense), negative amount increases balance (refund)
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
            
            -- Credit cards: expenses increase balance (debt), refunds decrease balance
            IF (SELECT type FROM accounts WHERE id = NEW.account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before + NEW.amount;
            ELSE
                -- Other accounts: expenses decrease balance, refunds increase balance
                v_balance_after := v_balance_before - NEW.amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
            
            -- Record in ledger. For credit cards, an expense is a positive change in balance (debt increases).
            -- For other accounts, an expense is a negative change.
            -- The sign of NEW.amount already handles this.
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, 
                CASE 
                    WHEN (SELECT type FROM accounts WHERE id = NEW.account_id) = 'credit_card' THEN NEW.amount 
                    ELSE -NEW.amount 
                END);
            
        ELSIF NEW.type = 'transfer' THEN
            -- From account
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.from_account_id;
            
            -- **FIXED LOGIC**: Credit card as source (cash advance): transfer INCREASES balance (debt)
            IF (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before + v_amount;
            ELSE
                -- Other accounts: transfer decreases balance
                v_balance_after := v_balance_before - v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, 
                CASE 
                    WHEN (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN v_amount 
                    ELSE -v_amount 
                END);
            
            -- To account
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.to_account_id;
            
            -- Credit card as destination (payment): transfer DECREASES balance (paying off debt)
            IF (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - v_amount;
            ELSE
                -- Other accounts: transfer increases balance
                v_balance_after := v_balance_before + v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, 
                CASE 
                    WHEN (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN -v_amount 
                    ELSE v_amount 
                END);
        END IF;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- It's safer to recalculate from ledger history.
        -- This is a complex operation and better handled at application level.
        RAISE EXCEPTION 'Transaction updates should be handled at the application level for better control.';
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Reversing the transaction based on ledger history ensures consistency.
        -- This is also better handled at the application level.
        RAISE EXCEPTION 'Transaction deletion should be handled at the application level for better control.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
