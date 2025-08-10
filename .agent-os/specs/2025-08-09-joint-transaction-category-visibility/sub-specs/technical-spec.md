# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-09-joint-transaction-category-visibility/spec.md

> Created: 2025-08-09
> Version: 1.0.0

## Technical Requirements

### Database Query Enhancement

- **Modified Transaction Query Pattern**: Update the transaction loading queries in `app/api/transactions/route.ts` to include category names for joint account transactions regardless of category ownership
- **Category Name Resolution Logic**: Implement logic to load category names for transactions in joint accounts even when the requesting user doesn't own the category
- **RLS Policy Compatibility**: Ensure category name loading works within existing Row Level Security constraints by using selective joins based on account scope
- **Performance Optimization**: Minimize additional database queries by enhancing existing joins rather than making separate category lookups

### API Layer Modifications

**File Path**: `app/api/transactions/route.ts` (existing file modification)

- **Enhanced SELECT Query**: Modify the existing transaction select query to conditionally load category names based on account scope:
  - For personal account transactions: Use existing RLS-filtered category joins
  - For joint account transactions: Use unrestricted category name joins for display purposes only
- **Category Access Control**: Maintain security by only loading category names (not full category details) for joint account transactions
- **Response Structure**: Preserve existing transaction response format while ensuring category names are populated

### Frontend Component Updates

**File Path**: `components/transactions/transaction-card.tsx` (existing file modification)

- **Display Logic Enhancement**: Update the `getTransactionDisplay()` function to handle category name display for joint accounts
- **Fallback Strategy**: Implement tiered fallback for category names:
  1. Use `transaction.categories?.name` if available (existing behavior)
  2. Use joint account category name if transaction is in joint account and name is provided
  3. Fall back to "Unknown Category" only when category name cannot be determined
- **Type Safety**: Ensure TypeScript interfaces support the enhanced category data structure

**File Path**: `components/transactions/transaction-list.tsx` (existing file modification)

- **Component Integration**: Ensure TransactionList component passes enhanced transaction data to TransactionCard components
- **Filter Compatibility**: Maintain existing filter functionality while supporting enhanced category data
- **Performance**: Ensure category data loading doesn't impact transaction list rendering performance

**File Path**: `app/accounts/[id]/page.tsx` (no changes required)

- **Analysis**: This page uses TransactionList component (line 268) which will automatically benefit from enhanced category data
- **Data Flow**: Enhanced API data → TransactionList → TransactionCard → Display actual category names
- **Verification**: Manual testing should confirm joint account transactions show actual category names

**File Path**: `app/transactions/page.tsx` (no changes required)

- **Analysis**: This page uses TransactionList component (line 181) which will automatically benefit from enhanced category data  
- **Data Flow**: Enhanced API data → TransactionList → TransactionCard → Display actual category names
- **Verification**: Manual testing should confirm joint account transactions show actual category names

### Permission Integration

**File Path**: `app/api/utils/family-auth.ts` (existing file modification)

- **Joint Account Detection**: Enhance existing `verifyAccountAccess` function to identify when a transaction belongs to a joint account
- **Category Visibility Rules**: Implement logic to determine when category names should be visible for joint account transactions:
  - If account is joint AND user has access to the account → show category name
  - If account is personal AND user owns category → show category name (existing)
  - Otherwise → show "Unknown Category" (existing)

### Database Schema Considerations

**No Schema Changes Required**: This implementation works within existing schema by:
- Leveraging existing `account_scope` field to identify joint accounts
- Using existing `family_id` relationships for access control
- Modifying query joins rather than adding new tables or fields

## Approach

### Query Enhancement Strategy

1. **Conditional Join Pattern**: Modify the existing transaction query to use conditional LEFT JOINs:
   ```sql
   -- Existing join (RLS protected)
   categories!transactions_category_id_fkey(name, type, icon, is_shared, family_id)
   
   -- Enhanced join for joint account category names
   -- This would be implemented through Supabase query builder logic
   ```

2. **Account Scope Detection**: Use the existing `accounts.account_scope` field to determine when to apply enhanced category name loading

3. **Security Preservation**: Only load category names (not full category data) for joint account transactions to maintain security boundaries

### Implementation Flow

1. **Transaction Query Enhancement**:
   - Modify GET `/api/transactions` endpoint
   - Add conditional logic based on account scope
   - Preserve existing RLS security for personal accounts

2. **Response Processing**:
   - Enhance transaction enhancement logic in the API response
   - Ensure category names are available for joint account transactions

3. **Frontend Display**:
   - Update transaction card component to use enhanced category data
   - Update transaction list component to support enhanced data flow  
   - Verify automatic enhancement across all pages using TransactionList component
   - Maintain existing UI patterns and styling across all views

4. **Testing Strategy**:
   - Manual verification of `/transactions` page - joint account transactions show actual category names
   - Manual verification of `/accounts/[id]` page - joint account transactions show actual category names
   - Verify personal account transaction display remains unchanged in both views
   - Confirm security boundaries are maintained across all transaction display contexts

### Performance Considerations

- **Single Query Approach**: Enhance existing queries rather than adding separate lookups
- **Selective Enhancement**: Only apply enhanced loading for joint account transactions
- **Index Utilization**: Leverage existing database indexes on account_scope and family_id

### Security Boundaries

- **Read-Only Category Names**: Only expose category names for display, not full category management rights
- **Account Access Control**: Category name visibility is strictly tied to joint account access
- **RLS Compliance**: Personal account transactions continue using existing RLS-protected category joins

## External Dependencies

No new external dependencies required. This implementation uses existing:
- Supabase query patterns
- TypeScript interfaces
- React component patterns
- Family permission system