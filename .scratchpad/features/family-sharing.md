# Family Sharing Requirements Document

**Version:** 1.0  
**Date:** August 2, 2025  
**Project:** Noka Personal Finance App - Family Sharing Feature

## Executive Summary

This document outlines the requirements for implementing family sharing functionality in the Noka personal finance application. The feature will allow users to create families, invite members, manage joint accounts and shared categories, while maintaining strict data isolation between personal and family finances.

### Key Objectives

- Enable collaborative family financial management
- Maintain existing personal finance functionality unchanged
- Provide role-based access control (Admin/Member)
- Show individual member contributions within shared resources
- Ensure data security and proper isolation

### Design Principles

- **Simple Ownership**: Resources belong to either a user OR a family (never both)
- **Unified Dashboard**: No context switching - integrate family data seamlessly
- **Clear Attribution**: Track who logged family transactions
- **Role-Based Permissions**: Admins manage, members contribute

---

## Functional Requirements

### FR-1: Family Management System

#### FR-1.1: Family Creation

- **Requirement**: Users can create a family entity
- **Details**:
  - Family creator automatically becomes Admin
  - Family requires a name (required field)
  - Each family gets a unique identifier
- **Acceptance Criteria**:
  - ✅ User can create family with valid name
  - ✅ Creator is assigned Admin role automatically
  - ✅ Family appears in user's family list

#### FR-1.2: Family Member Roles

- **Admin Role Capabilities**:
  - Create, edit, delete joint accounts
  - Create, edit, delete shared categories
  - Invite new members
  - Remove existing members
  - Edit/delete any family transaction
  - View all family financial data
- **Member Role Capabilities**:
  - View all family financial data
  - Add transactions to joint accounts/shared categories
  - Edit/delete only transactions they logged
  - Cannot invite/remove members
  - Cannot create/modify joint accounts or shared categories

#### FR-1.3: Family Invitation System

- **Email-Based Invitations**:
  - Admins can invite users via email address
  - System generates unique invitation tokens with expiry (7 days)
  - Invitation status tracking: pending, accepted, declined, expired
- **Invitation Handling**:
  - **Existing Users**: Direct in-app invitation acceptance
  - **New Users**: Redirect to signup, auto-join family after registration
- **Invitation Management**:
  - Admins can view pending invitations
  - Admins can resend or cancel pending invitations

#### FR-1.4: Multiple Family Membership

- **Requirement**: Users can belong to multiple families
- **Implementation**: User sees aggregated data from all families they belong to
- **Limitation**: No hierarchy - each family is independent

### FR-2: Account Management

#### FR-2.1: Account Types

- **Personal Accounts**:
  - Owned by individual users (existing functionality)
  - Only visible to the owner
  - Not accessible to family members
- **Joint Accounts**:
  - Owned by a family
  - Visible to all family members
  - Only admins can create/edit/delete
  - All members can add transactions

#### FR-2.2: Account Scope Selection

- **During Account Creation**: User selects "Personal" or "Joint"
- **Joint Account Requirements**:
  - Must select which family it belongs to
  - Only families where user is Admin can be selected
- **Data Validation**:
  - Personal accounts: family_id = NULL
  - Joint accounts: family_id must be valid family where user is admin

### FR-3: Category Management

#### FR-3.1: Category Types

- **Personal Categories**:
  - Owned by individual users (existing functionality)
  - Support budgets/targets as before
  - Only visible to the owner
- **Shared Categories**:
  - Owned by a family
  - Visible to all family members
  - Support family-wide budgets/targets
  - Only admins can create/edit/delete

#### FR-3.2: Shared Category Budgets/Targets

- **Budget Categories**: Family-wide expense budgets (e.g., "Groceries: $500/month")
- **Investment Categories**: Family-wide investment targets (e.g., "Vacation Fund: $2000")
- **Member Contributions**: Track which member contributed how much to shared goals

### FR-4: Transaction Management

#### FR-4.1: Transaction Attribution

- **Requirement**: All transactions must track who logged them
- **Implementation**: Add `logged_by_user_id` field to transactions table
- **Display**: Family transactions show "Logged by [User Name]"

