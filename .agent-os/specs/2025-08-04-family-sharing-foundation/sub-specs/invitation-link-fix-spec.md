# Invitation Link Fix Specification

> Sub-spec for Task 2.5: Fix invitation link system with proper authentication flow handling and token validation
> Created: 2025-08-06
> Parent Spec: Family Sharing Foundation

## Problem Statement

The current family invitation link system has critical issues that prevent proper invitation acceptance:

### Current Issues
1. **Token Validation Flaw**: The invitation page (`/invitations/[token]`) requires user authentication and searches for invitations in the user's personal invitation list, but invitation tokens should be validated directly from the database regardless of authentication status.

2. **Missing Redirect Handling**: Login and register forms don't properly handle redirect parameters, breaking the invitation flow when users need to authenticate first.

3. **Incorrect Post-Registration Flow**: New users who register through an invitation link are redirected to the standard onboarding flow instead of being taken to the invitation page after email verification.

### Current Broken Flow
```
User clicks invitation link → "Invitation not found or has expired" (because user isn't logged in)
OR
User logs in first → Clicks invitation link → Still "not found" (token validation requires wrong context)
```

## User Experience Requirements

### Scenario 1: Logged In User
**Flow**: `Invitation Link → Validate Token → Show Invitation → Accept/Decline → Dashboard`

1. User clicks invitation link while logged in
2. System validates token directly from database (no auth required for validation)
3. Shows invitation details with family name and role
4. User accepts/declines
5. Redirects to dashboard with success message

### Scenario 2: Not Logged In (Existing User)
**Flow**: `Invitation Link → Login Redirect → Authenticate → Return to Invitation → Accept/Decline → Dashboard`

1. User clicks invitation link while not logged in
2. System detects no authentication, redirects to login with `?redirect=/invitations/[token]`
3. User logs in successfully
4. System redirects to invitation page
5. Shows invitation details and allows acceptance/decline
6. Redirects to dashboard with success message

### Scenario 3: New User Registration
**Flow**: `Invitation Link → Register Redirect → Verify Email → Return to Invitation → Accept → Onboarding`

1. User clicks invitation link (new user)
2. System redirects to register with `?redirect=/invitations/[token]`
3. User registers with email/password
4. System sends verification email with callback containing invitation redirect
5. User verifies email via email link
6. Auth callback processes verification and redirects to invitation page
7. Shows invitation details and allows acceptance
8. **Important**: After acceptance, new users go to onboarding (not dashboard)
9. Complete onboarding to join the family and start using the app

## Technical Requirements

### 1. Public Invitation Validation API (Task 2.5.1)
**Endpoint**: `GET /api/invitations/[token]/validate`

**Purpose**: Validate invitation tokens without requiring authentication

```typescript
interface InvitationValidationResponse {
  valid: boolean;
  invitation?: {
    id: string;
    token: string;
    email: string;
    role: 'admin' | 'member';
    status: 'pending' | 'accepted' | 'declined';
    expires_at: string;
    created_at: string;
    family: {
      id: string;
      name: string;
    };
  };
  error?: 'not_found' | 'expired' | 'already_processed';
  message?: string;
}
```

**Implementation**:
- No authentication required (public endpoint)
- Direct database query using token
- Return invitation details if valid and pending
- Return appropriate error states for expired/processed invitations
- Include family name for display

### 2. Updated Invitation Page Logic (Task 2.5.2)
**File**: `app/invitations/[token]/page.tsx`

**Changes Required**:
- Replace authentication-dependent logic
- Call new validation API endpoint first
- Handle authentication state separately from token validation
- Implement proper error states and loading states

