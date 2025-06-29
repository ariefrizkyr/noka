# Noka PRD - Phase 4: Transaction System

## 1. Introduction
This document outlines the requirements for Phase 4 of Noka. This is a critical phase that involves building the entire transaction management system. This includes recording income, expenses, and transfers, and ensuring all account balances are updated correctly.

## 2. Vision & Goals
Our vision is to provide a fast, intuitive, and accurate way for users to record their financial activities.
**Key Goals for this Phase:**
- Build a comprehensive transaction creation form that handles all transaction types (income, expense, transfer).
- Implement the core business logic for how transactions affect account balances, paying special attention to credit card behavior.
- Develop a clear and filterable view of transaction history.
- Ensure the `balance_ledger` is correctly populated for a complete audit trail.

## 3. Implementation Plan (Phase 4)
As per the main PRD, the focus for this phase is:

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

## 4. User Scenarios
This phase will implement the following fundamental user actions.

### 4.1. Fundamental Transactions

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

### 4.2. Credit Card Scenarios

**Recording an Expense with a Credit Card:**
- A user pays for an online subscription of Rp 150,000 using their "Visa Credit Card."
- They select "Expense," enter "150000," choose the "Entertainment" category, and select their "Visa Credit Card" as the account.
- The app records the transaction and correctly increases the credit card's balance (the amount they owe) by Rp 150,000.

**Paying a Credit Card Bill:**
- At the end of the month, the user wants to pay off their "Visa Credit Card" bill from their "BCA Bank Account."
- They select "Transfer," choose "BCA Bank Account" as the source and "Visa Credit Card" as the destination, and enter the payment amount.
- The app records the transfer, decreasing the bank account balance and decreasing the credit card balance (the amount they owe).

## 5. Relevant Database Schema
This phase heavily relies on the `transactions` and `balance_ledger` tables, and the trigger that connects them.

#### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL, -- Can be negative for refunds
    description TEXT,
    transaction_date DATE NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    from_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    to_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    investment_category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- ... indexes and constraints
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
    -- ... indexes
);
```

#### Balance Update Function & Trigger
The `update_account_balance_with_ledger()` function and its associated trigger are the heart of this phase's backend logic. They must be thoroughly tested.

## 6. API Endpoints Specification
The full implementation of the transaction endpoints is the core of this phase.

- GET `/api/transactions` - List transactions with filters.
  - Query params: `startDate`, `endDate`, `accountId`, `categoryId`, `type`, `limit`, `offset`
- GET `/api/transactions/:id` - Get specific transaction.
- POST `/api/transactions` - Create new transaction (income, expense, or transfer).
- PUT `/api/transactions/:id` - Update transaction.
- DELETE `/api/transactions/:id` - Delete transaction.

## 7. Technical Considerations
- **Data Integrity and Balance Management**:
    - The logic within the `update_account_balance_with_ledger` trigger is paramount. It must correctly handle positive/negative amounts for income/expense, and the inverse logic for credit card balances.
    - **Refunds**: The system must support negative amounts for expense/income transactions to handle refunds correctly.
    - **Transaction Updates/Deletes**: The main PRD suggests that updates and deletes should be handled at the application level (e.g., by creating reversal transactions) rather than direct database modifications to maintain a perfect audit trail. This strategy should be finalized and implemented in this phase.
- **User Experience**:
    - The transaction form must be dynamic. For example, selecting "Transfer" should show "From Account" and "To Account" fields, while "Expense" should show "Account" and "Category" fields.
    - For the transaction list, implement "infinite scroll" or pagination to handle large datasets efficiently.
- **Performance**:
    - Ensure the `transactions` table is properly indexed, especially on `user_id`, `transaction_date`, `account_id`, and `category_id` to make filtering fast. 