#### FR-4.2: Transaction Access Control

- **Personal Transactions**: Only creator can edit/delete
- **Family Transactions**:
  - Creator can edit/delete their own transactions
  - Family admins can edit/delete any family transaction
  - Family members can only edit/delete transactions they logged

#### FR-4.3: Transaction Context

- **Account Selection**: Users see both personal and accessible joint accounts
- **Category Selection**: Users see both personal and accessible shared categories
- **Cross-Scope Transactions**: Personal account can transact against shared category (counted toward family budget)

### FR-5: Dashboard Integration

#### FR-5.1: Unified Data Display

- **Requirement**: Dashboard shows integrated personal + family data without context switching
- **Budget Overview**:
  - Personal categories show individual progress
  - Shared categories show total progress + member breakdown
- **Investment Overview**:
  - Personal investments show individual progress
  - Shared investments show total progress + member contributions

#### FR-5.2: Member Contribution Display

- **Shared Category Enhancement**:
  ```
  "Groceries" Budget: $320/$500 (64%)
  ├── John: $180 (56% of spending)
  └── Sarah: $140 (44% of spending)
  ```
- **Transaction Lists**: Show "Logged by" attribution for family transactions
- **Visual Indicators**: Subtle badges/icons to distinguish joint/shared resources as per the UI/UX requirements below

---

## Database Schema Changes

### New Tables

#### families

```sql
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_families_created_by ON families(created_by);
```

#### family_members

```sql
CREATE TYPE family_role AS ENUM ('admin', 'member');

CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role family_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
```

#### family_invitations

```sql
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

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

CREATE INDEX idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX idx_family_invitations_email ON family_invitations(email);
CREATE INDEX idx_family_invitations_token ON family_invitations(token);
CREATE INDEX idx_family_invitations_status ON family_invitations(status);
```

### Modified Tables

#### accounts (Add family support)

```sql
-- Add enum for account scope
CREATE TYPE account_scope AS ENUM ('personal', 'joint');

-- Add columns to existing accounts table
ALTER TABLE accounts
ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE CASCADE,
ADD COLUMN account_scope account_scope NOT NULL DEFAULT 'personal';

-- Add constraints
ALTER TABLE accounts
ADD CONSTRAINT chk_account_scope_consistency CHECK (
    (account_scope = 'personal' AND family_id IS NULL AND user_id IS NOT NULL) OR
    (account_scope = 'joint' AND family_id IS NOT NULL AND user_id IS NULL)
);

-- Backfill existing accounts (set account_scope = 'personal')
UPDATE accounts SET account_scope = 'personal' WHERE account_scope IS NULL;

-- Add indexes
CREATE INDEX idx_accounts_family_id ON accounts(family_id);
CREATE INDEX idx_accounts_scope ON accounts(account_scope);
```

#### categories (Add family support)

```sql
-- Add columns to existing categories table
ALTER TABLE categories
ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE CASCADE,
ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE;

-- Add constraints
ALTER TABLE categories
ADD CONSTRAINT chk_category_sharing_consistency CHECK (
    (is_shared = FALSE AND family_id IS NULL AND user_id IS NOT NULL) OR
    (is_shared = TRUE AND family_id IS NOT NULL AND user_id IS NULL)
);

-- Backfill existing categories (set is_shared = FALSE)
UPDATE categories SET is_shared = FALSE WHERE is_shared IS NULL;

-- Add indexes
CREATE INDEX idx_categories_family_id ON categories(family_id);
CREATE INDEX idx_categories_is_shared ON categories(is_shared);
```

#### transactions (Add attribution)

```sql
-- Add user attribution to existing transactions table
ALTER TABLE transactions
ADD COLUMN logged_by_user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT;

-- Backfill existing transactions (set logged_by_user_id = user_id)
UPDATE transactions SET logged_by_user_id = user_id WHERE logged_by_user_id IS NULL;

-- Make column required going forward
ALTER TABLE transactions ALTER COLUMN logged_by_user_id SET NOT NULL;

-- Add index
CREATE INDEX idx_transactions_logged_by ON transactions(logged_by_user_id);
```

### Row Level Security (RLS) Policy Updates

