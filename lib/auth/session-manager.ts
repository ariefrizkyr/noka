'use client'

import { createClient } from '@/lib/supabase/client'
import { Session, User, AuthError, AuthChangeEvent } from '@supabase/supabase-js'

/**
 * Advanced Session Manager
 * 
 * Handles comprehensive session management including:
 * - Session persistence and recovery
 * - Automatic token refresh
 * - Session timeout management
 * - Error recovery and retry logic
 * - State synchronization between server/client
 */

export interface SessionState {
  session: Session | null
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  lastActivity: number
  error: AuthError | null
}

export interface SessionConfig {
  autoRefresh: boolean
  persistSession: boolean
  sessionTimeout: number // in milliseconds
  inactivityTimeout: number // in milliseconds
  retryAttempts: number
  retryDelay: number // in milliseconds
}

export type SessionEventType = 
  | 'SESSION_INITIALIZED'
  | 'SESSION_RESTORED' 
  | 'SESSION_EXPIRED'
  | 'SESSION_TIMEOUT'
  | 'SESSION_ERROR'
  | 'SESSION_RECOVERY_SUCCESS'
  | 'SESSION_RECOVERY_FAILED'
  | 'TOKEN_REFRESHED'
  | 'ACTIVITY_DETECTED'

export interface SessionEvent {
  type: SessionEventType
  session: Session | null
  user: User | null
  error?: AuthError
  timestamp: number
}

export type SessionEventCallback = (event: SessionEvent) => void

