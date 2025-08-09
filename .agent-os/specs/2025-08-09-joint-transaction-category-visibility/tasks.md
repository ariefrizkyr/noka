# Spec Tasks

## Tasks

- [ ] 1. Enhance Transaction API Query
  - [ ] 1.1 Implement enhanced transaction query in `app/api/transactions/route.ts` to conditionally load category names for joint account transactions
  - [ ] 1.2 Add logic to detect joint accounts via `account_scope` field and apply appropriate category name joins
  - [ ] 1.3 Preserve existing RLS security for personal account transactions while enabling category name visibility for joint accounts
  - [ ] 1.4 Perform manual verification that joint account transactions return actual category names via API

- [ ] 2. Update Family Permission Logic
  - [ ] 2.1 Enhance `app/api/utils/family-auth.ts` to include joint account detection logic for category visibility rules
  - [ ] 2.2 Implement category name visibility rules based on account scope and user access permissions
  - [ ] 2.3 Perform manual verification that permission logic correctly identifies when category names should be visible

- [ ] 3. Update Transaction Display Components
  - [ ] 3.1 Modify `components/transactions/transaction-card.tsx` to handle enhanced category data and display actual names for joint account transactions
  - [ ] 3.2 Update `components/transactions/transaction-list.tsx` to pass enhanced transaction data with category names to card components
  - [ ] 3.3 Ensure fallback logic properly handles category name display with tiered approach (category name → joint account category name → "Unknown Category")
  - [ ] 3.4 Perform manual verification that transaction cards display actual category names for joint accounts

- [ ] 4. End-to-End Feature Verification
  - [ ] 4.1 Manual verification on `/transactions` page that joint account transactions show actual category names instead of "Unknown category"
  - [ ] 4.2 Manual verification on `/accounts/[id]` pages that joint account transactions show actual category names in account detail views
  - [ ] 4.3 Verify that personal account transactions continue to show "Unknown category" for other family members' personal categories
  - [ ] 4.4 Confirm that the feature works consistently across all transaction display contexts and maintains existing security boundaries