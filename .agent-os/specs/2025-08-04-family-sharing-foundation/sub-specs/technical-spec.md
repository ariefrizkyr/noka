# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-04-family-sharing-foundation/spec.md

## Technical Requirements

### Phase 1: Database Infrastructure & API Foundation

#### Database Schema Architecture

- **Multi-tenant design** with strict data isolation using `family_id` as tenant identifier
- **Zero-downtime migrations** using additive changes only, with safe column additions and enum types
- **Row Level Security (RLS)** policies enforcing `auth.uid()` validation for personal resources and family membership validation for shared resources
- **Composite indexes** on `(family_id, user_id)` and `(user_id, family_id)` for optimal query performance
- **Check constraints** ensuring data consistency between `account_scope/family_id` and `is_shared/family_id` relationships

#### Transaction Attribution System

- **Automatic logging** of `logged_by_user_id` in all transaction endpoints using `requireAuth()` user ID
- **Database schema**: Add `logged_by_user_id` column to transactions table with NOT NULL constraint
- **API integration**: Modify transaction creation/update endpoints to capture authenticated user ID

#### Family Management API Endpoints

- **Base path**: `/api/families` following existing REST patterns from `/api/accounts`
- **Authentication**: All endpoints use `requireAuth()` middleware from `app/api/utils/auth.ts`
- **Response format**: Standard `ApiResponse<T>` interface from `app/api/utils/response.ts`
- **Error handling**: Centralized using `handleApiError()` from `app/api/utils/error-handler.ts`
- **Validation**: Zod schemas in `app/api/utils/validation.ts` for request body validation

#### Permission Middleware Architecture

```typescript
// app/api/utils/family-auth.ts
export async function verifyFamilyAccess(
  userId: string,
  familyId: string,
): Promise<{
  isMember: boolean;
  isAdmin: boolean;
  role: "admin" | "member" | null;
}>;

export async function requireFamilyAdmin(
  userId: string,
  familyId: string,
): Promise<void>;
```

#### Enhanced Resource APIs

- **Backward compatibility**: Existing endpoints maintain current response structure
- **Additive responses**: New optional fields (`family_id`, `family_name`, `account_scope`, `is_shared`, `logged_by_user_id`)
- **Query optimization**: Single queries fetching both personal and family resources using UNION or OR conditions
- **Index utilization**: Leveraging composite indexes for efficient family-scoped queries

### Phase 2: Minimal UI Integration

#### Enhanced Onboarding Journey

- **File modifications**: `app/onboarding/page.tsx` - Update TOTAL_STEPS from 3 to 4 for family users
- **New onboarding step**: Create `app/onboarding/steps/usage-type-setup.tsx` as the first step
- **Session storage**: Store user choice of "Personal" or "Family" in sessionStorage for flow control
- **Conditional flow**: If "Family" chosen, insert family setup step before existing account setup
- **Form context**: Pass family context to account and category setup forms

##### Usage Type Selection Step

- **Component**: `usage-type-setup.tsx` with radio button selection between "Personal" and "Family"
- **Design**: Large card-based selection with icons and descriptions
- **Validation**: Require selection before proceeding to next step
- **Storage**: Save selection to sessionStorage as `onboardingType: 'personal' | 'family'`

##### Family Setup Step (Conditional)

- **Component**: `app/onboarding/steps/family-setup.tsx` - only shown if "Family" selected
- **Functionality**: Family creation form similar to settings family management
- **Integration**: After family creation, user becomes admin and continues to account setup
- **Context**: Newly created family ID passed to subsequent onboarding steps

#### Account & Category Form Enhancements

- **Account Form**: `components/settings/account-form.tsx` and `app/onboarding/steps/account-setup.tsx`
  - Radio button group for Personal/Joint selection with conditional family dropdown
  - Client-side validation ensuring joint accounts require family selection and user has admin role
  - Server-side enforcement in account creation API preventing non-admins from creating joint accounts
- **Category Form**: `components/settings/category-form.tsx` and `app/onboarding/steps/category-setup.tsx`
  - Scope selection interface with Personal/Shared radio buttons and family context
  - Budget/target inheritance from personal category patterns with family-wide calculation
  - Progressive enhancement maintaining existing category functionality while adding sharing capabilities

#### Family Management UI

- **File creation**: `app/settings/components/family-management.tsx`
- **Settings integration**: Add fourth tab to existing `app/settings/page.tsx` tabs system
- **Component structure**: Following existing settings pattern with Card/CardHeader/CardContent layout
- **State management**: React hooks pattern consistent with `useCurrencySettings()` and existing dashboard hooks

#### Dashboard Integration Strategy

- **File modifications**: `components/dashboard/budget-overview.tsx` and `components/dashboard/investment-overview.tsx`
- **Data aggregation**: Unified queries returning both personal and family budget/investment progress
- **Member contribution display**: Expandable sections showing individual member percentages
- **Visual indicators**: Subtle badges (Joint/Shared) using existing design system colors
- **Responsive design**: Member contributions collapse on mobile, expand on desktop

#### Detailed Family Invitation UI Requirements

##### Family Invitation Management Interface

