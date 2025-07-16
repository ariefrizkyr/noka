-- Add weekend adjustment functions for financial period calculations
-- This handles adjusting period end dates based on user's weekend_end_handling preference

-- Function to adjust date based on weekend handling preference
CREATE OR REPLACE FUNCTION adjust_weekend_date(
    p_date DATE,
    p_weekend_handling weekend_handling
) RETURNS DATE AS $$
DECLARE
    v_day_of_week INTEGER;
BEGIN
    -- Get day of week (0 = Sunday, 6 = Saturday)
    v_day_of_week := EXTRACT(DOW FROM p_date);
    
    -- Only adjust if it's a weekend (Saturday = 6, Sunday = 0)
    IF v_day_of_week = 6 OR v_day_of_week = 0 THEN
        CASE p_weekend_handling
            WHEN 'move_to_friday' THEN
                -- Move to previous Friday
                IF v_day_of_week = 6 THEN -- Saturday
                    RETURN p_date - INTERVAL '1 day';
                ELSE -- Sunday
                    RETURN p_date - INTERVAL '2 days';
                END IF;
            WHEN 'move_to_monday' THEN
                -- Move to next Monday
                IF v_day_of_week = 6 THEN -- Saturday
                    RETURN p_date + INTERVAL '2 days';
                ELSE -- Sunday
                    RETURN p_date + INTERVAL '1 day';
                END IF;
            WHEN 'no_adjustment' THEN
                -- No adjustment needed
                RETURN p_date;
            ELSE
                -- Default: no adjustment
                RETURN p_date;
        END CASE;
    ELSE
        -- Not a weekend, return original date
        RETURN p_date;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update get_financial_summary function to handle weekend adjustments
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
    v_weekend_handling weekend_handling;
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
    v_total_income DECIMAL(15, 2);
    v_total_expenses DECIMAL(15, 2);
BEGIN
    -- Get user's financial settings
    SELECT financial_month_start_day, COALESCE(weekend_end_handling, 'no_adjustment')
    INTO v_month_start_day, v_weekend_handling
    FROM user_settings
    WHERE user_id = p_user_id;

    -- If no settings, use defaults
    IF NOT FOUND THEN
        v_month_start_day := 1;
        v_weekend_handling := 'no_adjustment';
    END IF;

    -- Calculate custom month period
    IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
        v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
        v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
    ELSE
        v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
        v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
    END IF;

    -- Apply weekend adjustment to period end date
    v_period_end := adjust_weekend_date(v_period_end, v_weekend_handling);

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

-- Update get_budget_progress function to handle weekend adjustments
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
    v_weekend_handling weekend_handling;
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
    budget_category RECORD;
BEGIN
    -- Get user's financial period settings
    SELECT financial_month_start_day, financial_week_start_day, COALESCE(weekend_end_handling, 'no_adjustment')
    INTO v_month_start_day, v_week_start_day, v_weekend_handling
    FROM user_settings
    WHERE user_id = p_user_id;

    -- If no settings, use defaults
    IF NOT FOUND THEN
        v_month_start_day := 1;
        v_week_start_day := 1;
        v_weekend_handling := 'no_adjustment';
    END IF;

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
            
            -- Apply weekend adjustment to period end date
            v_period_end := adjust_weekend_date(v_period_end, v_weekend_handling);
            
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

-- Update get_investment_progress function to handle weekend adjustments
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
    v_weekend_handling weekend_handling;
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
    inv_category RECORD;
BEGIN
    -- Get user's financial period settings
    SELECT financial_month_start_day, COALESCE(weekend_end_handling, 'no_adjustment')
    INTO v_month_start_day, v_weekend_handling
    FROM user_settings
    WHERE user_id = p_user_id;

    -- If no settings, use defaults
    IF NOT FOUND THEN
        v_month_start_day := 1;
        v_weekend_handling := 'no_adjustment';
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
            
            -- Apply weekend adjustment to period end date
            v_period_end := adjust_weekend_date(v_period_end, v_weekend_handling);
            
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