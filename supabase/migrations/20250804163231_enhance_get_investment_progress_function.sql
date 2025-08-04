-- Family Sharing Foundation: Enhance get_investment_progress function
-- Update get_investment_progress to support family categories and member contributions like get_budget_progress

-- Drop the existing get_investment_progress function
DROP FUNCTION IF EXISTS get_investment_progress(UUID);

-- Create the enhanced version with family support and member contributions
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
    period_end DATE,
    is_shared BOOLEAN,
    family_id UUID,
    family_name VARCHAR(255),
    member_contributions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_month_start_day INTEGER;
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
    user_family_ids UUID[];
    rec RECORD;
BEGIN
    -- Get user's financial month start day
    SELECT financial_month_start_day
    INTO v_month_start_day
    FROM public.user_settings
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

    -- Get user's family IDs once (performance optimization)
    SELECT ARRAY(
        SELECT fm.family_id 
        FROM public.family_members fm 
        WHERE fm.user_id = p_user_id
    ) INTO user_family_ids;

    -- Return investment categories with progress
    FOR rec IN
        SELECT 
            c.id as cat_id,
            c.name as cat_name,
            c.icon as cat_icon,
            c.budget_amount as cat_target_amount,
            c.budget_frequency as cat_target_frequency,
            c.is_shared as cat_is_shared,
            c.family_id as cat_family_id,
            f.name as cat_family_name,
            COALESCE(SUM(t.amount), 0) as total_invested
        FROM public.categories c
        LEFT JOIN public.families f ON f.id = c.family_id
        LEFT JOIN public.transactions t ON t.category_id = c.id
            AND t.transaction_date >= v_period_start 
            AND t.transaction_date <= v_period_end
        WHERE (
            -- Personal categories
            (c.user_id = p_user_id AND c.is_shared = FALSE) OR
            -- Shared family categories
            (c.is_shared = TRUE AND c.family_id = ANY(user_family_ids))
        )
        AND c.budget_amount IS NOT NULL
        AND c.type = 'investment'
        GROUP BY c.id, c.name, c.icon, c.budget_amount, c.budget_frequency, c.is_shared, c.family_id, f.name
    LOOP
        -- Calculate member contributions for shared categories
        IF rec.cat_is_shared AND rec.cat_family_id IS NOT NULL THEN
            SELECT json_agg(
                json_build_object(
                    'user_id', contrib.user_id,
                    'user_email', contrib.user_email,
                    'contribution_amount', contrib.contribution_amount,
                    'percentage', 
                    CASE 
                        WHEN rec.total_invested > 0 
                        THEN ROUND((contrib.contribution_amount / rec.total_invested) * 100, 2)
                        ELSE 0 
                    END
                )
            ) INTO member_contributions
            FROM (
                SELECT 
                    fm.user_id,
                    u.email as user_email,
                    COALESCE(SUM(t.amount), 0) as contribution_amount
                FROM public.family_members fm
                JOIN auth.users u ON u.id = fm.user_id
                LEFT JOIN public.transactions t ON t.logged_by_user_id = fm.user_id 
                    AND t.category_id = rec.cat_id
                    AND t.transaction_date >= v_period_start
                    AND t.transaction_date <= v_period_end
                WHERE fm.family_id = rec.cat_family_id
                GROUP BY fm.user_id, u.email
            ) contrib;
        ELSE
            member_contributions := '[]'::jsonb;
        END IF;

        -- Return the row
        category_id := rec.cat_id;
        category_name := rec.cat_name;
        category_icon := rec.cat_icon;
        target_amount := rec.cat_target_amount;
        target_frequency := rec.cat_target_frequency;
        invested_amount := rec.total_invested;
        remaining_amount := rec.cat_target_amount - rec.total_invested;
        progress_percentage := CASE 
            WHEN rec.cat_target_amount > 0 
            THEN ROUND((rec.total_invested / rec.cat_target_amount) * 100, 2)
            ELSE 0 
        END;
        period_start := v_period_start;
        period_end := v_period_end;
        is_shared := rec.cat_is_shared;
        family_id := rec.cat_family_id;
        family_name := rec.cat_family_name;
        
        RETURN NEXT;
    END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_investment_progress(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_investment_progress(UUID) IS 'Family Sharing: Enhanced investment progress with family categories and member contribution tracking';