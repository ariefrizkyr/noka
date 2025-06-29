# Noka - Product Requirements Document

## 1. Introduction
Managing personal finances is often a source of stress and confusion. Many people struggle to understand where their money is going, whether they are on track to meet their savings goals, and how to manage multiple accounts effectively.

This document outlines the requirements for Noka, a simple, intuitive, and powerful Personal Finance Tracker application designed to bring clarity and control to our users' financial lives. The app will provide essential tools for tracking income, expenses, and investments, all within a flexible and customizable interface.

## 2. Vision & Goals
Our vision is to empower individuals in Indonesia and beyond to take control of their financial well-being through an accessible and user-friendly platform.

**Key Goals:**
- **Provide Clarity**: Give users a clear, at-a-glance understanding of their financial position.
- **Promote Good Habits**: Enable users to set budgets and financial goals to encourage mindful spending and saving.
- **Ensure Security & Trust**: Build a secure and private platform where users feel safe managing their sensitive financial data.
- **Offer Flexibility**: Create a customizable experience that can adapt to a user's individual financial situation and preferences.

## 3. Technical Stack
- **Frontend**: Next.js
- **Backend & Authentication**: Supabase
- **UI Components**: shadcn/ui. Custom Tailwind CSS will only be used when a specific component or style is not available in the library.

## 4. Target Audience
- **The Young Professional**: Recently started their career, looking to manage their salary, control spending, and begin investing for the future.
- **The Financially Curious**: Wants a simple tool to digitize their financial tracking without the complexity of traditional accounting software.

## 5. User Flow and Application Interface
This section provides a comprehensive overview of the application's structure, detailing the user's journey from their first visit to their interaction with the core features and UI.

### 5.1. Design Principles
- **UI Library**: The interface will be built primarily using components from the shadcn/ui library to ensure consistency and speed up development.
- **Design Approach**: The application must be designed with a mobile-first philosophy. It should be fully responsive and provide an optimal experience on small screens, then scale up gracefully for tablets and desktops.

### 5.2. Unauthenticated User Flow
This covers the experience for users who have not yet logged in or signed up.

#### 5.2.1. Landing Page
When a user first lands on the Noka website, they are presented with a public-facing landing page containing:
- **Navbar**: Contains logo, links to "Features," "Pricing" (if applicable), and prominent "Sign In" and "Sign Up" buttons.
- **Hero Section**: A compelling headline, a brief description of Noka's value proposition, and an engaging visual.
- **Call to Action (CTA)**: A primary button encouraging users to "Get Started" or "Sign Up for Free," which directs them to the registration page.
- **Footer**: Privacy Policy menu, Term and Conditions menu, copyright wordings.

#### 5.2.2. Authentication (Powered by Supabase Auth)
User authentication is the gateway to the application.
- **Sign Up**: The user provides an email and a secure password. Upon successful registration, they are immediately redirected to the Onboarding Wizard.
- **Sign In**: Registered users can log in using their email and password. Upon successful login, they are redirected to the Application Dashboard (Home screen).
- **Password Reset**: If a user forgets their password, they can click a "Forgot Password?" link. Supabase Auth will handle sending a secure password reset link to their email.

### 5.3. First-Time User Onboarding Wizard
After signing up, new users are guided through a mandatory, one-time setup wizard to configure their Noka account. This ensures they can start using the app meaningfully.

- **Step 1: Welcome & Currency Setup**: A brief welcome message and a selector for their primary display currency (e.g., IDR, USD. Default IDR).
- **Step 2: Financial Period Configuration**: Fields to define their financial "month" start day and "week" start day.
  - Set their financial month to start on any day (e.g., from the 25th to the 24th, to match their salary cycle).
  - Set their financial week to start on their preferred day (e.g., Sunday instead of Monday).
