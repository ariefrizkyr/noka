# Noka PRD - Phase 7: Testing & Deployment

## 1. Introduction
This document outlines the requirements for Phase 7 of Noka, the final phase before launch. This phase is focused on ensuring the application is stable, bug-free, and ready for production. It covers comprehensive testing, setting up the deployment pipeline, and configuring production infrastructure.

## 2. Vision & Goals
Our vision is to launch a high-quality, reliable, and secure application to our users.
**Key Goals for this Phase:**
- Achieve a high level of confidence in the application's stability through rigorous testing.
- Establish a seamless and automated deployment process to Vercel.
- Configure the production environment with all necessary settings and monitoring.
- Prepare the application for its first set of users.

## 3. Implementation Plan (Phase 7)
As per the main PRD, the focus for this phase is:

**Testing:**
- Write unit tests for critical functions (e.g., business logic, utility functions).
- Create integration tests for API endpoints to ensure they behave as expected.
- Test critical user scenarios, especially involving credit card balances and refunds.
- Perform cross-browser testing.
- Conduct a full accessibility audit.

**Deployment (Vercel):**
- Set up Vercel project and link to the Git repository.
- Configure production and preview environment variables.
- Set up preview deployments for pull requests.
- Configure the custom domain.
- Implement monitoring with Vercel Analytics.
- Set up error tracking with a service like Sentry.

## 4. Testing Strategy

### 4.1. Unit Tests
- **Tool**: Jest / Vitest
- **Scope**: Focus on pure functions, complex logic, and utilities.
    - Examples: Date manipulation utilities, functions that calculate financial metrics, form validation logic.

### 4.2. Integration Tests
- **Tool**: Jest / Vitest with Supertest, or Playwright for API testing.
- **Scope**: Test the API endpoints to verify they interact with the database correctly and enforce business rules.
    - Examples:
        - Calling `POST /api/transactions` with a credit card expense correctly increases the card's balance.
        - Calling `DELETE /api/accounts/:id` successfully reassigns transactions before deleting the account.
        - Ensure RLS policies are working by making requests on behalf of different users.

### 4.3. End-to-End (E2E) Tests
- **Tool**: Playwright / Cypress
- **Scope**: Simulate full user journeys through the application UI.
    - Examples:
        - A full sign-up, onboarding, and transaction creation flow.
        - A user edits a budget and sees the change reflected on the dashboard.
        - A user tries to delete an account and successfully completes the reassignment dialog.

### 4.4. Manual & Exploratory Testing
- **Scope**: Test for issues that are difficult to automate.
    - **Cross-Browser Testing**: Manually test the application on the latest versions of Chrome, Firefox, and Safari.
    - **Responsive Testing**: Verify the layout and functionality on various screen sizes, from small mobile phones to large desktops.
    - **Accessibility Audit**: Manually test with a screen reader (e.g., VoiceOver, NVDA) and check against WCAG 2.1 AA standards.

## 5. Deployment & Infrastructure

### 5.1. Platform
- **Vercel**: The application will be deployed to Vercel to leverage its seamless integration with Next.js, serverless functions, and global CDN.

### 5.2. Environments
- **Production**: The live application, connected to the production Supabase project (`prod` branch).
- **Preview**: Each pull request will automatically generate a preview deployment with its own isolated environment, connected to a staging/dev Supabase project.

### 5.3. Environment Variables
- The following environment variables must be configured in Vercel for both production and preview environments:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY` (if needed for admin tasks)

### 5.4. Monitoring & Logging
- **Vercel Analytics**: Enable to monitor traffic, page views, and basic performance metrics.
- **Error Tracking**: Integrate a service like **Sentry** or **Bugsnag**. This is crucial for capturing and diagnosing errors that occur in the production environment. All unhandled exceptions should be automatically reported.

## 6. Success Metrics for Launch
These metrics, defined in the main PRD, will be used to evaluate the success of the initial launch.
- **User Engagement**: Daily and Monthly Active Users (DAU/MAU).
- **Feature Adoption**: Percentage of users who complete the onboarding and actively use budgeting and investment tracking features.
- **User Retention**: The rate at which users return to the app weekly and monthly.
- **User Satisfaction**: Qualitative feedback and app store ratings.
- **Technical Stability**: Low rate of production errors reported in Sentry/error tracker. 