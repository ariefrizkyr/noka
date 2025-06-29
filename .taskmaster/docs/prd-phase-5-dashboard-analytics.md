# Noka PRD - Phase 5: Dashboard & Analytics

## 1. Introduction
This document outlines the requirements for Phase 5 of Noka. This phase focuses on building the "Home" screen, which serves as the user's main dashboard. It will provide a clear, at-a-glance overview of their financial health, including summaries, budget progress, and investment tracking.

## 2. Vision & Goals
Our vision is to empower users with actionable insights into their finances, presented in a simple and digestible format.
**Key Goals for this Phase:**
- Develop the main dashboard UI.
- Integrate backend database functions to pull financial summaries and progress data.
- Display expense budget progress with visual indicators.
- Display investment goal progress for both recurring and one-time targets.
- Implement data visualizations to make the information easy to understand.

## 3. Implementation Plan (Phase 5)
As per the main PRD, the focus for this phase is:

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

## 4. User Flow and Application Interface

### 4.1. "Home" Screen (Application Dashboard)
This is the user's main hub for a quick financial overview.
- **Top-Level Summary**: Displays a high-level overview for the current financial month: Total Income, Total Expenses, and Net Savings.
- **Tabbed View for Details**:
  - **Expense Tab (Default)**: Shows a list of all expense categories, segregated by "Weekly" and "Monthly" frequencies. Each category displays its name, budgeted amount, actual spending, and a visual progress indicator.
  - **Investment Tab**: Shows a list of all investment categories, segregated by "Monthly" and "One-Time" frequencies. Each category displays its name, target amount, actual funds invested, and a visual progress indicator.

### 4.2. User Scenarios

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

## 5. Relevant Database Schema
This phase relies entirely on the custom PostgreSQL functions created in Phase 1 to aggregate and calculate dashboard data efficiently.

```sql
-- Gets the high-level income, expenses, and savings for the user's current financial period.
CREATE OR REPLACE FUNCTION get_financial_summary(p_user_id UUID)
RETURNS TABLE (...) AS $$ ... $$ LANGUAGE plpgsql;

-- Calculates the spending progress for all categories that have a budget.
CREATE OR REPLACE FUNCTION get_budget_progress(p_user_id UUID)
RETURNS TABLE (...) AS $$ ... $$ LANGUAGE plpgsql;

-- Calculates the contribution progress for all investment categories that have a target.
CREATE OR REPLACE FUNCTION get_investment_progress(p_user_id UUID)
RETURNS TABLE (...) AS $$ ... $$ LANGUAGE plpgsql;
```

## 6. API Endpoints Specification
This phase implements the dashboard-specific endpoints that call the database functions.

- GET `/api/dashboard/summary` - Get financial summary for current period (uses `get_financial_summary` function).
- GET `/api/dashboard/budget-progress` - Get budget progress for all expense categories (uses `get_budget_progress` function).
- GET `/api/dashboard/investment-progress` - Get investment progress (uses `get_investment_progress` function).

## 7. Technical Considerations
- **Performance**: Calling database functions is more efficient than performing complex aggregations on the application server. The API layer should simply call these functions and return the results.
- **Data Caching**: The dashboard data is a great candidate for caching (e.g., using React Query or SWR). The data doesn't need to be real-time to the second, so caching it for a few minutes can reduce database load and improve UI responsiveness.
- **Data Visualization**:
    - Use a library like `recharts` or `visx` which works well with Next.js and server components.
    - Ensure charts are responsive and accessible, with proper labels and color contrast.
- **Empty States**: Design clear "empty states" for the dashboard. For example, what to show a new user who hasn't recorded any transactions or set any budgets yet. These states should guide the user on what to do next. 