- **Step 3: Create Initial Account**: A form to add their first financial account, including "Account Name," "Account Type," and "Initial Balance."
- **Step 4: Create Initial Categories & Targets**: A form to create at least one expense category or one investment category, with optional fields to set an initial budget or target.
  - **Expense Budgets**: For any expense category (like "Food" or "Shopping"), users can set a weekly or monthly spending budget. The app will display a tracker showing their progress against the budget.
  - **Investment Targets**: For investment categories, users can set a contribution target. This can be a recurring monthly target or a one-time goal for a specific fund.
- **Completion**: After the final step, the user is redirected to the Application Dashboard.

### 5.4. Authenticated User Flow: The Core Application
Once logged in, the user interacts with the app via a static bottom navigation bar that is always visible. It provides access to all core features.

#### 5.4.1. The Bottom Navigation Bar
This bar contains four primary icons/tabs:
- **Home**: The main dashboard screen.
- **Accounts**: A screen for viewing all financial accounts.
- **Transactions**: A screen for viewing a history of all transactions.
- **Settings**: A centralized place for all application and data management.

#### 5.4.2. "Home" Screen (Application Dashboard)
This is the user's main hub for a quick financial overview.
- **Top-Level Summary**: Displays a high-level overview for the current financial month: Total Income, Total Expenses, and Net Savings.
- **Tabbed View for Details**:
  - **Expense Tab (Default)**: Shows a list of all expense categories, segregated by "Weekly" and "Monthly" frequencies. Each category displays its name, budgeted amount, actual spending, and a visual progress indicator.
  - **Investment Tab**: Shows a list of all investment categories, segregated by "Monthly" and "One-Time" frequencies. Each category displays its name, target amount, actual funds invested, and a visual progress indicator.

#### 5.4.3. "Accounts" Screen
This screen provides a clear view of all the user's financial accounts.
- **Functionality**: Displays a list of all accounts the user has created.
- **UI**: Accounts must be grouped by their type (e.g., a "Bank Accounts" section, a "Credit Cards" section). Each account listed must show its name and current balance. Upon user clicking the Account card, then it should redirect user to "Transactions" screen with "Account" being filtered to the selected Account.

#### 5.4.4. "Transactions" Screen
This screen acts as a detailed financial ledger.
- **Functionality**: Displays a comprehensive list of all transactions (income, expenses, transfers).
- **UI**: The list is in reverse chronological order. It must include a date range filter, which defaults to the user's current financial month but can be adjusted to any custom range. user can filter by the Categories and Account

#### 5.4.5. "Settings" Screen
This screen is the control center for the user's data and preferences, organized into three tabs.
- **Tab 1: General**: Allows the user to view and modify their display currency and financial period settings.
- **Tab 2: Categories**: Provides full CRUD (Create, Read, Update, Delete) functionality for all categories. Users can add new categories and edit names/budgets/targets. When deleting a category, if it has existing transactions, the user must be prompted to move those transactions to another existing category before the deletion is finalized. This prevents data from being orphaned.
- **Tab 3: Accounts**: Provides full CRUD (Create, Read, Update, Delete) functionality for all financial accounts. Users can add new accounts and edit names. When deleting an account, if it has existing transactions, the user must be prompted to move those transactions to another existing account of the same type before the deletion is finalized. This prevents data from being orphaned.

## 6. User Scenarios
This section covers the key actions a user will perform within the Noka app.

### Fundamental Transactions

**Recording an Expense:**
- A user buys groceries for Rp 250,000 using their BCA Bank Account.
- They open the app, tap "Add Transaction," and select "Expense."
- They enter "250000," select the "Groceries" category, and choose their "BCA Bank Account."
- The app records the transaction and automatically deducts Rp 250,000 from the account's balance.

**Tracking an Income:**
- A user receives their monthly salary of Rp 8,000,000 in their "BCA Payroll" account.
- They open the app, select "Add Transaction," and choose "Income."
- They enter "8000000," select the "Salary" category, and choose their "BCA Payroll" account.
- The app records the income and correctly increases the balance of the payroll account by Rp 8,000,000.

