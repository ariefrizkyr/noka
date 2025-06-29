-- Create Database Functions and Triggers as specified in the PRD

-- Function to get financial summary
CREATE OR REPLACE FUNCTION get_financial_summary(p_user_id UUID)
RETURNS TABLE (
    total_income DECIMAL(15, 2),
    total_expenses DECIMAL(15, 2),
    net_savings DECIMAL(15, 2),
    period_start DATE,
    period_end DATE
) AS $$
DECLARE
    v_month_start_day INTEGER;
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
    v_total_income DECIMAL(15, 2);
    v_total_expenses DECIMAL(15, 2);
BEGIN
    -- Get user's financial month start day
    SELECT financial_month_start_day
    INTO v_month_start_day
    FROM user_settings
    WHERE user_id = p_user_id;

    -- If no settings, use default (day 1)
    IF NOT FOUND THEN
        v_month_start_day := 1;
    END IF;

    -- Calculate custom month period
    IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
        v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
        v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
    ELSE
        v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
        v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
    END IF;

    -- Calculate total income for the period
    SELECT COALESCE(SUM(t.amount), 0)
    INTO v_total_income
    FROM transactions t
    WHERE t.user_id = p_user_id
        AND t.type = 'income'
        AND t.transaction_date >= v_period_start
        AND t.transaction_date <= v_period_end;

    -- Calculate total expenses for the period
    SELECT COALESCE(SUM(t.amount), 0)
    INTO v_total_expenses
    FROM transactions t
    WHERE t.user_id = p_user_id
        AND t.type = 'expense'
        AND t.transaction_date >= v_period_start
        AND t.transaction_date <= v_period_end;

    -- Set output variables
    total_income := v_total_income;
    total_expenses := v_total_expenses;
    net_savings := v_total_income - v_total_expenses;
    period_start := v_period_start;
    period_end := v_period_end;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate budget progress for expense categories
CREATE OR REPLACE FUNCTION get_budget_progress(p_user_id UUID)
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR(255),
    category_type category_type,
    category_icon VARCHAR(10),
    budget_amount DECIMAL(15, 2),
    budget_frequency budget_frequency,
    spent_amount DECIMAL(15, 2),
    remaining_amount DECIMAL(15, 2),
    progress_percentage DECIMAL(5, 2),
    period_start DATE,
    period_end DATE
) AS $$
DECLARE
    v_month_start_day INTEGER;
    v_week_start_day INTEGER;
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    -- Get user's financial period settings
    SELECT financial_month_start_day, financial_week_start_day
    INTO v_month_start_day, v_week_start_day
    FROM user_settings
    WHERE user_id = p_user_id;

    -- For each expense category with budget
    FOR category_id, category_name, category_type, category_icon, budget_amount, budget_frequency IN
        SELECT c.id, c.name, c.type, c.icon, c.budget_amount, c.budget_frequency
        FROM categories c
        WHERE c.user_id = p_user_id AND c.type = 'expense' AND c.budget_amount IS NOT NULL AND c.is_active = TRUE
    LOOP
        -- Calculate period based on frequency and user settings
        IF budget_frequency = 'monthly' THEN
            -- Calculate custom month period
            IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
                v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
                v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
            ELSE
                v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
                v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
            END IF;
        ELSIF budget_frequency = 'weekly' THEN
            -- Calculate custom week period
            v_period_start := v_current_date - ((EXTRACT(DOW FROM v_current_date)::INTEGER - v_week_start_day + 7) % 7) * INTERVAL '1 day';
            v_period_end := v_period_start + INTERVAL '6 days';
        ELSIF budget_frequency = 'one_time' THEN
            -- For one-time budgets, consider all transactions
            v_period_start := '1900-01-01'::DATE;
            v_period_end := '2100-12-31'::DATE;
        END IF;

        -- Calculate spent amount for the period
        SELECT COALESCE(SUM(t.amount), 0)
        INTO spent_amount
        FROM transactions t
        WHERE t.category_id = category_id
            AND t.transaction_date >= v_period_start
            AND t.transaction_date <= v_period_end
            AND t.type = 'expense';

        -- Calculate remaining and percentage
        remaining_amount := budget_amount - spent_amount;
        progress_percentage := CASE 
            WHEN budget_amount > 0 THEN (spent_amount / budget_amount * 100)
            ELSE 0
        END;

        -- Return the row
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get investment progress
CREATE OR REPLACE FUNCTION get_investment_progress(p_user_id UUID)
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR(255),
    category_icon VARCHAR(10),
    target_amount DECIMAL(15, 2),
    target_frequency budget_frequency,
    invested_amount DECIMAL(15, 2),
    remaining_amount DECIMAL(15, 2),
    progress_percentage DECIMAL(5, 2),
    period_start DATE,
    period_end DATE
) AS $$
DECLARE
    v_month_start_day INTEGER;
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
    inv_category RECORD;
BEGIN
    -- Get user's financial period settings
    SELECT financial_month_start_day
    INTO v_month_start_day
    FROM user_settings
    WHERE user_id = p_user_id;

    -- If no settings, use default (day 1)
    IF NOT FOUND THEN
        v_month_start_day := 1;
    END IF;

    -- For each investment category with a target
    FOR inv_category IN
        SELECT c.id, c.name, c.icon, c.budget_amount, c.budget_frequency
        FROM categories c
        WHERE c.user_id = p_user_id
          AND c.type = 'investment'
          AND c.budget_amount IS NOT NULL
          AND c.is_active = TRUE
    LOOP
        -- Calculate period based on frequency and user settings
        IF inv_category.budget_frequency = 'monthly' THEN
            -- Calculate custom month period
            IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
                v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
                v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
            ELSE
                v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
                v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
            END IF;
        ELSIF inv_category.budget_frequency = 'one_time' THEN
            -- For one-time targets, consider all transactions
            v_period_start := '1900-01-01'::DATE;
            v_period_end := '2100-12-31'::DATE;
        ELSE
            -- Skip other frequencies for investments
            CONTINUE;
        END IF;

        -- Set output variables from the loop
        category_id := inv_category.id;
        category_name := inv_category.name;
        category_icon := inv_category.icon;
        target_amount := inv_category.budget_amount;
        target_frequency := inv_category.budget_frequency;
        period_start := v_period_start;
        period_end := v_period_end;

        -- Calculate invested amount for the period
        SELECT COALESCE(SUM(t.amount), 0)
        INTO invested_amount
        FROM transactions t
        WHERE t.user_id = p_user_id
            AND t.type = 'transfer'
            AND t.investment_category_id = inv_category.id
            AND t.transaction_date >= v_period_start
            AND t.transaction_date <= v_period_end;

        -- Calculate remaining and percentage
        remaining_amount := target_amount - invested_amount;
        progress_percentage := CASE
            WHEN target_amount > 0 THEN (invested_amount / target_amount * 100)
            ELSE 0
        END;

        -- Return the row
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balance and record ledger entry
CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_balance_before DECIMAL(15, 2);
    v_balance_after DECIMAL(15, 2);
    v_amount DECIMAL(15, 2);
BEGIN
    -- Use absolute value for amount calculations
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
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- For updates, it's safer to recalculate from ledger history
        -- This is a complex operation and might be better handled at application level
        RAISE EXCEPTION 'Transaction updates should be handled at application level for better control';
        
    ELSIF TG_OP = 'DELETE' THEN
        -- For deletes, reverse the transaction based on ledger history
        -- This ensures consistency with the historical record
        RAISE EXCEPTION 'Transaction deletion should be handled at application level for better control';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for account balance updates
CREATE TRIGGER trigger_update_account_balance
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to all tables
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
