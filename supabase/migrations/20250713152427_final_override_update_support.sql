-- FINAL OVERRIDE: Ensure UPDATE support in trigger function
-- This migration runs LAST to override any previous function definitions
-- that removed UPDATE support

CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_balance_before DECIMAL(15, 2);
    v_balance_after DECIMAL(15, 2);
    v_amount DECIMAL(15, 2);
    v_transaction_record RECORD;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_transaction_record := NEW;
        -- Use absolute value for amount calculations
        v_amount := ABS(NEW.amount);
        
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
            
            -- Record in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
            
        ELSIF NEW.type = 'transfer' THEN
            -- Transfers always use positive amounts
            -- From account
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.from_account_id;
            
            -- Credit card as source: transfer decreases balance (paying off debt)
            IF (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - v_amount;
            ELSE
                -- Other accounts: transfer decreases balance
                v_balance_after := v_balance_before - v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, -v_amount);
            
            -- To account
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.to_account_id;
            
            -- Credit card as destination: transfer decreases balance (paying off debt)
            IF (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - v_amount;
            ELSE
                -- Other accounts: transfer increases balance
                v_balance_after := v_balance_before + v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, v_amount);
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle UPDATE operations by reversing old transaction and applying new one
        -- This ensures correct balance updates when editing transactions
        
        -- Step 1: Reverse the effects of the OLD transaction
        v_amount := ABS(OLD.amount);
        
        IF OLD.type = 'income' THEN
            -- Reverse income: subtract the amount that was previously added
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = OLD.account_id;
            v_balance_after := v_balance_before - OLD.amount;
            UPDATE accounts SET current_balance = v_balance_after WHERE id = OLD.account_id;
            
            -- Record reversal in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (OLD.account_id, OLD.id, v_balance_before, v_balance_after, -OLD.amount);
            
        ELSIF OLD.type = 'expense' THEN
            -- Reverse expense: add back the amount that was previously subtracted
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = OLD.account_id;
            
            -- Credit cards: reverse expense by subtracting (debt was increased, now decrease it)
            IF (SELECT type FROM accounts WHERE id = OLD.account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - OLD.amount;
            ELSE
                -- Other accounts: reverse expense by adding back
                v_balance_after := v_balance_before + OLD.amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = OLD.account_id;
            
            -- Record reversal in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (OLD.account_id, OLD.id, v_balance_before, v_balance_after, -OLD.amount);
            
        ELSIF OLD.type = 'transfer' THEN
            -- Reverse transfer: add back to from_account, subtract from to_account
            
            -- Reverse from account (add back the amount that was subtracted)
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = OLD.from_account_id;
            
            -- Credit card as source: reverse by adding back (debt was decreased, now increase it)
            IF (SELECT type FROM accounts WHERE id = OLD.from_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before + v_amount;
            ELSE
                -- Other accounts: reverse by adding back
                v_balance_after := v_balance_before + v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = OLD.from_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (OLD.from_account_id, OLD.id, v_balance_before, v_balance_after, v_amount);
            
            -- Reverse to account (subtract the amount that was previously added)
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = OLD.to_account_id;
            
            -- Credit card as destination: reverse by adding (debt was decreased, now increase it)
            IF (SELECT type FROM accounts WHERE id = OLD.to_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before + v_amount;
            ELSE
                -- Other accounts: reverse by subtracting
                v_balance_after := v_balance_before - v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = OLD.to_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (OLD.to_account_id, OLD.id, v_balance_before, v_balance_after, -v_amount);
        END IF;
        
        -- Step 2: Apply the effects of the NEW transaction
        v_amount := ABS(NEW.amount);
        
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
            
            -- Record in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
            
        ELSIF NEW.type = 'transfer' THEN
            -- Transfers always use positive amounts
            -- From account
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.from_account_id;
            
            -- Credit card as source: transfer decreases balance (paying off debt)
            IF (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - v_amount;
            ELSE
                -- Other accounts: transfer decreases balance
                v_balance_after := v_balance_before - v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, -v_amount);
            
            -- To account
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.to_account_id;
            
            -- Credit card as destination: transfer decreases balance (paying off debt)
            IF (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - v_amount;
            ELSE
                -- Other accounts: transfer increases balance
                v_balance_after := v_balance_before + v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, v_amount);
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_transaction_record := OLD;
        -- Use absolute value for amount calculations
        v_amount := ABS(OLD.amount);
        
        -- Reverse the balance changes for deletion
        IF OLD.type = 'income' THEN
            -- Reverse income: subtract the amount that was previously added
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = OLD.account_id;
            v_balance_after := v_balance_before - OLD.amount;
            UPDATE accounts SET current_balance = v_balance_after WHERE id = OLD.account_id;
            
            -- Record reversal in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (OLD.account_id, OLD.id, v_balance_before, v_balance_after, -OLD.amount);
            
        ELSIF OLD.type = 'expense' THEN
            -- Reverse expense: add back the amount that was previously subtracted
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = OLD.account_id;
            
            -- Credit cards: reverse expense by subtracting (debt was increased, now decrease it)
            IF (SELECT type FROM accounts WHERE id = OLD.account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - OLD.amount;
            ELSE
                -- Other accounts: reverse expense by adding back
                v_balance_after := v_balance_before + OLD.amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = OLD.account_id;
            
            -- Record reversal in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (OLD.account_id, OLD.id, v_balance_before, v_balance_after, -OLD.amount);
            
        ELSIF OLD.type = 'transfer' THEN
            -- Reverse transfer: add back to from_account, subtract from to_account
            
            -- Reverse from account (add back the amount that was subtracted)
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = OLD.from_account_id;
            
            -- Credit card as source: reverse by adding back (debt was decreased, now increase it)
            IF (SELECT type FROM accounts WHERE id = OLD.from_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before + v_amount;
            ELSE
                -- Other accounts: reverse by adding back
                v_balance_after := v_balance_before + v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = OLD.from_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (OLD.from_account_id, OLD.id, v_balance_before, v_balance_after, v_amount);
            
            -- Reverse to account (subtract the amount that was previously added)
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = OLD.to_account_id;
            
            -- Credit card as destination: reverse by adding (debt was decreased, now increase it)
            IF (SELECT type FROM accounts WHERE id = OLD.to_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before + v_amount;
            ELSE
                -- Other accounts: reverse by subtracting
                v_balance_after := v_balance_before - v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = OLD.to_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (OLD.to_account_id, OLD.id, v_balance_before, v_balance_after, -v_amount);
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add final comment to document this override
COMMENT ON FUNCTION update_account_balance_with_ledger() IS 'FINAL VERSION: Handles account balance updates for transaction INSERT, UPDATE, and DELETE operations. UPDATE operations reverse old transaction effects and apply new ones. This version overrides any previous versions that threw exceptions for UPDATE operations.';