**Making a Simple Transfer:**
- A user needs to move Rp 500,000 from their "BCA Payroll" account to their "Mandiri Savings" account.
- They select "Transfer," choose "BCA Payroll" as the source and "Mandiri Savings" as the destination, and enter "500000."
- The app records the transfer, correctly decreasing the balance in the payroll account and increasing the balance in the savings account.

**Making an Investment Transfer:**
- A user wants to contribute to their "Retirement Fund."
- They select "Transfer," choose their "BCA Payroll" account as the source and their "Investment Account" as the destination, and enter "1000000."
- Because the destination is an Investment Account, the app prompts them to select an Investment Category. They choose "Retirement Fund."
- The app records the transfer, decreasing the payroll account balance and increasing the investment account balance. It also updates the progress for the "Retirement Fund" target on the Home screen.

### Budgeting & Goal Setting

**Setting and Tracking an Expense Budget:**
- A user wants to control their grocery spending. They navigate to Settings > Categories, select their "Groceries" category, and set a "Monthly" budget of Rp 2,000,000.
- Later, they record a grocery expense of Rp 300,000.
- On the Home screen, they can now see a progress bar for the "Groceries" budget, showing "Rp 300,000 / Rp 2,000,000 used."

**Setting and Tracking a Monthly Investment Target:**
- A user is saving for retirement. They navigate to Settings > Categories, select their "Retirement Fund" category, and set a "Monthly" investment target of Rp 1,500,000.
- During the month, they transfer Rp 1,500,000 to their Investment Account, assigning it to the "Retirement Fund" category.
- The Home screen shows their "Retirement Fund" target is 100% complete for the current month and will reset for the next month.

**Setting and Tracking a One-Time Investment Target:**
- A user is saving for a house down payment. They go to Settings > Categories, create a new Investment Category called "House Down Payment," and set a "One-Time" target of Rp 50,000,000.
- They make an initial transfer of Rp 5,000,000 to their Investment Account under this new category.
- The Home screen dashboard shows a progress bar for this goal: "Rp 5,000,000 / Rp 50,000,000 (10%)". This goal does not reset monthly.

### Credit Card & Account Management

**Recording an Expense with a Credit Card:**
- A user pays for an online subscription of Rp 150,000 using their "Visa Credit Card."
- They select "Expense," enter "150000," choose the "Entertainment" category, and select their "Visa Credit Card" as the account.
- The app records the transaction and correctly increases the credit card's balance (the amount they owe) by Rp 150,000.

**Paying a Credit Card Bill:**
- At the end of the month, the user wants to pay off their "Visa Credit Card" bill from their "BCA Bank Account."
- They select "Transfer," choose "BCA Bank Account" as the source and "Visa Credit Card" as the destination, and enter the payment amount.
- The app records the transfer, decreasing the bank account balance and decreasing the credit card balance (the amount they owe).

**Adding a New Account After Onboarding:**
- Months after signing up, a user opens a new "Jenius" bank account.
- They navigate to the Settings > Accounts tab and click "Add New Account."
- They provide the "Account Name" (Jenius), "Account Type" (Bank Account), and the "Initial Balance" (e.g., Rp 500,000).
- The new account now appears on the Accounts screen and in their list of accounts for future transactions.

## 7. Success Metrics
- **User Engagement**: Daily and Monthly Active Users (DAU/MAU).
- **Feature Adoption**: Percentage of users who complete the onboarding and actively use budgeting and investment tracking features.
- **User Retention**: The rate at which users return to the app weekly and monthly.
- **User Satisfaction**: Qualitative feedback and app store ratings.

## 8. Database Schema

### 8.1. Overview
The database will be implemented using Supabase (PostgreSQL) with Row Level Security (RLS) enabled on all tables to ensure data isolation between users.

### 8.2. Tables and Relationships

#### Users Table (managed by Supabase Auth)
```sql
-- Supabase auth.users table is automatically created
-- We'll reference this via foreign keys
```

