-- Family Sharing Foundation: Task 1.2 - Security Definer Functions
-- Create optimized security definer functions for RLS performance and family access checks

-- Create private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Drop existing get_budget_progress function to allow recreation with new return type
DROP FUNCTION IF EXISTS get_budget_progress(UUID);

-- Create security definer function for user's family IDs (performance optimization)
CREATE OR REPLACE FUNCTION private.user_family_ids()
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN ARRAY(
        SELECT fm.family_id 
        FROM public.family_members fm 
        WHERE fm.user_id = auth.uid()
    );
END;
$$;

-- Create security definer function to check if user is family admin
CREATE OR REPLACE FUNCTION private.user_is_family_admin(p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.user_id = auth.uid() 
        AND fm.family_id = p_family_id 
        AND fm.role = 'admin'
    );
END;
$$;

-- Create enhanced get_budget_progress function with family support and member contributions
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

    -- Return personal categories with budget progress
    FOR rec IN
        SELECT 
            c.id as cat_id,
            c.name as cat_name,
            c.type as cat_type,
            c.icon as cat_icon,
            c.budget_amount as cat_budget_amount,
            c.budget_frequency as cat_budget_frequency,
            c.is_shared as cat_is_shared,
            c.family_id as cat_family_id,
            f.name as cat_family_name,
            COALESCE(SUM(t.amount), 0) as total_spent
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
        AND c.type = 'expense'
        GROUP BY c.id, c.name, c.type, c.icon, c.budget_amount, c.budget_frequency, c.is_shared, c.family_id, f.name
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
                        WHEN rec.total_spent > 0 
                        THEN ROUND((contrib.contribution_amount / rec.total_spent) * 100, 2)
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
        category_type := rec.cat_type;
        category_icon := rec.cat_icon;
        budget_amount := rec.cat_budget_amount;
        budget_frequency := rec.cat_budget_frequency;
        spent_amount := rec.total_spent;
        remaining_amount := rec.cat_budget_amount - rec.total_spent;
        progress_percentage := CASE 
            WHEN rec.cat_budget_amount > 0 
            THEN ROUND((rec.total_spent / rec.cat_budget_amount) * 100, 2)
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

-- Create get_member_contributions function for detailed family analytics
CREATE OR REPLACE FUNCTION get_member_contributions(
    p_family_id UUID,
    p_category_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    user_email VARCHAR(255),
    contribution_amount DECIMAL(15, 2),
    transaction_count INTEGER,
    percentage_of_total DECIMAL(5, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_total_amount DECIMAL(15, 2);
BEGIN
    -- Verify user has access to this family (security check)
    IF NOT EXISTS (
        SELECT 1 FROM public.family_members fm 
        WHERE fm.family_id = p_family_id 
        AND fm.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied to family data';
    END IF;
    
    -- Set default date range if not provided
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    -- Calculate total amount for percentage calculation
    SELECT COALESCE(SUM(t.amount), 0)
    INTO v_total_amount
    FROM public.transactions t
    WHERE t.category_id = p_category_id
    AND t.transaction_date >= v_start_date
    AND t.transaction_date <= v_end_date;
    
    RETURN QUERY
    SELECT 
        fm.user_id,
        u.email,
        COALESCE(SUM(t.amount), 0) as contribution_amount,
        COUNT(t.id)::INTEGER as transaction_count,
        CASE 
            WHEN v_total_amount > 0 
            THEN ROUND((COALESCE(SUM(t.amount), 0) / v_total_amount) * 100, 2)
            ELSE 0 
        END as percentage_of_total
    FROM public.family_members fm
    JOIN auth.users u ON u.id = fm.user_id
    LEFT JOIN public.transactions t ON t.logged_by_user_id = fm.user_id 
        AND t.category_id = p_category_id
        AND t.transaction_date >= v_start_date
        AND t.transaction_date <= v_end_date
    WHERE fm.family_id = p_family_id
    GROUP BY fm.user_id, u.email
    ORDER BY COALESCE(SUM(t.amount), 0) DESC;
END;
$$;

-- Create trigger function to automatically add family creator as admin
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Automatically add the family creator as an admin
    INSERT INTO public.family_members (family_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'admin');
    
    RETURN NEW;
END;
$$;

-- Create trigger to auto-add family creator as admin
DROP TRIGGER IF EXISTS trigger_add_creator_as_admin ON families;
CREATE TRIGGER trigger_add_creator_as_admin
    AFTER INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION add_creator_as_admin();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION private.user_family_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION private.user_is_family_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_budget_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_member_contributions(UUID, UUID, DATE, DATE) TO authenticated;

-- Add comments to document the functions
COMMENT ON FUNCTION private.user_family_ids() IS 'Family Sharing Task 1.2: Performance-optimized function to get user family IDs for RLS policies';
COMMENT ON FUNCTION private.user_is_family_admin(UUID) IS 'Family Sharing Task 1.2: Fast admin role verification for family management permissions';
COMMENT ON FUNCTION get_budget_progress(UUID) IS 'Family Sharing Task 1.2: Enhanced budget progress with family categories and member contribution tracking';
COMMENT ON FUNCTION get_member_contributions(UUID, UUID, DATE, DATE) IS 'Family Sharing Task 1.2: Detailed family member contribution analytics';
COMMENT ON FUNCTION add_creator_as_admin() IS 'Family Sharing Task 1.2: Trigger function to automatically add family creator as admin';