'use client'

import { useEffect, useState, useCallback } from 'react'
import { getClientCSRFToken, refreshCSRFToken } from '@/lib/security/csrf-client'

interface CSRFTokenProps {
  /**
   * Name attribute for the hidden input field
   * @default 'csrfToken'
   */
  name?: string
  
  /**
   * Whether to refresh the token automatically
   * @default true
   */
  autoRefresh?: boolean
  
  /**
   * Refresh interval in milliseconds
   * @default 30 * 60 * 1000 (30 minutes)
   */
  refreshInterval?: number
  
  /**
   * Callback when token is loaded/refreshed
   */
  onTokenChange?: (token: string | null) => void
}

/**
 * CSRF Token component that automatically injects a hidden CSRF token field
 * into forms to protect against CSRF attacks
 */
export function CSRFToken({ 
  name = 'csrfToken', 
  autoRefresh = true,
  refreshInterval = 30 * 60 * 1000, // 30 minutes
  onTokenChange 
}: CSRFTokenProps) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshToken = useCallback(async () => {
    try {
      let newToken = getClientCSRFToken()
      
      if (!newToken) {
        // If no token found, try to refresh
        newToken = await refreshCSRFToken()
      }
      
      setToken(newToken)
      onTokenChange?.(newToken)
    } catch (error) {
      console.error('Error getting CSRF token:', error)
      setToken(null)
      onTokenChange?.(null)
    } finally {
      setLoading(false)
    }
  }, [onTokenChange])

  useEffect(() => {
    // Initial token load
    refreshToken()

    // Set up auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshToken, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshToken])

  // Refresh token when page becomes visible (handles tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && autoRefresh) {
        refreshToken()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [autoRefresh, refreshToken])

  if (loading) {
    return <input type="hidden" name={name} value="" disabled />
  }

  if (!token) {
    console.warn('CSRF token not available. Form submissions may fail.')
    return <input type="hidden" name={name} value="" />
  }

  return <input type="hidden" name={name} value={token} />
}

/**
 * Hook to get the current CSRF token
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getToken = () => {
      try {
        const currentToken = getClientCSRFToken()
        setToken(currentToken)
      } catch (error) {
        console.error('Error getting CSRF token:', error)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    getToken()

    // Refresh token when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        getToken()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const refreshToken = async () => {
    setLoading(true)
    try {
      const newToken = await refreshCSRFToken()
      setToken(newToken)
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error)
    } finally {
      setLoading(false)
    }
  }

  return { token, loading, refreshToken }
}

/**
 * Higher-order component that provides CSRF protection to forms
 */
export function withCSRFProtection<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function CSRFProtectedComponent(props: T) {
    const { token, loading } = useCSRFToken()

    if (loading) {
      return <div>Loading security features...</div>
    }

    if (!token) {
      return <div>Security verification required. Please refresh the page.</div>
    }

    return <WrappedComponent {...props} />
  }
} 