#### User Settings Table
```sql
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'IDR',
    financial_month_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_month_start_day >= 1 AND financial_month_start_day <= 31),
    financial_week_start_day INTEGER NOT NULL DEFAULT 1 CHECK (financial_week_start_day >= 0 AND financial_week_start_day <= 6), -- 0 = Sunday, 6 = Saturday
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);
```

#### Account Types Enum
```sql
CREATE TYPE account_type AS ENUM ('bank_account', 'credit_card', 'investment_account');
```

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

#### Category Types Enum
```sql
CREATE TYPE category_type AS ENUM ('expense', 'income', 'investment');
```

#### Budget Frequency Enum
```sql
CREATE TYPE budget_frequency AS ENUM ('weekly', 'monthly', 'one_time');
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

#### Transaction Types Enum
```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
```

#### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL, -- Can be negative for refunds
    description TEXT,
    transaction_date DATE NOT NULL,
    
    -- For income and expense transactions
    account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    
    -- For transfer transactions
    from_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    to_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    
    -- For investment transfers
    investment_category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_transactions_user_id (user_id),
    INDEX idx_transactions_date (transaction_date),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_account (account_id),
    INDEX idx_transactions_category (category_id),
    
    CONSTRAINT chk_transaction_consistency CHECK (
        (type IN ('income', 'expense') AND account_id IS NOT NULL AND category_id IS NOT NULL AND from_account_id IS NULL AND to_account_id IS NULL) OR
        (type = 'transfer' AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL AND account_id IS NULL AND category_id IS NULL)
    ),
    CONSTRAINT chk_investment_transfer CHECK (
        (type = 'transfer' AND to_account_id IN (SELECT id FROM accounts WHERE type = 'investment_account') AND investment_category_id IS NOT NULL) OR
        (investment_category_id IS NULL)
    )
);
```

#### Ledger Table (Balance History)
```sql
CREATE TABLE balance_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    change_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    INDEX idx_ledger_account (account_id),
    INDEX idx_ledger_transaction (transaction_id),
    INDEX idx_ledger_created (created_at)
);
```

#### Dashboard Functions

```sql
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
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
    v_total_income DECIMAL(15, 2);
    v_total_expenses DECIMAL(15, 2);
BEGIN
    -- Get user's financial month start day
    SELECT financial_month_start_day
    INTO v_month_start_day
    FROM user_settings
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
```

```sql
-- Function to calculate budget progress for expense categories
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
) AS $
DECLARE
    v_month_start_day INTEGER;
    v_week_start_day INTEGER;
    v_current_date DATE := CURRENT_DATE;
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    -- Get user's financial period settings
    SELECT financial_month_start_day, financial_week_start_day
    INTO v_month_start_day, v_week_start_day
    FROM user_settings
    WHERE user_id = p_user_id;

    -- For each expense category with budget
    FOR category_id, category_name, category_type, category_icon, budget_amount, budget_frequency IN
        SELECT c.id, c.name, c.type, c.icon, c.budget_amount, c.budget_frequency
        FROM categories c
        WHERE c.user_id = p_user_id AND c.type = 'expense' AND c.budget_amount IS NOT NULL AND c.is_active = TRUE
    LOOP
        -- Calculate period based on frequency and user settings
        IF budget_frequency = 'monthly' THEN
            -- Calculate custom month period
            IF EXTRACT(DAY FROM v_current_date) >= v_month_start_day THEN
                v_period_start := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 1) * INTERVAL '1 day';
                v_period_end := DATE_TRUNC('month', v_current_date + INTERVAL '1 month') + (v_month_start_day - 2) * INTERVAL '1 day';
            ELSE
                v_period_start := DATE_TRUNC('month', v_current_date - INTERVAL '1 month') + (v_month_start_day - 1) * INTERVAL '1 day';
                v_period_end := DATE_TRUNC('month', v_current_date) + (v_month_start_day - 2) * INTERVAL '1 day';
            END IF;
        ELSIF budget_frequency = 'weekly' THEN
            -- Calculate custom week period
            v_period_start := v_current_date - ((EXTRACT(DOW FROM v_current_date)::INTEGER - v_week_start_day + 7) % 7) * INTERVAL '1 day';
            v_period_end := v_period_start + INTERVAL '6 days';
        ELSIF budget_frequency = 'one_time' THEN
            -- For one-time budgets, consider all transactions
            v_period_start := '1900-01-01'::DATE;
            v_period_end := '2100-12-31'::DATE;
        END IF;

        -- Calculate spent amount for the period
        SELECT COALESCE(SUM(t.amount), 0)
        INTO spent_amount
        FROM transactions t
        WHERE t.category_id = category_id
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
$ LANGUAGE plpgsql;
```

