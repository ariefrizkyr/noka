# Spec Requirements Document

> Spec: Joint Transaction Category Visibility
> Created: 2025-08-09

## Overview

Enable family members to see actual category names for transactions in joint accounts instead of "Unknown category", improving transparency and understanding in shared financial management.

## User Stories

### Enhanced Joint Account Transaction Visibility

As a family member, I want to see the actual category names for all transactions in joint accounts, so that I can understand where shared money is being spent and make informed financial decisions.

**Detailed Workflow:**

1. Family member views transactions in a joint account through the main transactions page (`/transactions`) or account detail page (`/accounts/[id]`)
2. System displays the actual category name for each transaction (e.g., "Groceries", "Entertainment") instead of "Unknown category"
3. Category names are visible regardless of whether the category is personally owned or family-owned, achieved through enhanced API queries
4. This visibility applies automatically across all transaction display contexts for joint accounts the family member has access to

## Spec Scope

1. **Joint Account Transaction Display** - Show actual category names for all transactions in joint accounts to all family members with access across all transaction views (main transactions page and account detail pages)
2. **Category Name Resolution** - Implement logic to display category names even when categories aren't shared between family members, using enhanced API queries
3. **Frontend Component Enhancement** - Update transaction display components to handle enhanced category data while maintaining existing UI patterns
4. **Family Permission Integration** - Ensure category visibility respects existing family access controls for joint accounts without requiring schema changes

## Out of Scope

- Making personal categories visible to other family members
- Changing category sharing/ownership rules
- Modifying transaction creation or editing flows
- Adding new category management features
- Showing other's family member personal category in the dashboard

## Expected Deliverable

1. Family members can see actual category names (not "Unknown category") for all transactions in joint accounts they have access to across both `/transactions` page and `/accounts/[id]` pages
2. Category names display correctly in TransactionCard components via enhanced TransactionList data flow
3. Personal account transactions continue to respect existing privacy boundaries and show "Unknown category" for other family members' personal categories
