-- Description: This migration fixes a bug where the get_investment_progress function
-- referenced a non-existent column (investment_category_id) in the transactions table.
-- This script adds the column and updates the necessary constraints to ensure data integrity.

-- Step 1: Add the investment_category_id column to the transactions table.
-- This column will store a reference to an investment goal category for transfer transactions.
ALTER TABLE public.transactions
ADD COLUMN investment_category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT;

-- Step 2: Create an index on the new column for better query performance.
CREATE INDEX idx_transactions_investment_category ON public.transactions(investment_category_id);

-- Step 3: Drop the existing check constraint so it can be replaced.
ALTER TABLE public.transactions
DROP CONSTRAINT chk_transaction_consistency;

-- Step 4: Re-add the check constraint with updated logic.
-- The new logic ensures that:
-- 1. For 'income' or 'expense' types, investment_category_id MUST be NULL.
-- 2. For 'transfer' type, the original rules apply, and investment_category_id is optional.
ALTER TABLE public.transactions
ADD CONSTRAINT chk_transaction_consistency CHECK (
    (
        type IN ('income', 'expense') AND
        account_id IS NOT NULL AND
        category_id IS NOT NULL AND
        from_account_id IS NULL AND
        to_account_id IS NULL AND
        investment_category_id IS NULL
    ) OR (
        type = 'transfer' AND
        from_account_id IS NOT NULL AND
        to_account_id IS NOT NULL AND
        account_id IS NULL AND
        category_id IS NULL
    )
);

-- Step 5: Refresh the get_investment_progress function to ensure it recognizes the new column.
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