```sql
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
```

### 8.3. Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Accounts Policies
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);
```

### 8.4. Database Functions and Triggers

```sql
-- Function to update account balance and record ledger entry
CREATE OR REPLACE FUNCTION update_account_balance_with_ledger()
RETURNS TRIGGER AS $
DECLARE
    v_balance_before DECIMAL(15, 2);
    v_balance_after DECIMAL(15, 2);
    v_amount DECIMAL(15, 2);
BEGIN
    -- Use absolute value for amount calculations
    v_amount := ABS(NEW.amount);
    
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'income' THEN
            -- For income: positive amount increases balance, negative amount (refund) decreases balance
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
            v_balance_after := v_balance_before + NEW.amount;
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
            
            -- Record in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
            
        ELSIF NEW.type = 'expense' THEN
            -- For expense: positive amount decreases balance (normal expense), negative amount increases balance (refund)
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.account_id;
            
            -- Credit cards: expenses increase balance (debt), refunds decrease balance
            IF (SELECT type FROM accounts WHERE id = NEW.account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before + NEW.amount;
            ELSE
                -- Other accounts: expenses decrease balance, refunds increase balance
                v_balance_after := v_balance_before - NEW.amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.account_id;
            
            -- Record in ledger
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.account_id, NEW.id, v_balance_before, v_balance_after, NEW.amount);
            
        ELSIF NEW.type = 'transfer' THEN
            -- Transfers always use positive amounts
            -- From account
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.from_account_id;
            
            -- Credit card as source: transfer decreases balance (paying off debt)
            IF (SELECT type FROM accounts WHERE id = NEW.from_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - v_amount;
            ELSE
                -- Other accounts: transfer decreases balance
                v_balance_after := v_balance_before - v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.from_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.from_account_id, NEW.id, v_balance_before, v_balance_after, -v_amount);
            
            -- To account
            SELECT current_balance INTO v_balance_before FROM accounts WHERE id = NEW.to_account_id;
            
            -- Credit card as destination: transfer decreases balance (paying off debt)
            IF (SELECT type FROM accounts WHERE id = NEW.to_account_id) = 'credit_card' THEN
                v_balance_after := v_balance_before - v_amount;
            ELSE
                -- Other accounts: transfer increases balance
                v_balance_after := v_balance_before + v_amount;
            END IF;
            
            UPDATE accounts SET current_balance = v_balance_after WHERE id = NEW.to_account_id;
            INSERT INTO balance_ledger (account_id, transaction_id, balance_before, balance_after, change_amount)
            VALUES (NEW.to_account_id, NEW.id, v_balance_before, v_balance_after, v_amount);
        END IF;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- For updates, it's safer to recalculate from ledger history
        -- This is a complex operation and might be better handled at application level
        RAISE EXCEPTION 'Transaction updates should be handled at application level for better control';
        
    ELSIF TG_OP = 'DELETE' THEN
        -- For deletes, reverse the transaction based on ledger history
        -- This ensures consistency with the historical record
        RAISE EXCEPTION 'Transaction deletion should be handled at application level for better control';
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_balance
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance_with_ledger();

-- Note: For UPDATE and DELETE operations on transactions, it's recommended to handle these
-- at the application level for better control and audit trail. The application should:
-- 1. For updates: Create a reversal transaction and a new transaction
-- 2. For deletes: Create a reversal transaction or implement soft deletes

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply timestamp triggers to all tables
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 9. API Endpoints Specification

