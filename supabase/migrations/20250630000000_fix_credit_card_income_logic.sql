-- Fix the credit card income logic in the balance update function.
-- For credit cards:
-- - Income transactions (payments) should DECREASE the balance (reduce debt)
-- - Expense transactions should INCREASE the balance (increase debt)

CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_balance_before DECIMAL(15, 2);
    v_balance_after DECIMAL(15, 2);
    v_amount DECIMAL(15, 2);
    v_account_type account_type;
BEGIN
    -- Use absolute value for amount calculations in transfers
    v_amount := ABS(NEW.amount);
    
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'income' THEN
            -- Get account type and current balance
            SELECT type, current_balance INTO v_account_type, v_balance_before 
            FROM accounts WHERE id = NEW.account_id;
            
            -- Credit cards: income (payments) decreases balance (reduces debt)
            -- Other accounts: income increases balance
            IF v_account_type = 'credit_card' THEN
                v_balance_after := v_balance_before - NEW.amount;
            ELSE
                v_balance_after := v_balance_before + NEW.amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
            
            -- Record in ledger with appropriate change amount
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, 
                CASE 
                    WHEN v_account_type = 'credit_card' THEN -NEW.amount 
                    ELSE NEW.amount 
                END);
            
        ELSIF NEW.type = 'expense' THEN
            -- Get account type and current balance
            SELECT type, current_balance INTO v_account_type, v_balance_before 
            FROM accounts WHERE id = NEW.account_id;
            
            -- Credit cards: expenses increase balance (debt), refunds decrease balance
            -- Other accounts: expenses decrease balance, refunds increase balance
            IF v_account_type = 'credit_card' THEN
                v_balance_after := v_balance_before + NEW.amount;
            ELSE
                v_balance_after := v_balance_before - NEW.amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
            
            -- Record in ledger with appropriate change amount
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, 
                CASE 
                    WHEN v_account_type = 'credit_card' THEN NEW.amount 
                    ELSE -NEW.amount 
                END);
            
        ELSIF NEW.type = 'transfer' THEN
            -- From account
            SELECT type, current_balance INTO v_account_type, v_balance_before 
            FROM accounts WHERE id = NEW.from_account_id;
            
            -- Credit card as source (cash advance): transfer INCREASES balance (debt)
            -- Other accounts: transfer decreases balance
            IF v_account_type = 'credit_card' THEN
                v_balance_after := v_balance_before + v_amount;
            ELSE
                v_balance_after := v_balance_before - v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, 
                CASE 
                    WHEN v_account_type = 'credit_card' THEN v_amount 
                    ELSE -v_amount 
                END);
            
            -- To account
            SELECT type, current_balance INTO v_account_type, v_balance_before 
            FROM accounts WHERE id = NEW.to_account_id;
            
            -- Credit card as destination (payment): transfer DECREASES balance (paying off debt)
            -- Other accounts: transfer increases balance
            IF v_account_type = 'credit_card' THEN
                v_balance_after := v_balance_before - v_amount;
            ELSE
                v_balance_after := v_balance_before + v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, 
                CASE 
                    WHEN v_account_type = 'credit_card' THEN -v_amount 
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