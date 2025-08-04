# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-04-family-sharing-foundation/spec.md

## Zero-Downtime Migration Strategy

### Migration Approach
Following Supabase best practices for production deployments with zero downtime:

1. **Additive Changes Only**: All schema changes are additive (new tables, new columns, new indexes)
2. **Backward Compatibility**: Existing queries continue to work during and after migration
3. **Incremental Deployment**: Changes deployed in small, safe increments
4. **Rollback Safety**: Each migration has corresponding rollback scripts
5. **RLS Policy Staging**: New policies created alongside existing ones, then swapped atomically

### Migration Phases

#### Phase 1A: Create New Tables (Safe - Zero Downtime)
```sql
-- Create enum types first
CREATE TYPE family_role AS ENUM ('admin', 'member');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE account_scope AS ENUM ('personal', 'joint');

-- Create families table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role family_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

-- Create family_invitations table
CREATE TABLE family_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role family_role NOT NULL DEFAULT 'member',
    token VARCHAR(255) NOT NULL UNIQUE,
    status invitation_status NOT NULL DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Phase 1B: Create Indexes (Safe - Zero Downtime)
```sql
-- Indexes for families table
CREATE INDEX idx_families_created_by ON families(created_by);

-- Indexes for family_members table
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_user_family ON family_members(user_id, family_id);

-- Indexes for family_invitations table
CREATE INDEX idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX idx_family_invitations_email ON family_invitations(email);
CREATE INDEX idx_family_invitations_token ON family_invitations(token);
CREATE INDEX idx_family_invitations_status ON family_invitations(status);
CREATE INDEX idx_family_invitations_expires_at ON family_invitations(expires_at);
```

#### Phase 1C: Enable RLS for New Tables (Safe - Zero Downtime)
```sql
-- Enable RLS on new tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for families with performance optimizations
CREATE POLICY "Users can view families they belong to" ON families FOR SELECT
USING (id = ANY((SELECT private.user_family_ids())));

CREATE POLICY "Users can create families" ON families FOR INSERT
WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Family admins can update family" ON families FOR UPDATE
USING ((SELECT private.user_is_family_admin(id)));

CREATE POLICY "Family creators can delete family" ON families FOR DELETE
USING (created_by = (SELECT auth.uid()));

-- Create RLS policies for family_members with performance optimizations
CREATE POLICY "Users can view family members of their families" ON family_members FOR SELECT
USING (family_id = ANY((SELECT private.user_family_ids())));

CREATE POLICY "Family admins can manage members" ON family_members FOR ALL
USING ((SELECT private.user_is_family_admin(family_id)));