### 9.1. Authentication Endpoints (Handled by Supabase)
- POST `/auth/signup` - User registration
- POST `/auth/signin` - User login
- POST `/auth/signout` - User logout
- POST `/auth/reset-password` - Password reset request
- POST `/auth/update-password` - Update password

### 9.2. User Settings Endpoints
- GET `/api/settings` - Get user settings
- POST `/api/settings` - Create initial user settings (called during onboarding)
- PUT `/api/settings` - Update user settings

### 9.3. Accounts Endpoints
- GET `/api/accounts` - List all user accounts
- GET `/api/accounts/:id` - Get specific account details
- POST `/api/accounts` - Create new account
- PUT `/api/accounts/:id` - Update account
- DELETE `/api/accounts/:id` - Delete account (with transaction reassignment)

### 9.4. Categories Endpoints
- GET `/api/categories` - List all user categories
- GET `/api/categories/:id` - Get specific category details
- POST `/api/categories` - Create new category
- PUT `/api/categories/:id` - Update category
- DELETE `/api/categories/:id` - Delete category (with transaction reassignment)

### 9.5. Transactions Endpoints
- GET `/api/transactions` - List transactions with filters
  - Query params: `startDate`, `endDate`, `accountId`, `categoryId`, `type`, `limit`, `offset`
- GET `/api/transactions/:id` - Get specific transaction
- POST `/api/transactions` - Create new transaction
- PUT `/api/transactions/:id` - Update transaction
- DELETE `/api/transactions/:id` - Delete transaction

### 9.6. Dashboard/Analytics Endpoints
- GET `/api/dashboard/summary` - Get financial summary for current period (uses `get_financial_summary` function)
- GET `/api/dashboard/budget-progress` - Get budget progress for all expense categories (uses `get_budget_progress` function)
- GET `/api/dashboard/investment-progress` - Get investment progress (uses `get_investment_progress` function)

## 10. Implementation Plan (AI-Assisted Development)

### 10.1. Phase 1: Foundation & Database (Week 1)
**Backend Setup:**
- Set up Supabase project
- Implement complete database schema with migrations
- Configure RLS policies
- Create database functions and triggers
- Test credit card balance logic
- Set up API routes structure in Next.js

**Initial Configuration:**
- Configure Supabase client in existing Next.js project
- Set up environment variables
- Create type definitions from database schema
- Set up basic error handling utilities

### 10.2. Phase 2: Authentication & Onboarding (Week 2)
**Authentication Flow:**
- Implement Supabase Auth integration
- Create protected routes middleware
- Build sign up/sign in/reset password pages
- Add loading and error states

**Onboarding Wizard:**
- Create multi-step onboarding component
- Implement currency and financial period setup
- Build initial account creation flow
- Add initial category setup with emoji picker
- Create onboarding completion handler

### 10.3. Phase 3: Core CRUD Operations (Week 3)
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

### 10.4. Phase 4: Transaction System (Week 4)
**Transaction Core:**
- Create transaction service layer
- Build transaction form with type-specific logic
- Implement credit card expense handling
- Add refund transaction support (negative amounts)
- Create transfer logic with credit card payment support

**Transaction List:**
- Build transaction list with infinite scroll
- Implement date range filtering
- Add category and account filters
- Create transaction detail view
- Add edit/delete functionality (with proper balance recalculation)

### 10.5. Phase 5: Dashboard & Analytics (Week 5)
**Dashboard Development:**
- Create dashboard layout with tabs
- Build financial summary calculations
- Implement budget progress with custom periods
- Create investment tracking display
- Add visual progress indicators

**Data Visualization:**
- Implement spending pattern charts
- Create budget vs actual comparisons
- Build category breakdown visualizations
- Add responsive chart components

