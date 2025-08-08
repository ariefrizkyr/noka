# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-08-onboarding-improvements/spec.md

> Created: 2025-08-08
> Status: Ready for Implementation

## Tasks

- [x] 1. Implement invitation context detection and step skipping
  - [x] 1.1 Modify onboarding page to detect invitation context from sessionStorage
  - [x] 1.2 Update step calculation logic to skip preference step for invited users
  - [x] 1.3 Auto-set onboardingType to "family" when invitation context is detected
  - [x] 1.4 Manual verification: Accept invitation and verify onboarding skips to step 2

- [ ] 2. Add member invitation capability to family setup
  - [ ] 2.1 Enhance family-setup component with invitation form section
  - [ ] 2.2 Integrate with existing invitation API endpoints
  - [ ] 2.3 Add email validation and role selection for invitations
  - [ ] 2.4 Implement invitation status feedback (sent, failed, pending)
  - [ ] 2.5 Manual verification: Create family and send member invitations during onboarding

- [ ] 3. Implement auto-scoping for joint/shared resources
  - [ ] 3.1 Remove family dropdown from account setup when family context exists
  - [ ] 3.2 Remove family dropdown from category setup when family context exists
  - [ ] 3.3 Auto-assign joint accounts to created family using onboardingFamilyId
  - [ ] 3.4 Auto-assign shared categories to created family using onboardingFamilyId
  - [ ] 3.5 Manual verification: Create joint accounts/categories and verify auto-assignment to family

- [ ] 4. Implement inline editing for accounts and categories
  - [ ] 4.1 Add edit mode state management to account list items
  - [ ] 4.2 Add edit mode state management to category list items
  - [ ] 4.3 Create inline form components for account editing
  - [ ] 4.4 Create inline form components for category editing
  - [ ] 4.5 Add click handlers and save/cancel actions with validation
  - [ ] 4.6 Manual verification: Click existing accounts/categories and verify inline editing works

- [ ] 5. UI consistency and integration testing
  - [ ] 5.1 Ensure all changes maintain existing shadcn/ui styling patterns
  - [ ] 5.2 Verify responsive design works on mobile for all modifications
  - [ ] 5.3 Test loading states and error handling for new features
  - [ ] 5.4 Manual verification: Complete full onboarding flow from invitation to finish