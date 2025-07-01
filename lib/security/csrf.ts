import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_SECRET_NAME = 'csrf-secret'
const TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure CSRF token using Web Crypto API
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a CSRF secret for token validation using Web Crypto API
 */
export function generateCSRFSecret(): string {
  const array = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create a CSRF token hash from secret and token using Web Crypto API
 */
export async function createTokenHash(secret: string, token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${secret}:${token}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  return Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Set CSRF token and secret in cookies (server-side)
 */
export async function setCSRFTokens(): Promise<{ token: string; secret: string }> {
  const token = generateCSRFToken()
  const secret = generateCSRFSecret()
  
  const cookieStore = await cookies()
  
  // Set token cookie (accessible to client for forms)
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: false, // Client needs access for forms
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })
  
  // Set secret cookie (HTTP-only for validation)
  cookieStore.set(CSRF_SECRET_NAME, secret, {
    httpOnly: true, // Server-only access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })
  
  return { token, secret }
}

/**
 * Get CSRF token from cookies (server-side)
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
}

/**
 * Get CSRF secret from cookies (server-side)
 */
export async function getCSRFSecret(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_SECRET_NAME)?.value || null
}

/**
 * Validate CSRF token against secret
 */
export async function validateCSRFToken(submittedToken: string): Promise<boolean> {
  try {
    const secret = await getCSRFSecret()
    const storedToken = await getCSRFToken()
    
    if (!secret || !storedToken) {
      return false
    }
    
    // Compare submitted token with stored token
    if (submittedToken !== storedToken) {
      return false
    }
    
    // Additional validation with hash
    const expectedHash = await createTokenHash(secret, storedToken)
    const submittedHash = await createTokenHash(secret, submittedToken)
    
    return expectedHash === submittedHash
  } catch (error) {
    console.error('CSRF validation error:', error)
    return false
  }
}

/**
 * Clear CSRF tokens from cookies
 */
export async function clearCSRFTokens(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CSRF_TOKEN_NAME)
  cookieStore.delete(CSRF_SECRET_NAME)
}

 