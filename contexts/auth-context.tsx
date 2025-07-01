'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  getSessionManager, 
  SessionEventCallback, 
  SessionEvent,
  SessionState,
  SessionConfig
} from '@/lib/auth/session-manager'

// Enhanced authentication state interface
interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  isInitialized: boolean
  lastActivity: number
  sessionEvents: SessionEvent[]
}

// Enhanced authentication methods interface
interface AuthMethods {
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google') => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  refreshSession: () => Promise<{ error: AuthError | null }>
  clearError: () => void
  
  // Enhanced session management methods
  getSessionState: () => SessionState
  isSessionExpired: () => boolean
  getTimeUntilExpiry: () => number
  getInactivityTime: () => number
  forceSessionRefresh: () => Promise<{ error: AuthError | null }>
  configureSession: (config: Partial<SessionConfig>) => void
  
  // Session event management
  addEventListener: (callback: SessionEventCallback) => () => void
  removeEventListener: (callback: SessionEventCallback) => void
  getSessionEvents: () => SessionEvent[]
  clearSessionEvents: () => void
}

// Combined auth context type
type AuthContextType = AuthState & AuthMethods

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Enhanced AuthProvider component
export function AuthProvider({ 
  children, 
  sessionConfig = {}
}: { 
  children: React.ReactNode
  sessionConfig?: Partial<SessionConfig>
}) {
  const supabase = createClient()
  const router = useRouter()
  const sessionManager = getSessionManager(sessionConfig)
  
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isInitialized: false,
    lastActivity: Date.now(),
    sessionEvents: []
  })

  // Refs for cleanup
  const eventListenerRef = useRef<(() => void) | null>(null)
  const isInitializedRef = useRef(false)

  /**
   * Handle session events from SessionManager
   */
  const handleSessionEvent = useCallback((event: SessionEvent) => {
    setAuthState(prevState => {
      const newEvents = [...prevState.sessionEvents, event].slice(-50) // Keep last 50 events
      
      return {
        ...prevState,
        user: event.user,
        session: event.session,
        error: event.error || null,
        loading: false,
        isInitialized: true,
        lastActivity: event.timestamp,
        sessionEvents: newEvents
      }
    })

    // Handle specific events
    switch (event.type) {
      case 'SESSION_EXPIRED':
        console.warn('Session expired, attempting recovery...')
        break
      case 'SESSION_TIMEOUT':
        console.warn('Session timed out due to inactivity')
        break
      case 'SESSION_RECOVERY_FAILED':
        console.error('Session recovery failed:', event.error)
        // Optionally redirect to login
        router.push('/auth/login')
        break
      case 'SESSION_RECOVERY_SUCCESS':
        console.log('Session recovered successfully')
        break
      case 'TOKEN_REFRESHED':
        console.log('Auth token refreshed')
        break
    }
  }, [router])

  /**
   * Initialize the enhanced auth provider
   */
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    // Get initial session state from SessionManager
    const initialState = sessionManager.getState()
    setAuthState(prevState => ({
      ...prevState,
      user: initialState.user,
      session: initialState.session,
      loading: initialState.isLoading,
      error: initialState.error,
      isInitialized: initialState.isInitialized,
      lastActivity: initialState.lastActivity
    }))

    // Subscribe to session events
    const unsubscribe = sessionManager.addEventListener(handleSessionEvent)
    eventListenerRef.current = unsubscribe

    return () => {
      if (eventListenerRef.current) {
        eventListenerRef.current()
        eventListenerRef.current = null
      }
    }
  }, [handleSessionEvent, sessionManager])

  /**
   * Enhanced authentication methods
   */
  
  // Sign in with email and password
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { error: authError }
    }
  }, [supabase.auth])

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(async (provider: 'google') => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { error: authError }
    }
  }, [supabase.auth])

  // Sign up new user
  const signUp = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { error: authError }
    }
  }, [supabase.auth])

  // Sign out user
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Use SessionManager's signOut for proper cleanup
      const { error } = await sessionManager.signOut()
      
      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }))
        return { error }
      }
      
      // Clear local state
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
        error: null,
        sessionEvents: []
      }))
      
      // Redirect to home
      router.push('/')
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { error: authError }
    }
  }, [sessionManager, router])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password/confirm`
      })
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { error }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { error: authError }
    }
  }, [supabase.auth])

  // Update password
  const updatePassword = useCallback(async (password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { error }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError, loading: false }))
      return { error: authError }
    }
  }, [supabase.auth])

  // Refresh session using SessionManager
  const refreshSession = useCallback(async () => {
    return await sessionManager.refreshSession()
  }, [sessionManager])

  // Force session refresh (for manual triggers)
  const forceSessionRefresh = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    const result = await sessionManager.refreshSession()
    setAuthState(prev => ({ ...prev, loading: false }))
    return result
  }, [sessionManager])

  // Clear current error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  // Enhanced session management methods
  const getSessionState = useCallback(() => {
    return sessionManager.getState()
  }, [sessionManager])

  const isSessionExpired = useCallback(() => {
    const state = sessionManager.getState()
    if (!state.session) return true
    
    const expiresAt = new Date(state.session.expires_at!).getTime()
    return Date.now() >= expiresAt
  }, [sessionManager])

  const getTimeUntilExpiry = useCallback(() => {
    const state = sessionManager.getState()
    if (!state.session) return 0
    
    const expiresAt = new Date(state.session.expires_at!).getTime()
    return Math.max(0, expiresAt - Date.now())
  }, [sessionManager])

  const getInactivityTime = useCallback(() => {
    const state = sessionManager.getState()
    return Date.now() - state.lastActivity
  }, [sessionManager])

  const configureSession = useCallback((config: Partial<SessionConfig>) => {
    // Note: This would require SessionManager to support runtime config updates
    console.warn('Runtime session configuration not yet implemented')
  }, [])

  // Session event management
  const addEventListener = useCallback((callback: SessionEventCallback) => {
    return sessionManager.addEventListener(callback)
  }, [sessionManager])

  const removeEventListener = useCallback((callback: SessionEventCallback) => {
    sessionManager.removeEventListener(callback)
  }, [sessionManager])

  const getSessionEvents = useCallback(() => {
    return authState.sessionEvents
  }, [authState.sessionEvents])

  const clearSessionEvents = useCallback(() => {
    setAuthState(prev => ({ ...prev, sessionEvents: [] }))
  }, [])

  // Create context value
  const contextValue: AuthContextType = {
    // Auth state
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isInitialized: authState.isInitialized,
    lastActivity: authState.lastActivity,
    sessionEvents: authState.sessionEvents,
    
    // Auth methods
    signInWithPassword,
    signInWithOAuth,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    clearError,
    
    // Enhanced session methods
    getSessionState,
    isSessionExpired,
    getTimeUntilExpiry,
    getInactivityTime,
    forceSessionRefresh,
    configureSession,
    
    // Event management
    addEventListener,
    removeEventListener,
    getSessionEvents,
    clearSessionEvents
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use the auth context
 * @returns AuthContextType - The authentication context value
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Hook to check authentication status
 * @returns boolean - Whether the user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user, session, isInitialized } = useAuth()
  return isInitialized && !!user && !!session
}

/**
 * Hook to get session information
 * @returns Object with session details and utilities
 */
export function useSession() {
  const { 
    session, 
    user, 
    isSessionExpired, 
    getTimeUntilExpiry, 
    getInactivityTime,
    lastActivity 
  } = useAuth()
  
  return {
    session,
    user,
    isExpired: isSessionExpired(),
    timeUntilExpiry: getTimeUntilExpiry(),
    inactivityTime: getInactivityTime(),
    lastActivity: new Date(lastActivity),
    isValid: !!session && !isSessionExpired()
  }
}

/**
 * Hook to monitor session events
 * @param eventTypes - Optional array of event types to filter
 * @returns Array of session events
 */
export function useSessionEvents(eventTypes?: string[]) {
  const { sessionEvents } = useAuth()
  
  if (!eventTypes) return sessionEvents
  
  return sessionEvents.filter(event => eventTypes.includes(event.type))
}

/**
 * Hook for enhanced session monitoring with real-time updates
 * @param interval - Update interval in milliseconds (default: 5000)
 * @returns Session monitoring data
 */
export function useSessionMonitor(interval: number = 5000) {
  const auth = useAuth()
  const [monitorData, setMonitorData] = useState({
    timeUntilExpiry: auth.getTimeUntilExpiry(),
    inactivityTime: auth.getInactivityTime(),
    isExpired: auth.isSessionExpired()
  })
  
  useEffect(() => {
    const timer = setInterval(() => {
      setMonitorData({
        timeUntilExpiry: auth.getTimeUntilExpiry(),
        inactivityTime: auth.getInactivityTime(),
        isExpired: auth.isSessionExpired()
      })
    }, interval)
    
    return () => clearInterval(timer)
  }, [auth, interval])
  
  return {
    ...monitorData,
    timeUntilExpiryFormatted: new Date(monitorData.timeUntilExpiry).toISOString().substr(11, 8),
    inactivityTimeFormatted: new Date(monitorData.inactivityTime).toISOString().substr(11, 8)
  }
} 