#### families table

```sql
-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view families they belong to" ON families FOR SELECT
USING (id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create families" ON families FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family admins can update family" ON families FOR UPDATE
USING (id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Family creators can delete family" ON families FOR DELETE
USING (created_by = auth.uid());
```

#### family_members table

```sql
-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view family members of their families" ON family_members FOR SELECT
USING (family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid()));

CREATE POLICY "Family admins can manage members" ON family_members FOR ALL
USING (family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin'
));
```

#### Enhanced accounts policies

```sql
-- Remove old policies and create new ones supporting family access
DROP POLICY "Users can view own accounts" ON accounts;
DROP POLICY "Users can create own accounts" ON accounts;
DROP POLICY "Users can update own accounts" ON accounts;
DROP POLICY "Users can delete own accounts" ON accounts;

-- New policies supporting both personal and family access
CREATE POLICY "Users can view accessible accounts" ON accounts FOR SELECT
USING (
    (account_scope = 'personal' AND user_id = auth.uid()) OR
    (account_scope = 'joint' AND family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
    ))
);

CREATE POLICY "Users can create personal accounts" ON accounts FOR INSERT
WITH CHECK (
    account_scope = 'personal' AND user_id = auth.uid() AND family_id IS NULL
);

CREATE POLICY "Family admins can create joint accounts" ON accounts FOR INSERT
WITH CHECK (
    account_scope = 'joint' AND family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'admin'
    ) AND user_id IS NULL
);

CREATE POLICY "Users can update own personal accounts" ON accounts FOR UPDATE
USING (account_scope = 'personal' AND user_id = auth.uid());

CREATE POLICY "Family admins can update joint accounts" ON accounts FOR UPDATE
USING (
    account_scope = 'joint' AND family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Similar DELETE policies...
```

#### Enhanced categories policies

```sql
-- Similar pattern as accounts - support both personal and shared categories
-- (Detailed policies following same pattern as accounts)
```

#### Enhanced transactions policies

```sql
-- Enhanced policies supporting family access based on account/category access
-- (Detailed policies ensuring proper access control)
```

---

## Database Functions

### Enhanced Existing Functions

#### get_budget_progress (Enhanced for family support)

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
    member_contributions JSONB -- New: individual member breakdown
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Return both personal and shared categories with member contribution data
    -- Implementation details...
