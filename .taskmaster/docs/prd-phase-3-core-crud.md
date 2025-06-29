# Noka PRD - Phase 3: Core CRUD Operations

## 1. Introduction
This document outlines the requirements for Phase 3 of Noka. This phase is dedicated to building the core data management features of the application, allowing users to perform full CRUD (Create, Read, Update, Delete) operations on their Accounts and Categories after the initial onboarding.

## 2. Vision & Goals
Our vision is to give users full control over their financial structure within Noka.
**Key Goals for this Phase:**
- Implement a user interface for listing and viewing all accounts and categories.
- Build forms and backend logic for creating, updating, and deleting accounts.
- Build forms and backend logic for creating, updating, and deleting categories, including their budgets/targets.
- Implement the "safe delete" feature, which reassigns transactions before deleting a parent account or category.

## 3. Implementation Plan (Phase 3)
As per the main PRD, the focus for this phase is:

**Account Management:**
- Create account service layer
- Build account list view with type grouping
- Implement account CRUD operations
- Add balance display logic (handle credit card negative display)
- Create account deletion with transaction reassignment

**Category Management:**
- Create category service layer
- Build category CRUD interface
- Implement emoji icon picker
- Add budget/target configuration
- Create category deletion with reassignment flow

## 4. User Flow and Application Interface

### 4.1. "Settings" Screen
This screen is the control center for the user's data and preferences, organized into three tabs. This phase will implement the "Categories" and "Accounts" tabs.

- **Tab 2: Categories**: Provides full CRUD (Create, Read, Update, Delete) functionality for all categories. Users can add new categories and edit names/budgets/targets. When deleting a category, if it has existing transactions, the user must be prompted to move those transactions to another existing category before the deletion is finalized. This prevents data from being orphaned.
- **Tab 3: Accounts**: Provides full CRUD (Create, Read, Update, Delete) functionality for all financial accounts. Users can add new accounts and edit names. When deleting an account, if it has existing transactions, the user must be prompted to move those transactions to another existing account of the same type before the deletion is finalized. This prevents data from being orphaned.

### 4.2. User Scenarios

**Adding a New Account After Onboarding:**
- Months after signing up, a user opens a new "Jenius" bank account.
- They navigate to the Settings > Accounts tab and click "Add New Account."
- They provide the "Account Name" (Jenius), "Account Type" (Bank Account), and the "Initial Balance" (e.g., Rp 500,000).
- The new account now appears on the Accounts screen and in their list of accounts for future transactions.

## 5. Relevant Database Schema
The `accounts` and `categories` tables are the primary focus. The logic for this phase will involve `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations on these tables.

#### Accounts Table
```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type account_type NOT NULL,
    initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    INDEX idx_accounts_user_id (user_id),
    INDEX idx_accounts_type (type)
);
```

#### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type category_type NOT NULL,
    icon VARCHAR(10), -- Emoji icon for UI representation
    budget_amount DECIMAL(15, 2),
    budget_frequency budget_frequency,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    INDEX idx_categories_user_id (user_id),
    INDEX idx_categories_type (type),
    CONSTRAINT chk_budget_consistency CHECK (
        (budget_amount IS NULL AND budget_frequency IS NULL) OR
        (budget_amount IS NOT NULL AND budget_frequency IS NOT NULL)
    )
);
```

## 6. API Endpoints Specification
This phase will implement the full CRUD functionality for the following endpoints.

### 6.1. Accounts Endpoints
- GET `/api/accounts` - List all user accounts.
- GET `/api/accounts/:id` - Get specific account details.
- POST `/api/accounts` - Create new account (re-used from onboarding).
- PUT `/api/accounts/:id` - Update account details (name).
- DELETE `/api/accounts/:id` - Delete account. The backend must handle the logic for reassigning transactions before deletion.

### 6.2. Categories Endpoints
- GET `/api/categories` - List all user categories.
- GET `/api/categories/:id` - Get specific category details.
- POST `/api/categories` - Create new category (re-used from onboarding).
- PUT `/api/categories/:id` - Update category details (name, icon, budget).
- DELETE `/api/categories/:id` - Delete category. The backend must handle the logic for reassigning transactions before deletion.

## 7. Technical Considerations
- **Data Integrity**: The transaction reassignment logic is critical. This should be handled within a database transaction to ensure that either both the reassignment and the deletion succeed, or they both fail, preventing orphaned records.
- **User Experience**:
    - Deletion should be a two-step process: the user clicks delete, a dialog appears asking them to select a replacement account/category, and then they confirm.
    - Use optimistic updates for a smoother UI. For example, when a user edits a category name, update the UI immediately and revert only if the API call fails.
- **Form Validation**: Use a library like `zod` with `react-hook-form` to validate all form inputs for creating and editing accounts and categories. 