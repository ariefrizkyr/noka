# Noka PRD - Phase 1: Foundation & Database

## 1. Introduction
This document outlines the requirements for the foundational phase of Noka, a simple, intuitive, and powerful Personal Finance Tracker application. This phase focuses on setting up the backend, database schema, and core project structure.

## 2. Vision & Goals
Our vision is to empower individuals to take control of their financial well-being.
**Key Goals for this Phase:**
- Establish a robust and scalable database schema in Supabase.
- Implement all necessary tables, types, functions, and triggers.
- Configure Row Level Security (RLS) for data privacy.
- Set up the basic Next.js project structure for API routes.
- Ensure the foundation is solid for future development phases.

## 3. Technical Stack
- **Frontend**: Next.js
- **Backend & Authentication**: Supabase
- **UI Components**: shadcn/ui. Custom Tailwind CSS will only be used when a specific component or style is not available in the library.

## 4. Implementation Plan (Phase 1)
As per the main PRD, the focus for this phase is:

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

## 5. Database Schema
The entire database will be implemented in this phase.

### 5.1. Overview
The database will be implemented using Supabase (PostgreSQL) with Row Level Security (RLS) enabled on all tables to ensure data isolation between users.

### 5.2. Tables and Relationships

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

### 5.3. Row Level Security Policies

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

### 5.4. Database Functions and Triggers

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

-- Dashboard Functions (To be used in later phases, but defined here)

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

## 6. API Endpoints Specification
This phase will involve setting up the structure for the API routes in Next.js, but not necessarily implementing the logic for all of them. The focus is on creating the file structure.

- `/api/settings`
- `/api/accounts`
- `/api/categories`
- `/api/transactions`
- `/api/dashboard`

## 7. Technical Considerations
- **Data Integrity**: The trigger `update_account_balance_with_ledger` is critical and must be tested thoroughly, especially the logic for credit cards vs. other account types.
- **Scalability**: The database schema is designed with indexes on foreign keys and frequently queried columns (`user_id`, `type`, `transaction_date`) to ensure performance as data grows.
- **Security**: All tables must have RLS enabled and policies must be correctly configured to prevent data leaks between users. This is a day-one requirement. 