END;
$$;
```

#### get_investment_progress (Enhanced for family support)

```sql
-- Similar enhancement to support shared investment categories
-- with member contribution tracking
```

### New Functions

#### get_member_contributions

```sql
CREATE OR REPLACE FUNCTION get_member_contributions(
    p_family_id UUID,
    p_category_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    user_name VARCHAR,
    user_email VARCHAR,
    contribution_amount DECIMAL,
    transaction_count INTEGER,
    percentage_of_total DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Calculate individual member contributions to shared categories
    -- Implementation details...
END;
$$;
```

#### get_family_financial_summary

```sql
CREATE OR REPLACE FUNCTION get_family_financial_summary(
    p_family_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    total_joint_balance DECIMAL,
    shared_budget_progress JSONB,
    shared_investment_progress JSONB,
    member_contributions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Provide family-wide financial overview
    -- Implementation details...
END;
$$;
```

---

## API Layer Specifications

### New Endpoints

#### Family Management API

##### POST /api/families

**Purpose**: Create a new family  
**Authentication**: Required  
**Request Body**:

```typescript
{
  name: string; // Family name (required, 3-50 chars)
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    created_by: string,
    created_at: string,
    member_count: 1,
    user_role: "admin"
  },
  message: "Family created successfully"
}
```

##### GET /api/families

**Purpose**: Get user's families  
**Authentication**: Required  
**Query Parameters**: None  
**Response**:

```typescript
{
  success: true,
  data: Array<{
    id: string,
    name: string,
    member_count: number,
    user_role: "admin" | "member",
    joined_at: string
  }>,
  message: string
}
```

##### PUT /api/families/[id]

**Purpose**: Update family (admins only)  
**Authentication**: Required + Admin role  
**Request Body**:

```typescript
{
  name?: string; // Optional name update
}
```

##### DELETE /api/families/[id]

**Purpose**: Delete family (creator only)  
**Authentication**: Required + Creator only

#### Family Members API

##### GET /api/families/[id]/members

**Purpose**: Get family members  
**Authentication**: Required + Family membership  
**Response**:

```typescript
{
  success: true,
  data: Array<{
    id: string,
    user_id: string,
    email: string,
    role: "admin" | "member",
    joined_at: string
  }>,
  message: string
}
```

##### POST /api/families/[id]/members/invite

**Purpose**: Invite new member (admins only)  
**Authentication**: Required + Admin role  
**Request Body**:

```typescript
{
  email: string; // Valid email address
  role: "admin" | "member"; // Default: "member"
}
```

##### DELETE /api/families/[id]/members/[userId]

**Purpose**: Remove member (admins only)  
**Authentication**: Required + Admin role

#### Invitations API

##### GET /api/invitations

**Purpose**: Get user's pending invitations  
**Authentication**: Required

##### PUT /api/invitations/[token]/accept

**Purpose**: Accept family invitation  
**Authentication**: Required

##### PUT /api/invitations/[token]/decline

**Purpose**: Decline family invitation  
**Authentication**: Required

### Enhanced Existing Endpoints

#### Enhanced Accounts API

##### GET /api/accounts

**Enhancement**: Return both personal and accessible joint accounts  
**Response Enhancement**:

```typescript
{
  success: true,
  data: Array<{
    // Existing account fields...
    account_scope: "personal" | "joint",
    family_id?: string,
    family_name?: string,
    user_role?: "admin" | "member" // For joint accounts
  }>,
  message: string
}
```

##### POST /api/accounts

**Enhancement**: Support joint account creation  
**Request Body Enhancement**:

```typescript
{
  name: string,
  type: "bank_account" | "credit_card" | "investment_account",
  initial_balance: number,
  account_scope: "personal" | "joint", // New field
  family_id?: string // Required if account_scope = "joint"
}
```

#### Enhanced Categories API

##### GET /api/categories

**Enhancement**: Return both personal and accessible shared categories  
**Response Enhancement**:

```typescript
{
  success: true,
  data: {
    categories: Array<{
      // Existing category fields...
      is_shared: boolean,
      family_id?: string,
      family_name?: string,
      user_role?: "admin" | "member" // For shared categories
    }>,
    grouped: {
      expense: Category[],
      income: Category[],
      investment: Category[]
    }
  }
}
```

##### POST /api/categories

**Enhancement**: Support shared category creation  
**Request Body Enhancement**:

```typescript
{
  name: string,
  type: "expense" | "income" | "investment",
  icon?: string,
  budget_amount?: number,
  budget_frequency?: "weekly" | "monthly" | "one_time",
  is_shared: boolean, // New field
  family_id?: string // Required if is_shared = true
}
```

#### Enhanced Transactions API

##### GET /api/transactions

**Enhancement**: Include attribution and family context  
**Response Enhancement**:

```typescript
{
  success: true,
  data: {
    transactions: Array<{
      // Existing transaction fields...
      logged_by_user_id: string,
      logged_by_email?: string, // For family transactions
      account?: {
        // Existing account fields...
        account_scope: "personal" | "joint",
        family_name?: string
      },
      category?: {
        // Existing category fields...
        is_shared: boolean,
        family_name?: string
      }
    }>
  }
}
```

##### POST /api/transactions

**Enhancement**: Auto-set logged_by_user_id  
**Server-side Enhancement**: Automatically set `logged_by_user_id = authenticated_user.id`

#### Enhanced Dashboard APIs

##### GET /api/dashboard/budget-progress

**Enhancement**: Include member contribution data for shared categories  
**Response Enhancement**:

```typescript
{
  success: true,
  data: Array<{
    // Existing budget progress fields...
    is_shared: boolean,
    family_id?: string,
    family_name?: string,
    member_contributions?: Array<{
      user_id: string,
      user_email: string,
      contribution_amount: number,
      percentage: number
    }>
  }>
}
```

---

## UI/UX Requirements

### New Components

#### Family Management Components

##### family-management.tsx

**Location**: `app/settings/components/family-management.tsx`  
**Purpose**: Complete family management interface in settings  
**Features**:

- Create new family form
- List user's families with roles
- Member management per family
- Invitation management (send, resend, cancel)
- Family deletion (creators only)

##### family-member-list.tsx

**Location**: `components/family/family-member-list.tsx`  
**Purpose**: Display and manage family members  
**Features**:

- List all family members with roles
- Remove member button (admins only)
- Role change interface (future enhancement)

##### invitation-card.tsx

**Location**: `components/family/invitation-card.tsx`  
**Purpose**: Display pending invitations  
**Features**:

- Accept/decline invitation buttons
- Invitation details (family name, role, expiry)
- Auto-refresh on status change

#### Enhanced Form Components

##### account-form.tsx and account-setup.tsx (Enhanced)

**Location**: `components/settings/account-form.tsx` AND `app/onboarding/steps/account-setup.tsx`
**Enhancement**: Add account scope selection  
**New Fields**:

- Account Scope radio buttons: "Personal" / "Joint"
- Family selector (when Joint is selected, admins only)
- Conditional validation and UI

##### category-form.tsx and category-setup.tsx (Enhanced)

**Location**: `components/settings/category-form.tsx` AND `app/onboarding/steps/category-setup.tsx`
**Enhancement**: Add category sharing selection  
**New Fields**:

- Category Scope radio buttons: "Personal" / "Shared"
- Family selector (when Shared is selected, admins only)
- Budget/target context clarity

##### transaction-form.tsx (Enhanced)

**Location**: `components/transactions/transaction-form.tsx`
**Enhancement**: Show family context  
**New Features**:

- Account dropdown shows both personal and joint accounts
- Category dropdown shows both personal and shared categories
- Auto-attribution handling

### Enhanced Existing Components

#### Dashboard Components

##### budget-overview.tsx (Enhanced)

**Location**: `components/dashboard/budget-overview.tsx`
**Enhancement**: Member contribution display for shared categories  
**New Features**:

```tsx
// For shared categories, show member breakdown
<div className="shared-category-breakdown">
  <div className="category-header">
    <Badge>Shared</Badge>
    <span>{category.family_name}</span>
  </div>
  <div className="progress-bar">{/* Existing progress bar */}</div>
  <div className="member-contributions">
    {contributions.map((member) => (
      <div key={member.user_id} className="member-contribution">
        <span>
          {member.email}: {formatCurrency(member.amount)}
        </span>
        <span>({member.percentage}%)</span>
      </div>
    ))}
  </div>
</div>
```

##### investment-overview.tsx (Enhanced)

**Location**: `components/dashboard/investment-overview.tsx`
**Enhancement**: Similar member contribution display for shared investments

##### transaction-card.tsx (Enhanced)

**Location**: `components/transactions/transaction-card.tsx`
**Enhancement**: Show attribution for family transactions  
**New Features**:

- "Logged by" indicator for family transactions
- Joint/shared resource badges

#### Settings Components

##### SettingsPage.tsx (Enhanced)

**Location**: `app/settings/page.tsx`
**Enhancement**: Add Family Management tab  
**New Tab**: "Family" tab alongside existing General, Categories, Accounts  
**Tab Content**: `<FamilyManagement />` component

### Visual Design Enhancements

#### Resource Indicators

- **Joint Account Badge**: Blue "Joint" badge on account cards
- **Shared Category Badge**: Green "Shared" badge on category cards
- **Family Name Display**: Subtle family name below resource name
- **Attribution Display**: "Logged by [email]" for family transactions

#### Form Enhancements

- **Scope Selection**: Clear radio button groups for Personal/Joint or Personal/Shared
- **Family Context**: Dropdown showing user's admin families when creating joint/shared resources
- **Validation Messages**: Clear error messages for family-related validation

---

## Technical Architecture

### Permission Model

#### Database Level (RLS Policies)

```
Personal Resources:
└── user_id = auth.uid()

Joint/Shared Resources:
└── family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())

