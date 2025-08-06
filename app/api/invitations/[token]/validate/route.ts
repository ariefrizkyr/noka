import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError } from '../../../utils/error-handler'
import { 
  createSuccessResponse 
} from '../../../utils/response'

interface InvitationValidationData {
  id: string
  token: string
  email: string
  role: 'admin' | 'member'
  status: 'pending' | 'accepted' | 'declined'
  expires_at: string
  created_at: string
  family: {
    id: string
    name: string
  }
}

interface ValidationErrorResponse {
  valid: false
  error: 'not_found' | 'expired' | 'already_processed'
  message: string
}

interface ValidationSuccessResponse {
  valid: true
  invitation: InvitationValidationData
}

/**
 * GET /api/invitations/[token]/validate
 * Validate invitation token without requiring authentication
 * This endpoint is public to allow token validation before user login/registration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params
    const token = resolvedParams.token
    const supabase = await createClient()

    // Touch the updated_at timestamp to trigger expiry checking via database trigger
    // Only update if invitation is still pending to avoid unnecessary writes
    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({ updated_at: new Date().toISOString() })
      .eq('token', token)
      .eq('status', 'pending')
    
    // Log any update errors for debugging
    if (updateError) {
      console.error('Failed to update invitation timestamp:', updateError)
    }

    // Query invitation after touching timestamp - trigger will have updated expiry if needed
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select(`
        id,
        token,
        email,
        role,
        status,
        expires_at,
        created_at,
        family_id
      `)
      .eq('token', token)
      .single()

    // Token not found
    if (invitationError || !invitation) {
      const errorResponse: ValidationErrorResponse = {
        valid: false,
        error: 'not_found',
        message: 'Invitation not found or invalid'
      }
      return createSuccessResponse(errorResponse, 'Token validation completed')
    }

    // Check invitation status (database trigger automatically updates expired invitations)
    if (invitation.status === 'expired') {
      const errorResponse: ValidationErrorResponse = {
        valid: false,
        error: 'expired',
        message: 'This invitation has expired'
      }
      return createSuccessResponse(errorResponse, 'Token validation completed')
    }

    // Check if invitation has already been processed
    if (invitation.status !== 'pending') {
      const statusText = invitation.status === 'accepted' ? 'accepted' : 'declined'
      const errorResponse: ValidationErrorResponse = {
        valid: false,
        error: 'already_processed',
        message: `This invitation has already been ${statusText}`
      }
      return createSuccessResponse(errorResponse, 'Token validation completed')
    }

    // Get family details separately to avoid RLS issues
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id, name')
      .eq('id', invitation.family_id)
      .single()

    if (familyError || !family) {
      const errorResponse: ValidationErrorResponse = {
        valid: false,
        error: 'not_found',
        message: 'Associated family not found'
      }
      return createSuccessResponse(errorResponse, 'Token validation completed')
    }

    // Valid invitation - return details
    const validationData: InvitationValidationData = {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
      family: {
        id: family.id,
        name: family.name
      }
    }

    const successResponse: ValidationSuccessResponse = {
      valid: true,
      invitation: validationData
    }

    return createSuccessResponse(successResponse, 'Valid invitation found')
  } catch (error) {
    return handleApiError(error)
  }
}