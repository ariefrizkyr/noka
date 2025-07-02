import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  error: string | null
}

/**
 * Get authenticated user from request
 * Returns user if authenticated, null if not
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: 'Authentication failed' }
    }

    if (!user) {
      return { user: null, error: 'User not authenticated' }
    }

    return { user, error: null }
  } catch {
    return { user: null, error: 'Authentication service unavailable' }
  }
}

/**
 * Middleware function to ensure user is authenticated
 * Returns user if authenticated, throws error if not
 */
export async function requireAuth(): Promise<User> {
  const { user, error } = await getAuthenticatedUser()
  
  if (!user || error) {
    throw new Error(error || 'Authentication required')
  }
  
  return user
} 