- **Location**: `app/settings/components/family-management.tsx`
- **Design**: Table-based layout showing pending invitations with actions
- **Columns**: Email, Role, Invited Date, Expires, Status, Actions
- **Actions**: Resend invitation, Cancel invitation, Copy invitation link
- **State management**: Loading states for each action, optimistic updates
- **Error handling**: Toast notifications for failed operations

##### Invitation Email Content (Future API Integration)

- **Email template**: Professional email with Noka branding
- **Content**: Family name, inviter name, role being offered, expiration date
- **CTA button**: "Accept Invitation" linking to acceptance page
- **Security**: Unique token in URL, expiration validation

##### Invitation Acceptance Flow

- **Page**: `app/invitations/[token]/page.tsx` - dedicated invitation acceptance page
- **User states**:
  - Existing user: Show family details, Accept/Decline buttons
  - New user: Redirect to signup with auto-join after registration
- **Validation**: Token validity, expiration check, duplicate membership check
- **Success flow**: Accept → Auto-login (if needed) → Redirect to dashboard with success message
- **Error handling**: Invalid/expired token, already member, family full errors

##### Invitation Status Indicators

- **Pending invitations**: Yellow/orange indicator with clock icon
- **Accepted invitations**: Green checkmark with user icon
- **Expired invitations**: Red X with expired badge
- **Declined invitations**: Gray dash with declined badge (optional display)

##### Family Member Management UI

- **Member list**: email, role, joined date
- **Role indicators**: Admin badge (shield icon), Member (user icon)
- **Actions**: Change role (admin only), Remove member (admin only), View activity
- **Confirmation dialogs**: Destructive actions require confirmation
- **Permissions**: UI elements hidden/disabled based on user role

##### Mobile Responsive Design

- **Invitation table**: Converts to card layout on mobile
- **Action buttons**: Collapsible menu on mobile with icons
- **Invitation acceptance**: Mobile-optimized form with large touch targets
- **Member management**: Swipe actions for mobile member management

#### Transaction Attribution Display

- **File modification**: `components/transactions/transaction-card.tsx`
- **Attribution indicator**: Small text showing "Logged by [email]" for family transactions only
- **Icon usage**: Existing Lucide icons for consistency with current design patterns
- **Conditional display**: Attribution only shown for transactions where `logged_by_user_id !== user_id`

### Phase 3: Performance & Polish

#### Multiple Family Support (Built into Phase 1 Database Design)

- **Database design**: Users can have multiple `family_members` records with different families from day one
- **No UI context switching**: Dashboard shows aggregated data from all user's families without requiring family selection
- **Data aggregation**: Dashboard displaying unified view of all families user belongs to
- **Performance optimization**: Efficient queries avoiding N+1 problems with proper JOIN strategies and security definer functions

#### Performance Optimizations

- **Database indexes**: Strategic B-tree indexes on frequently queried columns
- **Query optimization**: Replace multiple API calls with single aggregated endpoints
- **Response caching**: Client-side caching using existing hooks pattern with React Query or SWR
- **Bundle optimization**: Code splitting for family features to avoid impacting non-family users

#### Enhanced Analytics

- **Member contribution calculations**: SQL functions calculating percentage breakdowns
- **Real-time updates**: Supabase real-time subscriptions for family transaction updates
- **Progressive loading**: Skeleton states for member contribution sections
- **Error boundaries**: React error boundaries preventing family feature crashes from affecting core functionality

## UI/UX Specifications

### Component Integration Strategy

- **Design system consistency**: Use existing shadcn/ui components (Badge, Select, RadioGroup, Card)
- **Color scheme**: Joint accounts use blue theme, Shared categories use green theme
- **Icon library**: Existing Lucide React icons with family-specific additions (Users, UserPlus, Shield)
- **Typography**: Consistent with existing text sizing and weight patterns

### Responsive Design Requirements

- **Mobile-first approach**: Family features fully functional on mobile with appropriate information density
- **Touch targets**: Minimum 44px touch targets for family action buttons
- **Content hierarchy**: Clear visual separation between personal and family resources
- **Progressive disclosure**: Member contributions hidden by default on mobile, expandable on tap

### Accessibility Requirements

- **ARIA labels**: Proper labeling for family context indicators and member contribution sections
- **Keyboard navigation**: All family management interfaces accessible via keyboard
- **Screen reader support**: Meaningful descriptions for joint/shared resource indicators
- **Focus management**: Proper focus handling in family invitation modals and forms

## Integration Points

### Existing System Compatibility

- **Authentication**: Leverages existing `auth-context.tsx` and Supabase Auth integration
- **Currency handling**: Family budgets use existing `formatCurrency()` and currency settings
- **Form patterns**: Consistent with existing `FormComponentProps<T>` interfaces and validation
- **API patterns**: Follows established REST conventions and response formatting

### Database Trigger Integration

- **Balance calculation**: Existing account balance triggers work seamlessly with joint accounts
- **Budget progress**: Existing category progress calculations include family transactions
- **Audit trails**: Transaction logging maintains existing patterns with added attribution

### Security Integration

- **CSRF protection**: Family endpoints use existing CSRF middleware
- **Input sanitization**: Family data processed through existing sanitization pipeline
- **Rate limiting**: Family APIs subject to existing rate limiting rules
- **Session management**: Leverages existing session handling without modification
