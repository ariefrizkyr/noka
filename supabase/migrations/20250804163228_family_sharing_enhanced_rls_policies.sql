-- Family Sharing Foundation: Enhanced RLS Policies with Performance Optimizations
-- Replace basic RLS policies with optimized versions using security definer functions

-- =============================================================================
-- ENHANCED RLS POLICIES FOR FAMILIES TABLE
-- =============================================================================

-- Drop existing basic policies
DROP POLICY IF EXISTS "Users can view families they created" ON families;
DROP POLICY IF EXISTS "Family creators can update family" ON families;
DROP POLICY IF EXISTS "Family creators can delete family" ON families;

-- Create enhanced policies using security definer functions
CREATE POLICY "Users can view families they belong to" ON families FOR SELECT
USING (id = ANY(private.user_family_ids()));

CREATE POLICY "Family admins can update family" ON families FOR UPDATE
USING ((SELECT private.user_is_family_admin(id)));

CREATE POLICY "Family creators can delete family" ON families FOR DELETE
USING (created_by = auth.uid());

-- =============================================================================
-- ENHANCED RLS POLICIES FOR FAMILY_MEMBERS TABLE
-- =============================================================================

-- Drop existing basic policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;

-- Create enhanced policies
CREATE POLICY "Users can view family members of their families" ON family_members FOR SELECT
USING (family_id = ANY(private.user_family_ids()));

CREATE POLICY "Family admins can manage members" ON family_members FOR ALL
USING ((SELECT private.user_is_family_admin(family_id)));

-- =============================================================================
-- ENHANCED RLS POLICIES FOR FAMILY_INVITATIONS TABLE
-- =============================================================================

-- Drop existing basic policies
DROP POLICY IF EXISTS "Users can view invitations for their families" ON family_invitations;
DROP POLICY IF EXISTS "Family creators can manage invitations" ON family_invitations;