**New Logic Flow**:
```typescript
useEffect(() => {
  // 1. Validate token (no auth required)
  const validateToken = async () => {
    const response = await fetch(`/api/invitations/${token}/validate`);
    const data = await response.json();
    
    if (!data.valid) {
      setError(data.message);
      return;
    }
    
    setInvitation(data.invitation);
    
    // 2. Check authentication separately
    const authResponse = await fetch('/api/auth/user');
    if (!authResponse.ok) {
      // Not authenticated, redirect to login
      router.push(`/auth/login?redirect=/invitations/${token}`);
      return;
    }
    
    // 3. User is authenticated and token is valid, show invitation
    setShowInvitation(true);
  };
  
  validateToken();
}, [token]);
```

### 3. Enhanced Auth Forms with Redirect Handling (Task 2.5.3)

#### Login Form Updates
**File**: `app/auth/login/login-form.tsx`

**Changes**:
```typescript
// Add URL parameter handling
const searchParams = useSearchParams();
const redirectUrl = searchParams.get('redirect');

// Update success redirect logic
async function onSubmit(values: LoginValues) {
  // ... existing login logic
  if (!error) {
    toast.success("Logged in successfully!");
    // Use redirect parameter or default to dashboard
    const targetUrl = redirectUrl || "/dashboard";
    router.replace(targetUrl);
  }
}
```

#### Register Form Updates
**File**: `app/auth/register/register-form.tsx`

**Changes**:
```typescript
// Add URL parameter handling
const searchParams = useSearchParams();
const redirectUrl = searchParams.get('redirect');

// Update email redirect URL
async function onSubmit(values: RegisterValues) {
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      // Include next parameter for post-verification redirect
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback${redirectUrl ? `?next=${encodeURIComponent(redirectUrl)}` : ''}`,
    },
  })
  // ... rest of logic
}
```

### 4. Auth Callback Enhancements (Task 2.5.4)
**File**: `app/auth/callback/route.ts`

**Current Implementation**: Already handles `next` parameter correctly
**Verification Required**: Ensure invitation redirects work properly after email verification

**Expected Flow**:
```
Email verification link → /auth/callback?code=xxx&next=/invitations/token
→ Process verification → Redirect to /invitations/token
```

### 5. Middleware Updates (Task 2.5.5)
**File**: `middleware.ts`

**Changes Required**:
- Allow public access to invitation validation endpoints
- Ensure invitation pages can be accessed without authentication for token validation

**Implementation**:
```typescript
// Add to excluded paths for authentication requirement
if (
  !pathname.startsWith('/auth') &&
  !pathname.startsWith('/_next') &&
  !pathname.startsWith('/api') &&
  !pathname.startsWith('/invitations') && // Allow invitation pages
  pathname !== '/' &&
  // ... other public paths
) {
  // Redirect to login
}
```

### 6. Post-Invitation Acceptance Flow (Task 2.5.6)

#### Update Acceptance API
**Files**: 
- `app/api/invitations/[token]/accept/route.ts`
- `app/api/invitations/[token]/decline/route.ts`

**Changes for Accept Endpoint**:
```typescript
// After successful invitation acceptance
const { data: userSettings } = await supabase
  .from('user_settings')
  .select('onboarding_completed')
  .eq('user_id', user.id)
  .single();

// Determine redirect based on onboarding status
const redirectUrl = userSettings?.onboarding_completed ? '/dashboard' : '/onboarding';

