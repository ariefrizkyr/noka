# Spec Tasks

## Tasks

- [x] 1. Implement invitation context detection and step skipping
  - [x] 1.1 Modify onboarding page to detect invitation context from sessionStorage
  - [x] 1.2 Update step calculation logic to skip preference step for invited users
  - [x] 1.3 Auto-set onboardingType to "family" when invitation context is detected
  - [x] 1.4 Manual verification: Accept invitation and verify onboarding skips to step 2

- [x] 2. Add member invitation capability to family setup
  - [x] 2.1 Enhance family-setup component with invitation form section
  - [x] 2.2 Integrate with existing invitation API endpoints
  - [x] 2.3 Add email validation and role selection for invitations
  - [x] 2.4 Implement invitation status feedback (sent, failed, pending)
  - [x] 2.5 Manual verification: Create family and send member invitations during onboarding

- [x] 3. Implement auto-scoping for joint/shared resources
  - [x] 3.1 Remove family dropdown from account setup when family context exists
  - [x] 3.2 Remove family dropdown from category setup when family context exists
  - [x] 3.3 Auto-assign joint accounts to created family using onboardingFamilyId
  - [x] 3.4 Auto-assign shared categories to created family using onboardingFamilyId
  - [x] 3.5 Manual verification: Create joint accounts/categories and verify auto-assignment to family

- [x] 4. Implement inline editing for accounts and categories
  - [x] 4.1 Add edit mode state management to account list items
  - [x] 4.2 Add edit mode state management to category list items
  - [x] 4.3 Create inline form components for account editing
  - [x] 4.4 Create inline form components for category editing
  - [x] 4.5 Add click handlers and save/cancel actions with validation
  - [x] 4.6 Manual verification: Click existing accounts/categories and verify inline editing works
