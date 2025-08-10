# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-08-onboarding-improvements/spec.md

> Created: 2025-08-08
> Version: 1.0.0

## Technical Requirements

### 1. Invitation Context Detection and Step Skipping
- Modify `/app/onboarding/page.tsx` to detect invitation context from URL parameters or sessionStorage
- Check for `acceptedFamilyId` in sessionStorage to determine if user came from invitation
- Skip step 1 (preference selection) by adjusting step calculation logic when invitation context is detected
- Auto-set `onboardingType` to "family" for users coming from invitations

### 2. Family Member Invitation Integration
- Enhance `/app/onboarding/steps/family-setup.tsx` to include member invitation capability
- Add invitation form section after successful family creation
- Integrate with existing invitation API endpoints from family management
- Allow sending multiple invitations with email validation and role selection
- Show invitation status feedback (sent, failed, pending)

### 3. Auto-Scoping for Joint Resources
- Modify `/app/onboarding/steps/account-setup.tsx` to use created family ID when "Joint" is selected
- Update `/app/onboarding/steps/category-setup.tsx` to use created family ID when "Shared" is selected
- Remove family dropdown selection components for joint/shared resources during onboarding
- Retrieve `onboardingFamilyId` from sessionStorage for automatic family assignment

### 4. Inline Editing for Accounts and Categories
- Add edit mode state management to account and category list items
- Implement inline form components within list item containers
- Add click handlers to existing account/category list items for edit mode activation
- Include save/cancel actions for inline editing with validation
- Maintain existing form validation patterns for inline editing

### 5. UI/UX Consistency Preservation
- Maintain existing shadcn/ui component usage and styling patterns
- Preserve current responsive design and mobile layouts
- Keep existing loading states and error handling approaches
- Follow established form validation and feedback patterns

## Implementation Approach

### Session Storage Management
```typescript
// Keys used for onboarding context
const ONBOARDING_TYPE_KEY = "onboardingType";
const ONBOARDING_FAMILY_ID_KEY = "onboardingFamilyId";
const ACCEPTED_FAMILY_ID_KEY = "acceptedFamilyId";
```

### Step Calculation Logic
```typescript
// Modified step calculation in page.tsx
const totalSteps = useMemo(() => {
  const hasAcceptedFamily = sessionStorage.getItem(ACCEPTED_FAMILY_ID_KEY);
  if (hasAcceptedFamily) {
    return 4; // Skip preference step, show family confirmation + settings + accounts + categories
  }
  return onboardingType === 'family' ? 5 : 4;
}, [onboardingType]);
```

### Inline Editing State Pattern
```typescript
// State management for list items
const [editingId, setEditingId] = useState<string | null>(null);
const [editingData, setEditingData] = useState<AccountData | null>(null);

const handleEditClick = (item: AccountData) => {
  setEditingId(item.id);
  setEditingData(item);
};
```

### Auto-Scoping Implementation
```typescript
// Remove dropdown when family context exists
const familyId = sessionStorage.getItem(ONBOARDING_FAMILY_ID_KEY);
const shouldShowFamilyDropdown = !familyId && selectedScope === 'joint';
```

## Modified Files

### Core Onboarding Files
- `/app/onboarding/page.tsx` - Step calculation and invitation detection
- `/app/onboarding/steps/family-setup.tsx` - Add member invitation section
- `/app/onboarding/steps/account-setup.tsx` - Auto-scoping and inline editing
- `/app/onboarding/steps/category-setup.tsx` - Auto-scoping and inline editing

### API Integration Points
- Existing `/api/families/route.ts` - For member invitations during onboarding
- Existing `/api/accounts/route.ts` - For account updates via inline editing
- Existing `/api/categories/route.ts` - For category updates via inline editing
- Existing `/api/onboarding/route.ts` - Progress tracking (no changes needed)

## Component Patterns

### Inline Editing Component Structure
```typescript
// Conditional rendering pattern for list items
{editingId === item.id ? (
  <InlineEditForm 
    data={editingData}
    onSave={handleSave}
    onCancel={() => setEditingId(null)}
  />
) : (
  <ListItemDisplay 
    item={item}
    onClick={() => handleEditClick(item)}
  />
)}
```

### Member Invitation Form Integration
```typescript
// Addition to family-setup.tsx after family creation
{familyCreated && (
  <div className="mt-6 space-y-4">
    <h3>Invite Family Members (Optional)</h3>
    <InvitationForm familyId={createdFamilyId} />
  </div>
)}
```

## Data Flow Changes

### Invitation Context Flow
1. User accepts invitation → `acceptedFamilyId` stored in sessionStorage
2. Redirect to onboarding → Step 1 skipped automatically
3. Family setup → Show confirmation instead of creation form
4. Account/category setup → Auto-assign to accepted family for joint/shared resources

### Inline Editing Flow
1. User clicks existing item → Enter edit mode with populated data
2. User modifies fields → Real-time validation
3. User saves → API call with optimistic updates
4. User cancels → Revert to display mode

## Performance Considerations

- Use React's `useMemo` for step calculations to prevent unnecessary re-renders
- Implement optimistic updates for inline editing to improve perceived performance
- Debounce API calls for invitation validation to reduce server load
- Use existing loading states and error boundaries for consistency

## Testing Requirements

- Unit tests for step calculation logic with invitation context
- Integration tests for inline editing form validation
- E2E tests for complete invitation-to-onboarding flow
- Responsive design testing for inline editing on mobile devices
- Error handling tests for failed API calls during editing