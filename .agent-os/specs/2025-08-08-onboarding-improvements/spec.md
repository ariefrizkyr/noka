# Spec Requirements Document

> Spec: Onboarding Process Improvements
> Created: 2025-08-08

## Overview

Improve the onboarding user experience by streamlining the flow for invited users, simplifying family resource creation, adding inline editing capabilities, and enabling member invitations during family setup. These enhancements will reduce friction and make the onboarding process more intuitive while maintaining the existing UI coherence.

## User Stories

### Invited User Onboarding Experience

As an invited user who has accepted a family invitation, I want to skip the preference selection step and go directly to the family setup, so that I don't have to make redundant choices since I'm already joining an existing family.

When an invited user is redirected to onboarding after accepting an invitation, the system will detect the invitation context and skip step 1 (preference selection), proceeding directly to step 2 where they see "You are member of [Family Name]" confirmation.

### Family Administrator Inviting Members

As a family creator during onboarding, I want to invite family members immediately after creating the family, so that I can set up the complete family structure in one session without needing to return to settings later.

During the family setup step, after successfully creating a family, users will see an optional "Invite Family Members" section where they can send invitations to email addresses with appropriate role selection.

### Simplified Resource Scoping

As a user creating joint accounts and categories during onboarding, I want the system to automatically connect them to my newly created family instead of requiring me to select from a dropdown, so that the process is faster and less error-prone.

When users select "Joint" or "Shared" for accounts/categories during onboarding, the system will automatically assign them to the previously created family without showing family selection dropdowns.

### Inline Resource Editing

As a user who has created accounts and categories during onboarding, I want to edit them by clicking directly on the list items, so that I can quickly make corrections without complex form navigation.

Clicking on existing account or category items in the onboarding lists will enable inline editing directly within the list item, allowing users to modify the data immediately.

## Spec Scope

1. **Invitation Context Detection** - Skip step 1 when users come from invitation acceptance
2. **Family Member Invitations** - Add invitation capability during family setup step
3. **Auto-Scoping for Joint Resources** - Remove family dropdown for joint accounts/categories and auto-assign to created family
4. **Inline Editing Interface** - Enable direct editing of created accounts and categories within list items
5. **Flow Optimization** - Maintain UI coherence while streamlining the onboarding experience

## Out of Scope

- Changes to the invitation acceptance flow or token handling
- Modifications to the underlying family creation or resource creation APIs
- Redesign of the overall onboarding visual design or branding
- Advanced animation or transition effects
- Bulk editing or multi-selection capabilities

## Expected Deliverable

1. Invited users automatically skip preference selection and proceed to family-focused onboarding steps
2. Family creators can send member invitations directly during the onboarding family setup
3. Joint accounts and categories are automatically connected to the created family without dropdown selection
4. Users can edit existing accounts and categories through inline editing within the onboarding lists