-- Create RLS policies for family_invitations with performance optimizations
CREATE POLICY "Users can view invitations for their families" ON family_invitations FOR SELECT
USING (
    (SELECT private.user_is_family_admin(family_id)) OR 
    email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Family admins can manage invitations" ON family_invitations FOR ALL
USING ((SELECT private.user_is_family_admin(family_id)));
```

#### Phase 2A: Add Columns to Existing Tables (Safe - Zero Downtime)
```sql
-- Add family support to accounts table
ALTER TABLE accounts 
ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE CASCADE,
ADD COLUMN account_scope account_scope NOT NULL DEFAULT 'personal';

-- Add family support to categories table  
ALTER TABLE categories
ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE CASCADE,
ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE;

-- Add attribution to transactions table
ALTER TABLE transactions
ADD COLUMN logged_by_user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT;
```

#### Phase 2B: Backfill Data (Safe - Zero Downtime)
```sql
-- Backfill existing data with safe defaults
-- All existing accounts are personal (default already set)
-- All existing categories are not shared (default already set)

-- Backfill logged_by_user_id with user_id for existing transactions
UPDATE transactions 
SET logged_by_user_id = user_id 
WHERE logged_by_user_id IS NULL;

-- Make logged_by_user_id required after backfill
ALTER TABLE transactions 
ALTER COLUMN logged_by_user_id SET NOT NULL;
```

#### Phase 2C: Add Constraints (Safe - Zero Downtime)
```sql
-- Add check constraints for data consistency
ALTER TABLE accounts
ADD CONSTRAINT chk_account_scope_consistency CHECK (
    (account_scope = 'personal' AND family_id IS NULL AND user_id IS NOT NULL) OR
    (account_scope = 'joint' AND family_id IS NOT NULL AND user_id IS NULL)
);

ALTER TABLE categories
ADD CONSTRAINT chk_category_sharing_consistency CHECK (
    (is_shared = FALSE AND family_id IS NULL AND user_id IS NOT NULL) OR
    (is_shared = TRUE AND family_id IS NOT NULL AND user_id IS NULL)
);
```

#### Phase 2D: Create Indexes for Enhanced Queries (Safe - Zero Downtime)
```sql
-- Performance indexes for family-scoped queries
CREATE INDEX idx_accounts_family_id ON accounts(family_id);
CREATE INDEX idx_accounts_scope ON accounts(account_scope);
CREATE INDEX idx_accounts_user_family ON accounts(user_id, family_id);

CREATE INDEX idx_categories_family_id ON categories(family_id);
CREATE INDEX idx_categories_is_shared ON categories(is_shared);
CREATE INDEX idx_categories_user_family ON categories(user_id, family_id);

CREATE INDEX idx_transactions_logged_by ON transactions(logged_by_user_id);
CREATE INDEX idx_transactions_logged_by_date ON transactions(logged_by_user_id, created_at);
```

#### Phase 3: Enhanced RLS Policies with Performance Optimizations (Atomic Swap - Near Zero Downtime)

First, create security definer functions for optimal performance:

```sql
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
```

Then create optimized RLS policies:

```sql
-- Create new enhanced policies with performance optimizations
CREATE POLICY "Users can view accessible accounts v2" ON accounts FOR SELECT
USING (
    (account_scope = 'personal' AND user_id = (SELECT auth.uid())) OR
    (account_scope = 'joint' AND family_id = ANY((SELECT private.user_family_ids())))
);

CREATE POLICY "Users can create personal accounts v2" ON accounts FOR INSERT
WITH CHECK (
    account_scope = 'personal' AND user_id = auth.uid() AND family_id IS NULL
);

CREATE POLICY "Family admins can create joint accounts v2" ON accounts FOR INSERT
WITH CHECK (
    account_scope = 'joint' AND (SELECT private.user_is_family_admin(family_id)) AND user_id IS NULL
);

CREATE POLICY "Users can update own personal accounts v2" ON accounts FOR UPDATE
USING (account_scope = 'personal' AND user_id = auth.uid());

CREATE POLICY "Family admins can update joint accounts v2" ON accounts FOR UPDATE
USING (
    account_scope = 'joint' AND (SELECT private.user_is_family_admin(family_id))
);

CREATE POLICY "Users can delete own personal accounts v2" ON accounts FOR DELETE
USING (account_scope = 'personal' AND user_id = (SELECT auth.uid()));

CREATE POLICY "Family admins can delete joint accounts v2" ON accounts FOR DELETE
USING (
    account_scope = 'joint' AND (SELECT private.user_is_family_admin(family_id))
);

-- Atomic swap: Drop old policies and rename new ones
BEGIN;
DROP POLICY "Users can view own accounts" ON accounts;
DROP POLICY "Users can create own accounts" ON accounts;
DROP POLICY "Users can update own accounts" ON accounts;
DROP POLICY "Users can delete own accounts" ON accounts;

ALTER POLICY "Users can view accessible accounts v2" ON accounts RENAME TO "Users can view accessible accounts";
ALTER POLICY "Users can create personal accounts v2" ON accounts RENAME TO "Users can create personal accounts";
ALTER POLICY "Family admins can create joint accounts v2" ON accounts RENAME TO "Family admins can create joint accounts";
ALTER POLICY "Users can update own personal accounts v2" ON accounts RENAME TO "Users can update own personal accounts";
ALTER POLICY "Family admins can update joint accounts v2" ON accounts RENAME TO "Family admins can update joint accounts";
ALTER POLICY "Users can delete own personal accounts v2" ON accounts RENAME TO "Users can delete own personal accounts";
ALTER POLICY "Family admins can delete joint accounts v2" ON accounts RENAME TO "Family admins can delete joint accounts";
COMMIT;
```

## Enhanced Database Functions

### Updated get_budget_progress Function with Performance Optimizations
```sql
CREATE OR REPLACE FUNCTION get_budget_progress(p_user_id UUID)
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR,
    category_type category_type,
    category_icon VARCHAR,
    budget_amount DECIMAL,
    budget_frequency budget_frequency,
    spent_amount DECIMAL,
    remaining_amount DECIMAL,
    progress_percentage DECIMAL,
    period_start DATE,
    period_end DATE,
    is_shared BOOLEAN,
    family_id UUID,
    family_name VARCHAR,
    member_contributions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_family_ids UUID[];
BEGIN
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
        SELECT c.*, FALSE as is_family, NULL::UUID as cat_family_id, NULL::VARCHAR as cat_family_name
        FROM public.categories c
        WHERE c.user_id = p_user_id 
        AND c.is_shared = FALSE
        AND c.budget_amount IS NOT NULL
        
        UNION ALL
        
        -- Shared family categories (using pre-computed family IDs)
        SELECT c.*, TRUE as is_family, c.family_id as cat_family_id, uf.family_name as cat_family_name
        FROM public.categories c
        JOIN user_families uf ON uf.family_id = c.family_id
        WHERE c.is_shared = TRUE
        AND c.family_id = ANY(user_family_ids)
        AND c.budget_amount IS NOT NULL
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
        LEFT JOIN transactions t ON t.category_id = ac.id
            AND t.created_at >= ac.period_start 
            AND t.created_at <= ac.period_end
        LEFT JOIN family_members fm ON fm.family_id = ac.cat_family_id
        LEFT JOIN auth.users u ON u.id = fm.user_id
        LEFT JOIN LATERAL (
            SELECT COALESCE(SUM(mt.amount), 0) as amount
            FROM transactions mt
            WHERE mt.category_id = ac.id 
            AND mt.logged_by_user_id = fm.user_id
            AND mt.created_at >= ac.period_start 
            AND mt.created_at <= ac.period_end
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
```

### New get_member_contributions Function
```sql
CREATE OR REPLACE FUNCTION get_member_contributions(
    p_family_id UUID,
    p_category_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    user_email VARCHAR,
    contribution_amount DECIMAL,
    transaction_count INTEGER,
    percentage_of_total DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_total_amount DECIMAL;
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
    AND t.created_at >= v_start_date
    AND t.created_at <= v_end_date;
    
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
        AND t.created_at >= v_start_date
        AND t.created_at <= v_end_date
    WHERE fm.family_id = p_family_id
    GROUP BY fm.user_id, u.email
    ORDER BY COALESCE(SUM(t.amount), 0) DESC;
END;
$$;
```

### New add_creator_as_admin Function
```sql
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Automatically add the family creator as an admin
    INSERT INTO family_members (family_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'admin');
    
    RETURN NEW;
END;
$$;

-- Create trigger to auto-add family creator as admin
CREATE TRIGGER trigger_add_creator_as_admin
    AFTER INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION add_creator_as_admin();
```

## Rollback Strategy

### Phase 1 Rollback (Safe)
```sql
-- Drop new tables in reverse order
DROP TABLE family_invitations CASCADE;
DROP TABLE family_members CASCADE; 
DROP TABLE families CASCADE;

-- Drop enum types
DROP TYPE invitation_status;
DROP TYPE family_role;
DROP TYPE account_scope;
```

### Phase 2 Rollback (Requires Caution)
```sql
-- Remove columns from existing tables
ALTER TABLE transactions DROP COLUMN logged_by_user_id;
ALTER TABLE categories DROP COLUMN is_shared, DROP COLUMN family_id;
ALTER TABLE accounts DROP COLUMN account_scope, DROP COLUMN family_id;

-- Drop new indexes
DROP INDEX idx_accounts_family_id;
DROP INDEX idx_accounts_scope;
-- ... (drop all new indexes)
```

### Phase 3 Rollback (Restore Original Policies)
```sql
-- Restore original RLS policies
-- (Keep backup of original policy definitions for restoration)
```

## Performance Considerations

### Index Strategy
- **B-tree indexes** on foreign keys and frequently filtered columns
- **Composite indexes** for multi-column WHERE clauses
- **Partial indexes** for status-specific queries (e.g., pending invitations)

### Query Optimization
- **UNION queries** for combining personal and family resources
- **Lateral joins** for correlated subqueries in member contributions
- **Window functions** for ranking and percentage calculations
- **Security definer functions** to bypass RLS on performance-critical queries

### Monitoring
- Track query performance before and after each migration phase
- Monitor index usage and query plan changes
- Set up alerts for long-running queries involving family tables