Admin Actions:
└── family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'admin')
```

#### API Level (Middleware)

```typescript
// Family access verification
async function verifyFamilyAccess(
  userId: string,
  familyId: string,
): Promise<{
  isMember: boolean;
  isAdmin: boolean;
  role: "admin" | "member" | null;
}> {
  // Implementation...
}

// Resource access verification
async function verifyResourceAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
): Promise<boolean> {
  // Implementation...
}
```

#### Frontend Level (React Hooks)

```typescript
// Family membership hook
export function useFamilyMembership(familyId: string) {
  return useQuery(["family-membership", familyId], () =>
    fetchFamilyMembership(familyId),
  );
}

// Permission checking hook
export function useFamilyPermissions(familyId: string) {
  const { data: membership } = useFamilyMembership(familyId);

  return {
    canManageMembers: membership?.role === "admin",
    canCreateJointAccounts: membership?.role === "admin",
    canCreateSharedCategories: membership?.role === "admin",
    canEditFamilyTransactions: membership?.role === "admin",
  };
}
```

### Data Flow Architecture

#### Account/Category Access Flow

```
1. User requests accounts/categories
2. API queries both personal (user_id) and family (family_member) resources
3. Frontend receives unified list with family context
4. UI displays integrated view with appropriate badges/indicators
```

#### Transaction Creation Flow

```
1. User selects account (personal or joint) and category (personal or shared)
2. Form validates access permissions
3. API creates transaction with logged_by_user_id = current_user
4. Database triggers update account balances and budget progress
5. Frontend refreshes affected data
```

#### Family Dashboard Integration Flow

```
1. Dashboard APIs query both personal and family data
2. Shared categories include member contribution calculations
3. Frontend displays unified budget/investment progress
4. Member breakdowns shown for shared resources only
```

### Security Architecture

#### Data Isolation

- **Personal Data**: Accessible only to owner via `user_id = auth.uid()`
- **Family Data**: Accessible to family members via `family_id IN (user_families)`
- **Cross-Family Isolation**: No data leakage between different families
- **Role-Based Actions**: Admin-only operations enforced at database and API levels

#### Authentication & Authorization

- **Session Management**: Existing robust session management maintained
- **API Authentication**: All family endpoints require valid user session
- **Resource Authorization**: Multi-level checks (database RLS + API middleware + frontend guards)
- **Invitation Security**: Time-limited tokens, secure random generation

---

## Implementation Scope

### In Scope

#### Phase 1: Core Infrastructure (Weeks 1-2)

- ✅ Database schema changes (new tables, modified tables)
- ✅ Enhanced RLS policies for multi-tenant access
- ✅ Database migration scripts
- ✅ Enhanced database functions for family-aware queries

#### Phase 2: API Layer (Weeks 3-4)

- ✅ Family management endpoints (CRUD)
- ✅ Member management endpoints
- ✅ Invitation system endpoints
- ✅ Enhanced existing endpoints (accounts, categories, transactions)
- ✅ Permission middleware and utilities

#### Phase 3: Frontend Integration (Weeks 5-6)

- ✅ Family management UI in settings
- ✅ Enhanced account/category forms with scope selection
- ✅ Dashboard integration with member contributions
- ✅ Transaction attribution display
- ✅ Invitation acceptance/decline flow

#### Phase 4: Polish & Testing (Weeks 7-8)

- ✅ Comprehensive testing (unit, integration, e2e)
- ✅ Error handling and edge cases
- ✅ Performance optimization
- ✅ Mobile UI refinements
- ✅ Documentation updates

### Out of Scope (Future Enhancements)

#### Advanced Family Features

- ❌ Hierarchical families (parent/child family relationships)
- ❌ Family-wide financial goals with automated tracking
- ❌ Advanced reporting and analytics per family
- ❌ Family spending notifications and alerts
- ❌ Integration with external bank accounts for family data

#### Advanced Permission Features

- ❌ Custom roles beyond Admin/Member
- ❌ Granular permissions per resource type
- ❌ Temporary access grants
- ❌ Spending limits per family member

#### Advanced UI Features

- ❌ Real-time collaboration (live updates during family member actions)
- ❌ Advanced dashboard customization per family
- ❌ Export family financial reports
- ❌ Family financial calendar/planning tools

#### Integration Features

- ❌ Third-party bank account linking for families
- ❌ Family credit score tracking
- ❌ Integration with family tax software
- ❌ Family bill splitting automation

---

## Acceptance Criteria

### Family Management

- [ ] User can create family and becomes admin automatically
- [ ] Admin can invite members via email with role assignment
- [ ] Members receive invitation and can accept/decline
- [ ] Users can belong to multiple families simultaneously
- [ ] Admin can remove family members
- [ ] Family creator can delete entire family

### Account Management

- [ ] Personal accounts remain unchanged (existing functionality)
- [ ] Admin can create joint accounts associated with family
- [ ] All family members can view joint accounts
- [ ] Only admins can edit/delete joint accounts
- [ ] Joint accounts show family context in UI

### Category Management

- [ ] Personal categories remain unchanged (existing functionality)
- [ ] Admin can create shared categories with family budgets/targets
- [ ] All family members can view shared categories
- [ ] Only admins can edit/delete shared categories
- [ ] Shared categories show family context in UI

### Transaction Management

- [ ] All transactions track who logged them (`logged_by_user_id`)
- [ ] Users can transact against any accessible account/category
- [ ] Family transactions show attribution ("Logged by X")
- [ ] Members can edit/delete only their own family transactions
- [ ] Admins can edit/delete any family transactions

### Dashboard Integration

- [ ] Dashboard shows unified personal + family data
- [ ] Shared categories display member contribution breakdowns
- [ ] Budget progress includes individual member percentages
- [ ] Investment progress shows member contributions
- [ ] No context switching required - single integrated view

### Data Security

- [ ] Personal data remains private to individual users
- [ ] Family data accessible only to family members
- [ ] No data leakage between different families
- [ ] Role-based permissions enforced at all levels
- [ ] Invitation tokens are secure and time-limited

### User Experience

- [ ] Existing personal finance workflows unchanged
- [ ] Clear visual indicators for joint/shared resources
- [ ] Intuitive family management interface in settings
- [ ] Smooth invitation acceptance flow
- [ ] Mobile-responsive family features

---

## Migration Strategy

### Database Migration Approach

1. **Phase 1**: Create new tables (families, family_members, family_invitations)
2. **Phase 2**: Add new columns to existing tables (family_id, account_scope, is_shared, logged_by_user_id)
3. **Phase 3**: Backfill logged_by_user_id with existing user_id values
4. **Phase 4**: Update RLS policies to support family access
5. **Phase 5**: Deploy enhanced database functions

### API Deployment Strategy

1. **Backward Compatibility**: All existing API endpoints maintain current functionality
2. **Additive Changes**: New family endpoints deployed alongside existing ones
3. **Enhanced Responses**: Existing endpoints return additional family context fields
4. **Feature Flags**: Family features can be enabled/disabled via environment variables

### Frontend Rollout Strategy

1. **Progressive Enhancement**: Family features overlay existing functionality
2. **Graceful Degradation**: App functions fully even if family features disabled

### Risk Mitigation

- **Database Rollback Plans**: Each migration has corresponding rollback script
- **API Versioning**: Family enhancements don't break existing API contracts
- **Feature Toggles**: Family features can be disabled if issues arise
- **Data Integrity**: Comprehensive validation to prevent data corruption
- **Performance Monitoring**: Database and API performance tracked during rollout

---

## Success Metrics

### Technical Metrics

- Database query performance remains within 5% of current benchmarks
- API response times for enhanced endpoints < 200ms p95
- Zero data integrity issues during migration
- Family-enabled features achieve >99.9% uptime

### User Experience Metrics

- Family invitation acceptance rate > 80%
- Family feature adoption rate > 30% within 3 months
- User retention remains stable or improves
- Support tickets related to family features < 5% of total

### Business Metrics

- Increased user engagement with family-enabled accounts
- Higher transaction volume from family users
- Positive user feedback on family collaboration features
- Expansion of user base through family invitations

---

**Document Status**: Final Draft  
**Next Review Date**: Weekly during implementation  
**Approval Required**: Product Owner, Technical Lead, Security Review