class SessionManager {
  private supabase = createClient()
  private config: SessionConfig
  private state: SessionState
  private listeners: Set<SessionEventCallback> = new Set()
  private activityTimer: NodeJS.Timeout | null = null
  private sessionTimer: NodeJS.Timeout | null = null
  private refreshTimer: NodeJS.Timeout | null = null
  private retryCount = 0
  private isRecovering = false

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      autoRefresh: true,
      persistSession: true,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      inactivityTimeout: 30 * 60 * 1000, // 30 minutes
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    }

    this.state = {
      session: null,
      user: null,
      isLoading: true,
      isInitialized: false,
      lastActivity: Date.now(),
      error: null
    }

    this.initialize()
  }

  /**
   * Initialize session manager
   */
  private async initialize(): Promise<void> {
    try {
      // Get initial session
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        this.handleError(error)
        return
      }

      this.updateState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isInitialized: true,
        error: null
      })

      // Set up auth state change listener
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.handleAuthStateChange(event, session)
      })

      // Start activity monitoring
      this.startActivityMonitoring()

      // Start session timeout monitoring
      if (session && this.config.sessionTimeout > 0) {
        this.startSessionTimeout(session)
      }

      this.emitEvent({
        type: 'SESSION_INITIALIZED',
        session,
        user: session?.user ?? null,
        timestamp: Date.now()
      })

    } catch (error) {
      this.handleError(error as AuthError)
    }
  }

  /**
   * Handle auth state changes
   */
  private handleAuthStateChange(event: AuthChangeEvent, session: Session | null): void {
    const previousSession = this.state.session
    
    this.updateState({
      session,
      user: session?.user ?? null,
      isLoading: false,
      error: null,
      lastActivity: Date.now()
    })

    // Handle specific events
    switch (event) {
      case 'SIGNED_IN':
        this.handleSignIn(session)
        break
      case 'SIGNED_OUT':
        this.handleSignOut()
        break
      case 'TOKEN_REFRESHED':
        this.handleTokenRefresh(session)
        break
      case 'USER_UPDATED':
        this.handleUserUpdate(session)
        break
      case 'PASSWORD_RECOVERY':
        this.handlePasswordRecovery()
        break
    }

    // Check for session recovery
    if (!previousSession && session && this.isRecovering) {
      this.isRecovering = false
      this.retryCount = 0
      this.emitEvent({
        type: 'SESSION_RECOVERY_SUCCESS',
        session,
        user: session.user,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Handle sign in
   */
  private handleSignIn(session: Session | null): void {
    if (session) {
      this.startSessionTimeout(session)
      this.startActivityMonitoring()
    }
  }

  /**
   * Handle sign out
   */
  private handleSignOut(): void {
    this.clearTimers()
    this.isRecovering = false
    this.retryCount = 0
  }

  /**
   * Handle token refresh
   */
  private handleTokenRefresh(session: Session | null): void {
    if (session) {
      this.startSessionTimeout(session)
      this.emitEvent({
        type: 'TOKEN_REFRESHED',
        session,
        user: session.user,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Handle user update
   */
  private handleUserUpdate(session: Session | null): void {
    // User profile was updated, refresh data if needed
  }

  /**
   * Handle password recovery
   */
  private handlePasswordRecovery(): void {
    // Password recovery initiated
  }

  /**
   * Start session timeout monitoring
   */
  private startSessionTimeout(session: Session): void {
    this.clearSessionTimer()
    
    if (this.config.sessionTimeout <= 0) return

    // Handle both Unix timestamp (seconds) and ISO date string
    let expiresAtMs: number
    if (typeof session.expires_at === 'number') {
      // If it's a number, check if it's in seconds or milliseconds
      // Unix timestamps in seconds are < 10^10, in milliseconds are > 10^10
      expiresAtMs = session.expires_at < 10000000000 
        ? session.expires_at * 1000  // Convert seconds to milliseconds
        : session.expires_at         // Already in milliseconds
    } else {
      // If it's a string, parse as ISO date
      expiresAtMs = new Date(session.expires_at!).getTime()
    }

    const now = Date.now()
    const timeUntilExpiry = expiresAtMs - now

    // Ensure we don't set negative timeouts
    const timeoutDuration = Math.max(0, Math.min(timeUntilExpiry, this.config.sessionTimeout))

    // Set timer for session expiration
    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpired()
    }, timeoutDuration)
  }

  /**
   * Start activity monitoring for inactivity timeout
   */
  private startActivityMonitoring(): void {
    this.clearActivityTimer()
    
    if (this.config.inactivityTimeout <= 0) return

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      this.updateActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Start inactivity timer
    this.resetInactivityTimer()
  }

  /**
   * Update last activity timestamp
   */
  private updateActivity(): void {
    const now = Date.now()
    this.updateState({ lastActivity: now })
    
    this.emitEvent({
      type: 'ACTIVITY_DETECTED',
      session: this.state.session,
      user: this.state.user,
      timestamp: now
    })

    this.resetInactivityTimer()
  }

  /**
   * Reset inactivity timer
   */
  private resetInactivityTimer(): void {
    this.clearActivityTimer()
    
    this.activityTimer = setTimeout(() => {
      this.handleInactivityTimeout()
    }, this.config.inactivityTimeout)
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpired(): void {
    this.emitEvent({
      type: 'SESSION_EXPIRED',
      session: this.state.session,
      user: this.state.user,
      timestamp: Date.now()
    })

    this.attemptSessionRecovery()
  }

  /**
   * Handle inactivity timeout
   */
  private handleInactivityTimeout(): void {
    this.emitEvent({
      type: 'SESSION_TIMEOUT',
      session: this.state.session,
      user: this.state.user,
      timestamp: Date.now()
    })

    // Optionally sign out on inactivity
    this.signOut()
  }

  /**
   * Attempt session recovery
   */
  private async attemptSessionRecovery(): Promise<void> {
    if (this.isRecovering || this.retryCount >= this.config.retryAttempts) {
      this.emitEvent({
        type: 'SESSION_RECOVERY_FAILED',
        session: null,
        user: null,
        error: new Error('Session recovery failed after maximum attempts') as AuthError,
        timestamp: Date.now()
      })
      return
    }

    this.isRecovering = true
    this.retryCount++

    try {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * this.retryCount))

      // Attempt to refresh session
      const { error } = await this.supabase.auth.refreshSession()
      
      if (error) {
        throw error
      }

    } catch (error) {
      console.warn(`Session recovery attempt ${this.retryCount} failed:`, error)
      
      if (this.retryCount < this.config.retryAttempts) {
        // Retry after delay
        setTimeout(() => this.attemptSessionRecovery(), this.config.retryDelay * this.retryCount)
      } else {
        this.isRecovering = false
        this.emitEvent({
          type: 'SESSION_RECOVERY_FAILED',
          session: null,
          user: null,
          error: error as AuthError,
          timestamp: Date.now()
        })
      }
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: AuthError): void {
    this.updateState({ error, isLoading: false })
    
    this.emitEvent({
      type: 'SESSION_ERROR',
      session: this.state.session,
      user: this.state.user,
      error,
      timestamp: Date.now()
    })

    // Attempt recovery for certain error types
    if (this.shouldAttemptRecovery(error)) {
      this.attemptSessionRecovery()
    }
  }

  /**
   * Check if we should attempt recovery for this error
   */
  private shouldAttemptRecovery(error: AuthError): boolean {
    const recoverableErrors = [
      'session_not_found',
      'invalid_token',
      'token_expired',
      'network_error'
    ]
    
    return recoverableErrors.includes(error.message) || error.status === 401
  }

  /**
   * Update internal state
   */
  private updateState(updates: Partial<SessionState>): void {
    this.state = { ...this.state, ...updates }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: SessionEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Session event listener error:', error)
      }
    })
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.clearActivityTimer()
    this.clearSessionTimer()
    this.clearRefreshTimer()
  }

  /**
   * Clear activity timer
   */
  private clearActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
      this.activityTimer = null
    }
  }

  /**
   * Clear session timer
   */
  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
      this.sessionTimer = null
    }
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  // Public API

  /**
   * Get current session state
   */
  getState(): SessionState {
    return { ...this.state }
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.state.session
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.state.user
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.state.user && !!this.state.session
  }

  /**
   * Check if session manager is initialized
   */
  isInitialized(): boolean {
    return this.state.isInitialized
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      
      this.clearTimers()
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Refresh session manually
   */
  async refreshSession(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.refreshSession()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Add event listener
   */
  addEventListener(callback: SessionEventCallback): () => void {
    this.listeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Remove event listener
   */
  removeEventListener(callback: SessionEventCallback): void {
    this.listeners.delete(callback)
  }

  /**
   * Destroy session manager
   */
  destroy(): void {
    this.clearTimers()
    this.listeners.clear()
    
    // Remove activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.removeEventListener(event, this.updateActivity)
    })
  }
}

// Create singleton instance
let sessionManager: SessionManager | null = null

/**
 * Get session manager instance
 */
export function getSessionManager(config?: Partial<SessionConfig>): SessionManager {
  if (!sessionManager) {
    sessionManager = new SessionManager(config)
  }
  return sessionManager
}

/**
 * Hook for using session manager in React components
 */
export function useSessionManager() {
  return getSessionManager()
} 