-- Create enhanced policies
CREATE POLICY "Users can view invitations for their families" ON family_invitations FOR SELECT
USING (
    (SELECT private.user_is_family_admin(family_id)) OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Family admins can manage invitations" ON family_invitations FOR ALL
USING ((SELECT private.user_is_family_admin(family_id)));

-- =============================================================================
-- ENHANCED RLS POLICIES FOR ACCOUNTS TABLE
-- =============================================================================

-- Drop existing basic policies
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can create own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

-- Create enhanced policies for personal and joint accounts
CREATE POLICY "Users can view accessible accounts" ON accounts FOR SELECT
USING (
    (account_scope = 'personal' AND user_id = auth.uid()) OR
    (account_scope = 'joint' AND family_id = ANY(private.user_family_ids()))
);

CREATE POLICY "Users can create personal accounts" ON accounts FOR INSERT
WITH CHECK (
    account_scope = 'personal' AND user_id = auth.uid() AND family_id IS NULL
);

CREATE POLICY "Family admins can create joint accounts" ON accounts FOR INSERT
WITH CHECK (
    account_scope = 'joint' AND (SELECT private.user_is_family_admin(family_id)) AND user_id IS NULL
);

CREATE POLICY "Users can update own personal accounts" ON accounts FOR UPDATE
USING (account_scope = 'personal' AND user_id = auth.uid());

CREATE POLICY "Family admins can update joint accounts" ON accounts FOR UPDATE
USING (
    account_scope = 'joint' AND (SELECT private.user_is_family_admin(family_id))
);

CREATE POLICY "Users can delete own personal accounts" ON accounts FOR DELETE
USING (account_scope = 'personal' AND user_id = auth.uid());

CREATE POLICY "Family admins can delete joint accounts" ON accounts FOR DELETE
USING (
    account_scope = 'joint' AND (SELECT private.user_is_family_admin(family_id))
);

-- =============================================================================
-- ENHANCED RLS POLICIES FOR CATEGORIES TABLE
-- =============================================================================

-- Drop existing basic policies
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can create own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Create enhanced policies for personal and shared categories
CREATE POLICY "Users can view accessible categories" ON categories FOR SELECT
USING (
    (is_shared = FALSE AND user_id = auth.uid()) OR
    (is_shared = TRUE AND family_id = ANY(private.user_family_ids()))
);

CREATE POLICY "Users can create personal categories" ON categories FOR INSERT
WITH CHECK (
    is_shared = FALSE AND user_id = auth.uid() AND family_id IS NULL
);

CREATE POLICY "Family admins can create shared categories" ON categories FOR INSERT
WITH CHECK (
    is_shared = TRUE AND (SELECT private.user_is_family_admin(family_id)) AND user_id IS NULL
);

CREATE POLICY "Users can update own personal categories" ON categories FOR UPDATE
USING (is_shared = FALSE AND user_id = auth.uid());

CREATE POLICY "Family admins can update shared categories" ON categories FOR UPDATE
USING (
    is_shared = TRUE AND (SELECT private.user_is_family_admin(family_id))
);

CREATE POLICY "Users can delete own personal categories" ON categories FOR DELETE
USING (is_shared = FALSE AND user_id = auth.uid());

CREATE POLICY "Family admins can delete shared categories" ON categories FOR DELETE
USING (
    is_shared = TRUE AND (SELECT private.user_is_family_admin(family_id))
);

-- =============================================================================
-- ENHANCED RLS POLICIES FOR TRANSACTIONS TABLE
-- =============================================================================

-- Create enhanced policies for family-aware transaction access
CREATE POLICY "Users can view accessible transactions" ON transactions FOR SELECT
USING (
    -- Personal account transactions
    EXISTS (
        SELECT 1 FROM accounts a 
        WHERE a.id = account_id 
        AND a.user_id = auth.uid() 
        AND a.account_scope = 'personal'
    ) OR
    -- Joint account transactions (from any family member)
    EXISTS (
        SELECT 1 FROM accounts a 
        WHERE a.id = account_id 
        AND a.account_scope = 'joint'
        AND a.family_id = ANY(private.user_family_ids())
    ) OR
    -- Transfer transactions involving accessible accounts
    EXISTS (
        SELECT 1 FROM accounts a 
        WHERE (a.id = from_account_id OR a.id = to_account_id)
        AND (
            (a.user_id = auth.uid() AND a.account_scope = 'personal') OR
            (a.account_scope = 'joint' AND a.family_id = ANY(private.user_family_ids()))
        )
    )
);

CREATE POLICY "Users can create transactions for accessible accounts" ON transactions FOR INSERT
WITH CHECK (
    -- Can create for personal accounts
    EXISTS (
        SELECT 1 FROM accounts a 
        WHERE a.id = account_id 
        AND a.user_id = auth.uid() 
        AND a.account_scope = 'personal'
    ) OR
    -- Can create for joint accounts in their families
    EXISTS (
        SELECT 1 FROM accounts a 
        WHERE a.id = account_id 
        AND a.account_scope = 'joint'
        AND a.family_id = ANY(private.user_family_ids())
    ) OR
    -- Can create transfers between accessible accounts
    (
        type = 'transfer' AND
        EXISTS (
            SELECT 1 FROM accounts a1, accounts a2
            WHERE a1.id = from_account_id AND a2.id = to_account_id
            AND (
                (a1.user_id = auth.uid() AND a1.account_scope = 'personal') OR
                (a1.account_scope = 'joint' AND a1.family_id = ANY(private.user_family_ids()))
            )
            AND (
                (a2.user_id = auth.uid() AND a2.account_scope = 'personal') OR
                (a2.account_scope = 'joint' AND a2.family_id = ANY(private.user_family_ids()))
            )
        )
    )
);

CREATE POLICY "Users can update transactions they created" ON transactions FOR UPDATE
USING (logged_by_user_id = auth.uid());

CREATE POLICY "Users can delete transactions they created" ON transactions FOR DELETE
USING (logged_by_user_id = auth.uid());

-- Add comments to document the enhanced policies
COMMENT ON POLICY "Users can view families they belong to" ON families IS 'Family Sharing Enhanced RLS: Uses private.user_family_ids() for optimal performance';
COMMENT ON POLICY "Users can view accessible accounts" ON accounts IS 'Family Sharing Enhanced RLS: Supports both personal and joint account access with family context';
COMMENT ON POLICY "Users can view accessible categories" ON categories IS 'Family Sharing Enhanced RLS: Supports both personal and shared category access with family context';
COMMENT ON POLICY "Users can view accessible transactions" ON transactions IS 'Family Sharing Enhanced RLS: Complex policy supporting personal accounts, joint accounts, and transfers with family awareness';