### 10.6. Phase 6: Polish & Optimization (Week 6)
**User Experience:**
- Implement comprehensive loading states
- Add error boundaries and fallbacks
- Create empty states with actionable prompts
- Add micro-animations and transitions
- Ensure full mobile responsiveness

**Performance:**
- Implement React Query for data caching
- Add optimistic updates for better UX
- Create data prefetching strategies
- Optimize bundle size with dynamic imports

### 10.7. Phase 7: Testing & Deployment (Week 7)
**Testing:**
- Write unit tests for critical functions
- Create integration tests for API endpoints
- Test credit card and refund scenarios
- Perform cross-browser testing
- Conduct accessibility audit

**Deployment (Vercel):**
- Set up Vercel project
- Configure environment variables
- Set up preview deployments
- Configure custom domain
- Implement monitoring with Vercel Analytics
- Set up error tracking (Sentry)

### AI Development Guidelines

**Prompt Engineering Tips:**
1. **Component Generation**: "Create a React component for [feature] using shadcn/ui components, TypeScript, and React Query for data fetching"
2. **Database Queries**: "Write a Supabase query to [action] with proper error handling and TypeScript types"
3. **Business Logic**: "Implement the logic for [scenario] considering credit card balances and refund transactions"
4. **Testing**: "Generate tests for [component/function] covering edge cases like negative amounts and credit card transactions"

**Development Workflow:**
1. Use AI to generate initial component structure
2. Ask AI to review and optimize for performance
3. Request AI to add proper error handling
4. Have AI generate corresponding tests
5. Use AI for documentation generation

**Common Patterns to Request:**
- Supabase RLS-aware queries
- Optimistic updates with React Query
- Form validation with react-hook-form and zod
- Responsive layouts with Tailwind CSS
- Accessible components with ARIA labels

## 11. Technical Considerations

### 11.1. Security
- All API endpoints must validate user authentication
- Implement rate limiting on API endpoints
- Use HTTPS for all communications
- Sanitize all user inputs
- Implement CSRF protection
- Regular security audits

### 11.2. Performance
- Implement pagination for transaction lists
- Use database indexes effectively
- Cache frequently accessed data
- Optimize bundle size with code splitting
- Use lazy loading for components
- Implement virtual scrolling for long lists

### 11.3. Data Integrity

**Balance Management Considerations:**
- **Credit Card Behavior**: Credit cards work inversely - expenses increase the balance (debt), payments decrease it
- **Refund Handling**: Support negative amounts for refunds, which reverse the original transaction's effect
- **Ledger Benefits**: The ledger table provides complete audit trail and enables balance reconstruction if needed
- **Transaction Modifications**: Consider implementing transaction updates as reversals + new entries for better auditability

**Implementation Decision Points:**
1. **Database vs Application Logic**: The current design uses database triggers for immediate consistency. Alternatively, you could handle this in the application layer for more flexibility
2. **Update/Delete Strategy**: Rather than allowing direct updates/deletes, consider:
   - Soft deletes with an `is_deleted` flag
   - Immutable transactions with reversal entries
   - This provides better audit trails and easier debugging

**Validation Rules:**
- Ensure transfers between same account are prevented
- Validate account types match expected transaction behaviors
- Prevent negative balances on non-credit accounts (optional)
- Ensure investment transfers only go to investment accounts

### 11.4. Scalability
- Design with multi-tenancy in mind
- Use connection pooling
- Implement horizontal scaling capabilities
- Monitor and optimize database queries
- Use CDN for static assets

### 11.5. Accessibility
- Follow WCAG 2.1 AA standards
- Implement keyboard navigation
- Add proper ARIA labels
- Ensure color contrast compliance
- Test with screen readers

## 12. Future Enhancements (Post-Launch)
- Multi-currency support with exchange rates
- Recurring transactions
- Bill reminders and notifications
- Data export (CSV, PDF reports)
- Budget recommendations based on spending patterns
- Integration with banks/financial institutions
- Mobile app development
- Collaborative features for couples/families
- Advanced analytics and insights
- Goal-based savings recommendations