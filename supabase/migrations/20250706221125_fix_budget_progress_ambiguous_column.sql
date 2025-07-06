-- Fix ambiguous category_id column reference in get_budget_progress function
-- This migration resolves the "column reference 'category_id' is ambiguous" error
-- by properly qualifying the column reference in the WHERE clause.

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
    budget_category RECORD;
BEGIN
    -- Get user's financial period settings
    SELECT financial_month_start_day, financial_week_start_day
    INTO v_month_start_day, v_week_start_day
    FROM user_settings
    WHERE user_id = p_user_id;

    -- For each expense category with budget
    FOR budget_category IN
        SELECT c.id, c.name, c.type, c.icon, c.budget_amount, c.budget_frequency
        FROM categories c
        WHERE c.user_id = p_user_id AND c.type = 'expense' AND c.budget_amount IS NOT NULL AND c.is_active = TRUE
    LOOP
        -- Calculate period based on frequency and user settings
        IF budget_category.budget_frequency = 'monthly' THEN
            -- Calculate custom month period
            IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
                v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
                v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
            ELSE
                v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
                v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
            END IF;
        ELSIF budget_category.budget_frequency = 'weekly' THEN
            -- Calculate custom week period
            v_period_start := v_current_date - ((EXTRACT(DOW FROM v_current_date)::INTEGER - v_week_start_day + 7) % 7) * INTERVAL '1 day';
            v_period_end := v_period_start + INTERVAL '6 days';
        ELSIF budget_category.budget_frequency = 'one_time' THEN
            -- For one-time budgets, consider all transactions
            v_period_start := '1900-01-01'::DATE;
            v_period_end := '2100-12-31'::DATE;
        END IF;

        -- Set output variables from the loop
        category_id := budget_category.id;
        category_name := budget_category.name;
        category_type := budget_category.type;
        category_icon := budget_category.icon;
        budget_amount := budget_category.budget_amount;
        budget_frequency := budget_category.budget_frequency;
        period_start := v_period_start;
        period_end := v_period_end;

        -- Calculate spent amount for the period
        -- FIX: Use budget_category.id instead of ambiguous category_id reference
        SELECT COALESCE(SUM(t.amount), 0)
        INTO spent_amount
        FROM transactions t
        WHERE t.category_id = budget_category.id
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