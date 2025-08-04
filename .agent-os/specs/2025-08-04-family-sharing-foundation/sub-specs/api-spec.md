# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-04-family-sharing-foundation/spec.md

## Family Management API

Following the established patterns from `app/api/accounts/route.ts` with consistent error handling, response formatting, and authentication middleware.

### POST /api/families

**Purpose**: Create a new family  
**Authentication**: Required via `requireAuth()` middleware  
**Request Body**:
```typescript
{
  name: string; // Required, 3-50 characters
}
```

**Implementation**: `app/api/families/route.ts`
```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const familyData = await validateRequestBody(request, createFamilySchema)
    const supabase = await createClient()

    const newFamily: FamilyInsert = {
      name: familyData.name,
      created_by: user.id,
    }

    const { data: family, error } = await supabase
      .from('families')
      .insert(newFamily)
      .select(`
        *,
        family_members!inner(
          id,
          role,
          joined_at,
          user_id
        )
      `)
      .single()

    if (error) throw error

    return createCreatedResponse(
      {
        ...family,
        member_count: family.family_members.length,
        user_role: 'admin'
      },
      'Family created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

**Response**:
```typescript
{
  data: {
    id: string,
    name: string,
    created_by: string,
    created_at: string,
    updated_at: string,
    member_count: number,
    user_role: "admin"
  },
  error: null,
  message: "Family created successfully"
}
```

### GET /api/families

**Purpose**: Get user's families  
**Authentication**: Required via `requireAuth()` middleware  
**Query Parameters**: None  

**Implementation**:
```typescript
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: families, error } = await supabase
      .from('family_members')
      .select(`
        role,
        joined_at,
        family:families!inner(
          id,
          name,
          created_by
        )
      `)
      .eq('user_id', user.id)

    if (error) throw error

    const formattedFamilies = families.map(fm => ({
      id: fm.family.id,
      name: fm.family.name,
      user_role: fm.role,
      joined_at: fm.joined_at,
      member_count: 0 // TODO: Add aggregate count
    }))

    return createSuccessResponse(
      formattedFamilies,
      `Retrieved ${formattedFamilies.length} families successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

### PUT /api/families/[id]

**Purpose**: Update family (admins only)  
**Authentication**: Required + Admin role verification  
**File**: `app/api/families/[id]/route.ts`

**Implementation**:
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const familyId = params.id
    await requireFamilyAdmin(user.id, familyId)
    
    const updateData = await validateRequestBody(request, updateFamilySchema)
    const supabase = await createClient()

    const { data: updatedFamily, error } = await supabase
      .from('families')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', familyId)
      .select()
      .single()

    if (error) throw error

    return createUpdatedResponse(
      updatedFamily,
      'Family updated successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

### DELETE /api/families/[id]

**Purpose**: Delete family (creator only)  
**Authentication**: Required + Creator verification  

**Implementation**:
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const familyId = params.id
    const supabase = await createClient()

    // Verify user is the family creator
    const { data: family, error: fetchError } = await supabase
      .from('families')
      .select('name, created_by')
      .eq('id', familyId)
      .single()

    if (fetchError || !family || family.created_by !== user.id) {
      throw new Error('Family not found or access denied')
    }

    const { error } = await supabase
      .from('families')
      .delete()
      .eq('id', familyId)
      .eq('created_by', user.id)

    if (error) throw error

    return createDeletedResponse(
      `Family "${family.name}" deleted successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Family Members API

### GET /api/families/[id]/members

**Purpose**: Get family members  
**Authentication**: Required + Family membership  
**File**: `app/api/families/[id]/members/route.ts`

**Implementation**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const familyId = params.id
    await verifyFamilyAccess(user.id, familyId) // Must be family member
    
    const supabase = await createClient()

    const { data: members, error } = await supabase
      .from('family_members')
      .select(`
        id,
        role,
        joined_at,
        user:auth.users!inner(
          id,
          email
        )
      `)
      .eq('family_id', familyId)
      .order('joined_at', { ascending: true })

    if (error) throw error

    const formattedMembers = members.map(member => ({
      id: member.id,
      user_id: member.user.id,
      email: member.user.email,
      role: member.role,
      joined_at: member.joined_at
    }))

    return createSuccessResponse(
      formattedMembers,
      `Retrieved ${formattedMembers.length} family members successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

### POST /api/families/[id]/members/invite

**Purpose**: Invite new member (admins only)  
**Authentication**: Required + Admin role  
**File**: `app/api/families/[id]/members/invite/route.ts`

**Implementation**:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const familyId = params.id
    await requireFamilyAdmin(user.id, familyId)
    
    const inviteData = await validateRequestBody(request, inviteMemberSchema)
    const supabase = await createClient()

    // Generate secure invitation token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const newInvitation = {
      family_id: familyId,
      email: inviteData.email,
      role: inviteData.role || 'member',
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    }

    const { data: invitation, error } = await supabase
      .from('family_invitations')
      .insert(newInvitation)
      .select()
      .single()

    if (error) throw error

    // TODO: Send invitation email
    await sendInvitationEmail(invitation)

    return createCreatedResponse(
      invitation,
      'Family invitation sent successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

### DELETE /api/families/[id]/members/[userId]

**Purpose**: Remove member (admins only)  
**Authentication**: Required + Admin role  
**File**: `app/api/families/[id]/members/[userId]/route.ts`

## Invitations API

### GET /api/invitations

**Purpose**: Get user's pending invitations  
**Authentication**: Required  
**File**: `app/api/invitations/route.ts`

**Implementation**:
```typescript
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: invitations, error } = await supabase
      .from('family_invitations')
      .select(`
        id,
        token,
        role,
        status,
        expires_at,
        created_at,
        family:families!inner(
          id,
          name
        ),
        inviter:auth.users!family_invitations_invited_by_fkey(
          email
        )
      `)
      .eq('email', user.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return createSuccessResponse(
      invitations,
      `Retrieved ${invitations.length} pending invitations successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

### PUT /api/invitations/[token]/accept

**Purpose**: Accept family invitation  
**Authentication**: Required  
**File**: `app/api/invitations/[token]/accept/route.ts`

**Implementation**:
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await requireAuth()
    const token = params.token
    const supabase = await createClient()

    // Start transaction
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('token', token)
      .eq('email', user.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (invitationError || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    // Check if user is already a family member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', invitation.family_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      throw new Error('You are already a member of this family')
    }

    // Add user as family member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: invitation.family_id,
        user_id: user.id,
        role: invitation.role,
      })

    if (memberError) throw memberError

    // Update invitation status
    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (updateError) throw updateError

    return createSuccessResponse(
      { family_id: invitation.family_id },
      'Family invitation accepted successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Enhanced Existing APIs

### Enhanced Accounts API

**File Modifications**: `app/api/accounts/route.ts`

#### GET /api/accounts Enhancement

**Changes**: Return both personal and accessible joint accounts

```typescript
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select(`
        *,
        family:families(
          id,
          name
        )
      `)
      .or(`user_id.eq.${user.id},family_id.in.(${await getUserFamilyIds(user.id)})`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Add family context and user role
    const enhancedAccounts = await Promise.all(
      accounts.map(async (account) => ({
        ...account,
        family_name: account.family?.name || null,
        user_role: account.family_id 
          ? await getUserRoleInFamily(user.id, account.family_id)
          : null
      }))
    )

    return createSuccessResponse(
      enhancedAccounts,
      `Retrieved ${enhancedAccounts.length} accounts successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

#### POST /api/accounts Enhancement

**Changes**: Support joint account creation

```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const accountData = await validateRequestBody(request, createAccountSchemaEnhanced)
    const supabase = await createClient()

    // Validate joint account creation
    if (accountData.account_scope === 'joint') {
      if (!accountData.family_id) {
        throw new Error('family_id is required for joint accounts')
      }
      await requireFamilyAdmin(user.id, accountData.family_id)
    }

    const newAccount = {
      ...accountData,
      user_id: accountData.account_scope === 'personal' ? user.id : null,
      family_id: accountData.account_scope === 'joint' ? accountData.family_id : null,
      current_balance: accountData.initial_balance,
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert(newAccount)
      .select(`
        *,
        family:families(name)
      `)
      .single()

    if (error) throw error

    return createCreatedResponse(
      {
        ...account,
        family_name: account.family?.name || null,
        user_role: account.family_id ? 'admin' : null
      },
      'Account created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Enhanced Categories API

**File Modifications**: `app/api/categories/route.ts`

Following similar patterns as accounts with shared category support and family context.

### Enhanced Transactions API

**File Modifications**: `app/api/transactions/route.ts`

#### GET /api/transactions Enhancement

**Changes**: Include attribution and family context

```typescript
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const supabase = await createClient()

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        logged_by_user:auth.users!transactions_logged_by_user_id_fkey(
          email
        ),
        account:accounts(
          id,
          name,
          type,
          account_scope,
          family:families(name)
        ),
        category:categories(
          id,
          name,
          type,
          icon,
          is_shared,
          family:families(name)
        )
      `)
      .or(`account.user_id.eq.${user.id},account.family_id.in.(${await getUserFamilyIds(user.id)})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return createSuccessResponse(
      { transactions },
      `Retrieved ${transactions.length} transactions successfully`
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

#### POST /api/transactions Enhancement

**Changes**: Auto-set logged_by_user_id

```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const transactionData = await validateRequestBody(request, createTransactionSchema)
    const supabase = await createClient()

    // Automatically set the logged_by_user_id
    const newTransaction = {
      ...transactionData,
      logged_by_user_id: user.id, // Always set to current user
    }

    // Verify access to account and category
    await verifyAccountAccess(user.id, transactionData.account_id)
    if (transactionData.category_id) {
      await verifyCategoryAccess(user.id, transactionData.category_id)
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert(newTransaction)
      .select(`
        *,
        logged_by_user:auth.users!transactions_logged_by_user_id_fkey(email),
        account:accounts(*),
        category:categories(*)
      `)
      .single()

    if (error) throw error

    return createCreatedResponse(
      transaction,
      'Transaction created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Utility Functions

### Family Permission Middleware

**File**: `app/api/utils/family-auth.ts`

```typescript
import { createClient } from '@/lib/supabase/server'

export async function verifyFamilyAccess(
  userId: string,
  familyId: string,
): Promise<{ isMember: boolean; isAdmin: boolean; role: 'admin' | 'member' | null }> {
  const supabase = await createClient()
  
  const { data: membership, error } = await supabase
    .from('family_members')
    .select('role')
    .eq('user_id', userId)
    .eq('family_id', familyId)
    .single()

  if (error || !membership) {
    return { isMember: false, isAdmin: false, role: null }
  }

  return {
    isMember: true,
    isAdmin: membership.role === 'admin',
    role: membership.role
  }
}

export async function requireFamilyAdmin(userId: string, familyId: string): Promise<void> {
  const { isAdmin } = await verifyFamilyAccess(userId, familyId)
  
  if (!isAdmin) {
    throw new Error('Admin access required for this family')
  }
}

export async function getUserFamilyIds(userId: string): Promise<string[]> {
  const supabase = await createClient()
  
  const { data: memberships, error } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)

  if (error) return []
  
  return memberships.map(m => m.family_id)
}
```

### Enhanced Validation Schemas

**File**: `app/api/utils/validation.ts` (additions)

```typescript
export const createFamilySchema = z.object({
  name: z.string()
    .min(3, 'Family name must be at least 3 characters')
    .max(50, 'Family name must be less than 50 characters')
    .trim()
})

export const updateFamilySchema = z.object({
  name: z.string()
    .min(3, 'Family name must be at least 3 characters')
    .max(50, 'Family name must be less than 50 characters')
    .trim()
    .optional()
})

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member']).default('member')
})

export const createAccountSchemaEnhanced = createAccountSchema.extend({
  account_scope: z.enum(['personal', 'joint']).default('personal'),
  family_id: z.string().uuid().optional()
}).refine(
  (data) => {
    if (data.account_scope === 'joint') {
      return !!data.family_id
    }
    return true
  },
  {
    message: 'family_id is required for joint accounts',
    path: ['family_id']
  }
)
```

## Error Handling Standards

All family APIs use the existing error handling patterns:
- `handleApiError()` for consistent error responses
- HTTP status codes following REST conventions
- Descriptive error messages for client debugging
- Security-conscious error messages avoiding data leakage

## Response Format Consistency

All APIs follow the established `ApiResponse<T>` format:
```typescript
{
  data: T | null,
  error: string | object | null,
  message: string
}
```

## Authentication & Authorization

- All endpoints require authentication via `requireAuth()` 
- Family-specific endpoints use additional `verifyFamilyAccess()` or `requireFamilyAdmin()`
- RLS policies provide database-level security as final safeguard
- Resource access verification before allowing operations