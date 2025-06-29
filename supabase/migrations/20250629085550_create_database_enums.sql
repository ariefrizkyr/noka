-- Create Database Enums as specified in the PRD

-- Account Types Enum
CREATE TYPE account_type AS ENUM ('bank_account', 'credit_card', 'investment_account');

-- Category Types Enum
CREATE TYPE category_type AS ENUM ('expense', 'income', 'investment');

-- Budget Frequency Enum
CREATE TYPE budget_frequency AS ENUM ('weekly', 'monthly', 'one_time');

-- Transaction Types Enum
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