return createSuccessResponse({
  ...acceptanceData,
  redirect_url: redirectUrl
}, 'Invitation accepted successfully');
```

#### Update Invitation Page Response Handling
**File**: `app/invitations/[token]/page.tsx`

```typescript
const handleAccept = async () => {
  // ... existing logic
  
  if (response.ok) {
    const data = await response.json();
    toast.success(`Successfully joined ${invitation.family.name}!`);
    
    // Use redirect_url from response
    const redirectUrl = data.data.redirect_url || '/dashboard';
    setTimeout(() => {
      router.push(redirectUrl);
    }, 2000);
  }
};
```

## Security Considerations

### Public Token Validation
- **Risk**: Public API endpoint could be used to enumerate invitation tokens
- **Mitigation**: Rate limiting on validation endpoint, no sensitive data in error responses
- **Monitoring**: Log validation attempts for suspicious patterns

### Invitation Token Security
- **Current**: UUIDs provide sufficient entropy
- **Additional**: Consider short expiration times (current: 7 days)
- **Access Control**: Validation only returns data for valid, pending invitations

### Redirect Parameter Validation
- **Risk**: Open redirect vulnerabilities
- **Mitigation**: Validate redirect parameters against allowed paths
- **Implementation**: Only allow internal paths starting with `/`

```typescript
// Validate redirect parameter
const isValidRedirect = (url: string): boolean => {
  return url.startsWith('/') && !url.startsWith('//');
};
```

## Error Handling

### Token Validation Errors
- **Invalid Token**: "Invitation not found or invalid"
- **Expired Token**: "This invitation has expired"
- **Already Processed**: "This invitation has already been accepted/declined"
- **Network Error**: "Unable to validate invitation. Please try again."

### Authentication Flow Errors
- **Login Failed**: Standard login error messages
- **Registration Failed**: Standard registration error messages
- **Email Verification Required**: "Please check your email and verify your account"

### Edge Cases
- **User Already in Family**: "You are already a member of this family"
- **Email Mismatch**: "This invitation was sent to a different email address"
- **Family Deleted**: "This family no longer exists"

## Testing Requirements (Task 2.5.7)

### Manual Testing Scenarios

#### Scenario 1: Logged In User
1. Create invitation while logged in as family admin
2. Copy invitation link
3. Open in new browser tab (same user)
4. Verify invitation displays correctly
5. Test accept/decline functionality
6. Verify redirect to dashboard

#### Scenario 2: Not Logged In User
1. Copy invitation link from previous test
2. Open in private/incognito browser
3. Verify redirect to login page with correct redirect parameter
4. Login with valid credentials
5. Verify automatic redirect back to invitation page
6. Test accept/decline functionality

#### Scenario 3: New User Registration
1. Create new invitation
2. Copy invitation link
3. Open in private browser
4. Click "Sign Up" from login page
5. Register with new email address
6. Check email and click verification link
7. Verify redirect to invitation page after verification
8. Accept invitation
9. Verify redirect to onboarding (not dashboard)
10. Complete onboarding and verify family membership

#### Error State Testing
1. **Expired Invitation**: Test with manually expired invitation
2. **Invalid Token**: Test with malformed token
3. **Already Processed**: Test accepting same invitation twice
4. **Network Issues**: Test with network disconnected
5. **Email Mismatch**: Test invitation with different email address

### Automated Testing Considerations
- API endpoint tests for validation logic
- Component tests for invitation page states
- Integration tests for auth flow
- End-to-end tests for complete invitation flows

## Implementation Priority

### Phase 1: Core Functionality
1. Create public validation API (2.5.1)
2. Update invitation page logic (2.5.2)
3. Basic redirect handling in auth forms (2.5.3)

### Phase 2: Enhanced Flows
4. Auth callback verification (2.5.4)
5. Middleware updates (2.5.5)
6. Post-acceptance flow improvements (2.5.6)

### Phase 3: Validation & Polish
7. Comprehensive manual testing (2.5.7)
8. Error handling improvements
9. Security validation
10. Performance optimization

## Success Criteria

✅ **All three user scenarios work flawlessly**:
- Logged in users can accept invitations immediately
- Not logged in users are guided through login and back to invitation
- New users can register, verify email, and accept invitations before onboarding

✅ **Proper error handling**:
- Clear error messages for all failure states
- Graceful handling of expired/invalid tokens
- Network error recovery

✅ **Security maintained**:
- No sensitive information exposed in public endpoints
- Proper redirect validation
- Rate limiting on validation endpoint

✅ **User experience optimized**:
- Minimal steps required for invitation acceptance
- Clear progress indication throughout flows
- Appropriate success/error feedback