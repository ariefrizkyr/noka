/**
 * Client-side CSRF token management
 * This module only contains functions that can run in the browser
 */

const CSRF_TOKEN_NAME = 'csrf-token'

/**
 * Client-side function to get CSRF token from document cookies
 */
export function getClientCSRFToken(): string | null {
  if (typeof document === 'undefined') return null
  
  const match = document.cookie.match(new RegExp('(^| )' + CSRF_TOKEN_NAME + '=([^;]+)'))
  return match ? match[2] : null
}

/**
 * Client-side function to check if CSRF token exists
 */
export function hasCSRFToken(): boolean {
  return getClientCSRFToken() !== null
}

/**
 * Client-side function to trigger CSRF token refresh
 * Makes a request to trigger middleware to set new tokens
 */
export async function refreshCSRFToken(): Promise<string | null> {
  try {
    // Make a HEAD request to an auth page to trigger token generation
    await fetch('/auth/login', { 
      method: 'HEAD',
      credentials: 'include'
    })
    
    // Wait a bit for cookies to be set
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return getClientCSRFToken()
  } catch (error) {
    console.error('Failed to refresh CSRF token:', error)
    return null
  }
} 