-- Family Sharing Foundation: Create correct get_budget_progress function
-- Based on the specification in database-schema.md

-- Drop any incomplete version first
DROP FUNCTION IF EXISTS get_budget_progress(UUID);

-- Create the correct version with proper period calculation
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

    RETURN QUERY
    WITH user_families AS (
        SELECT fm.family_id, f.name as family_name
        FROM public.family_members fm
        JOIN public.families f ON f.id = fm.family_id
        WHERE fm.user_id = p_user_id
    ),
    accessible_categories AS (
        -- Personal categories
        SELECT c.*, FALSE as is_family, NULL::UUID as cat_family_id, NULL::VARCHAR as cat_family_name,
               v_period_start as period_start, v_period_end as period_end
        FROM public.categories c
        WHERE c.user_id = p_user_id 
        AND c.is_shared = FALSE
        AND c.budget_amount IS NOT NULL
        AND c.type = 'expense'
        
        UNION ALL
        
        -- Shared family categories (using pre-computed family IDs)
        SELECT c.*, TRUE as is_family, c.family_id as cat_family_id, uf.family_name as cat_family_name,
               v_period_start as period_start, v_period_end as period_end
        FROM public.categories c
        JOIN user_families uf ON uf.family_id = c.family_id
        WHERE c.is_shared = TRUE
        AND c.family_id = ANY(user_family_ids)
        AND c.budget_amount IS NOT NULL
        AND c.type = 'expense'
    ),
    budget_calculations AS (
        SELECT 
            ac.*,
            COALESCE(SUM(t.amount), 0) as calculated_spent,
            -- Calculate member contributions for shared categories only
            CASE 
                WHEN ac.is_family THEN 
                    json_agg(
                        json_build_object(
                            'user_id', fm.user_id,
                            'user_email', u.email,
                            'contribution_amount', COALESCE(member_spent.amount, 0),
                            'percentage', 
                            CASE 
                                WHEN COALESCE(SUM(t.amount), 0) > 0 
                                THEN ROUND((COALESCE(member_spent.amount, 0) / COALESCE(SUM(t.amount), 1)) * 100, 2)
                                ELSE 0 
                            END
                        )
                    ) FILTER (WHERE fm.user_id IS NOT NULL)
                ELSE NULL 
            END as contributions
        FROM accessible_categories ac
        LEFT JOIN public.transactions t ON t.category_id = ac.id
            AND t.transaction_date >= ac.period_start 
            AND t.transaction_date <= ac.period_end
        LEFT JOIN public.family_members fm ON fm.family_id = ac.cat_family_id
        LEFT JOIN auth.users u ON u.id = fm.user_id
        LEFT JOIN LATERAL (
            SELECT COALESCE(SUM(mt.amount), 0) as amount
            FROM public.transactions mt
            WHERE mt.category_id = ac.id 
            AND mt.logged_by_user_id = fm.user_id
            AND mt.transaction_date >= ac.period_start 
            AND mt.transaction_date <= ac.period_end
        ) member_spent ON ac.is_family
        WHERE ac.budget_amount IS NOT NULL
        GROUP BY ac.id, ac.name, ac.type, ac.icon, ac.budget_amount, ac.budget_frequency, 
                 ac.period_start, ac.period_end, ac.is_shared, ac.cat_family_id, ac.cat_family_name, ac.is_family
    )
    SELECT 
        bc.id,
        bc.name,
        bc.type,
        bc.icon,
        bc.budget_amount,
        bc.budget_frequency,
        bc.calculated_spent,
        bc.budget_amount - bc.calculated_spent as remaining,
        CASE 
            WHEN bc.budget_amount > 0 
            THEN ROUND((bc.calculated_spent / bc.budget_amount) * 100, 2)
            ELSE 0 
        END as progress_pct,
        bc.period_start,
        bc.period_end,
        bc.is_shared,
        bc.cat_family_id,
        bc.cat_family_name,
        COALESCE(bc.contributions, '[]'::jsonb)
    FROM budget_calculations bc
    ORDER BY bc.budget_frequency, bc.name;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_budget_progress(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_budget_progress(UUID) IS 'Family Sharing: Enhanced budget progress with family categories and member contribution tracking - corrected version';