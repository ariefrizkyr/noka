# Noka PRD - Phase 2: Authentication & Onboarding

## 1. Introduction
This document outlines the requirements for Phase 2 of Noka. The focus of this phase is to build a secure authentication system using Supabase Auth and a seamless onboarding experience for new users.

## 2. Vision & Goals
Our vision is to provide a secure and welcoming entry point into the Noka ecosystem.
**Key Goals for this Phase:**
- Implement a full authentication flow (Sign Up, Sign In, Password Reset).
- Create protected routes to secure the core application.
- Build a multi-step onboarding wizard to guide new users through initial setup.
- Ensure user settings from onboarding are correctly saved to the database.

## 3. Implementation Plan (Phase 2)
As per the main PRD, the focus for this phase is:

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

## 4. User Flow and Application Interface

### 4.1. Unauthenticated User Flow
This covers the experience for users who have not yet logged in or signed up.

#### 4.1.1. Landing Page
When a user first lands on the Noka website, they are presented with a public-facing landing page containing:
- **Navbar**: Contains logo, links to "Features," "Pricing" (if applicable), and prominent "Sign In" and "Sign Up" buttons.
- **Hero Section**: A compelling headline, a brief description of Noka's value proposition, and an engaging visual.
- **Call to Action (CTA)**: A primary button encouraging users to "Get Started" or "Sign Up for Free," which directs them to the registration page.
- **Footer**: Privacy Policy menu, Term and Conditions menu, copyright wordings.

#### 4.1.2. Authentication (Powered by Supabase Auth)
User authentication is the gateway to the application.
- **Sign Up**: The user provides an email and a secure password. Upon successful registration, they are immediately redirected to the Onboarding Wizard.
- **Sign In**: Registered users can log in using their email and password. Upon successful login, they are redirected to the Application Dashboard (Home screen).
- **Password Reset**: If a user forgets their password, they can click a "Forgot Password?" link. Supabase Auth will handle sending a secure password reset link to their email.

### 4.2. First-Time User Onboarding Wizard
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

## 5. Relevant Database Schema
The following tables are central to this phase.

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
*Note: The `onboarding_completed` flag will be set to `true` at the end of the wizard.*

#### Accounts and Categories Tables
The onboarding wizard will perform the first `INSERT` operations into the `accounts` and `categories` tables for the new user.

## 6. API Endpoints Specification
This phase will implement the following endpoints.

### 6.1. Authentication Endpoints (Handled by Supabase)
- POST `/auth/signup` - User registration
- POST `/auth/signin` - User login
- POST `/auth/signout` - User logout
- POST `/auth/reset-password` - Password reset request
- POST `/auth/update-password` - Update password

### 6.2. User Settings Endpoints
- POST `/api/settings` - Create initial user settings (called during onboarding). This endpoint will be responsible for creating the `user_settings` row.

### 6.3. Accounts & Categories Endpoints
- POST `/api/accounts` - Create new account (called during onboarding).
- POST `/api/categories` - Create new category (called during onboarding).

## 7. Technical Considerations
- **Security**: 
    - All API endpoints must validate user authentication using the Supabase session.
    - Implement CSRF protection, especially for forms.
    - Sanitize all user inputs from the onboarding forms.
- **State Management**: A client-side state management solution (e.g., Zustand or React Context) will be needed to manage state across the multi-step onboarding wizard.
- **Error Handling**: Implement robust error handling for API calls (e.g., email already taken, invalid password) and display user-friendly error messages on the UI. 