'use client'

import { useAuth, useSession, useSessionEvents, useSessionMonitor } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  User, 
  LogOut, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  Activity, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Wifi
} from 'lucide-react'
import { useState } from 'react'

/**
 * Enhanced AuthStatus Component
 * 
 * Demonstrates comprehensive auth context usage with advanced session management:
 * - Real-time session monitoring
 * - Session events tracking
 * - Timeout and expiry management
 * - Recovery status
 * - Activity monitoring
 */
export function AuthStatus() {
  const { 
    user, 
    session, 
    loading, 
    error,
    isInitialized,
    signOut,
    refreshSession,
    clearError,
    getSessionState,
    forceSessionRefresh
  } = useAuth()

  const sessionInfo = useSession()
  const sessionEvents = useSessionEvents()
  const sessionMonitor = useSessionMonitor(1000) // Update every second
  
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Handle manual session refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    const { error } = await forceSessionRefresh()
    
    if (error) {
      console.error('Failed to refresh session:', error)
    }
    
    setIsRefreshing(false)
  }

  // Handle sign out
  const handleSignOut = async () => {
    const { error } = await signOut()
    
    if (error) {
      console.error('Failed to sign out:', error)
    }
  }

  // Format time duration
  const formatDuration = (ms: number): string => {
    if (ms <= 0) return '0s'
    
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    const parts = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0) parts.push(`${seconds}s`)
    
    return parts.join(' ')
  }

  // Calculate session health score
  const calculateHealthScore = (): number => {
    if (!sessionInfo.isValid) return 0
    
    let score = 100
    
    // Reduce score based on time until expiry
    const expiryRatio = sessionInfo.timeUntilExpiry / (24 * 60 * 60 * 1000) // 24 hours
    if (expiryRatio < 0.1) score -= 30 // Less than 10% time left
    else if (expiryRatio < 0.25) score -= 15 // Less than 25% time left
    
    // Reduce score based on inactivity
    const inactivityMinutes = sessionInfo.inactivityTime / (1000 * 60)
    if (inactivityMinutes > 30) score -= 20 // More than 30 min inactive
    else if (inactivityMinutes > 15) score -= 10 // More than 15 min inactive
    
    // Check for recent errors
    const recentErrors = sessionEvents
      .filter(e => e.type === 'SESSION_ERROR' && Date.now() - e.timestamp < 5 * 60 * 1000)
    score -= recentErrors.length * 10
    
    return Math.max(0, Math.min(100, score))
  }

  const healthScore = calculateHealthScore()

  // Get health status color and icon
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { color: 'text-green-600', icon: CheckCircle, label: 'Excellent' }
    if (score >= 60) return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Good' }
    if (score >= 40) return { color: 'text-orange-600', icon: AlertTriangle, label: 'Fair' }
    return { color: 'text-red-600', icon: XCircle, label: 'Poor' }
  }

  const healthStatus = getHealthStatus(healthScore)

  if (loading || !isInitialized) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-full max-w-4xl">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearError}
            className="mt-2 ml-2"
          >
            Clear Error
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!user || !session) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
          <CardDescription>You are not currently signed in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Not Authenticated
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Authentication Status
              </CardTitle>
              <CardDescription>
                Enhanced session management with real-time monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Authenticated
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Session Health */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Session Health
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Health Score</span>
                  <Badge variant="outline" className={healthStatus.color}>
                    <healthStatus.icon className="h-3 w-3 mr-1" />
                    {healthScore}% - {healthStatus.label}
                  </Badge>
                </div>
                <Progress value={healthScore} className="h-2" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="justify-start"
                >
                  <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Session
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  className="justify-start text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-3 w-3 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Session Information */}
      <Tabs defaultValue="session" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="session">Session Details</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="events">Session Events</TabsTrigger>
          <TabsTrigger value="technical">Technical Info</TabsTrigger>
        </TabsList>

        {/* Session Details Tab */}
        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Session Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valid:</span>
                      <Badge variant={sessionInfo.isValid ? "default" : "destructive"}>
                        {sessionInfo.isValid ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Expired:</span>
                      <Badge variant={sessionInfo.isExpired ? "destructive" : "default"}>
                        {sessionInfo.isExpired ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Timing Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-mono">
                        {new Date(session.user.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="font-mono">
                        {session.expires_at ? new Date(session.expires_at).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Activity:</span>
                      <span className="font-mono">
                        {sessionInfo.lastActivity.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Time Remaining</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-blue-600" />
                      <span className="text-lg font-mono">
                        {formatDuration(sessionInfo.timeUntilExpiry)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, (sessionInfo.timeUntilExpiry / (24 * 60 * 60 * 1000)) * 100)} 
                      className="h-2"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Inactivity Time</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-lg font-mono">
                        {formatDuration(sessionInfo.inactivityTime)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, (sessionInfo.inactivityTime / (30 * 60 * 1000)) * 100)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Session Monitoring
              </CardTitle>
              <CardDescription>
                Live updates every second showing session health and timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Timer className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-mono font-bold">
                    {sessionMonitor.timeUntilExpiryFormatted}
                  </div>
                  <div className="text-sm text-muted-foreground">Until Expiry</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-mono font-bold">
                    {sessionMonitor.inactivityTimeFormatted}
                  </div>
                  <div className="text-sm text-muted-foreground">Inactive Time</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">
                    {healthScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Session Warnings</h4>
                <div className="space-y-2">
                  {sessionMonitor.isExpired && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Session Expired</AlertTitle>
                      <AlertDescription>
                        Your session has expired. Please sign in again.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {sessionInfo.timeUntilExpiry < 60 * 60 * 1000 && !sessionMonitor.isExpired && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Session Expiring Soon</AlertTitle>
                      <AlertDescription>
                        Your session will expire in less than 1 hour.
                      </AlertDescription>
                    </Alert>
                  )}

                  {sessionInfo.inactivityTime > 15 * 60 * 1000 && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Long Inactivity</AlertTitle>
                      <AlertDescription>
                        You&apos;ve been inactive for over 15 minutes.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Events Log</CardTitle>
              <CardDescription>
                Real-time log of session events including recoveries, refreshes, and errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-2">
                  {sessionEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No session events recorded yet
                    </div>
                  ) : (
                    sessionEvents
                      .slice()
                      .reverse() // Show newest first
                      .map((event, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded-lg text-sm"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {event.type.includes('ERROR') && <XCircle className="h-4 w-4 text-red-600" />}
                            {event.type.includes('SUCCESS') && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {event.type.includes('REFRESH') && <RefreshCw className="h-4 w-4 text-blue-600" />}
                            {event.type.includes('TIMEOUT') && <Clock className="h-4 w-4 text-amber-600" />}
                            {event.type.includes('ACTIVITY') && <Activity className="h-4 w-4 text-green-600" />}
                            {!event.type.includes('ERROR') && 
                             !event.type.includes('SUCCESS') && 
                             !event.type.includes('REFRESH') && 
                             !event.type.includes('TIMEOUT') &&
                             !event.type.includes('ACTIVITY') && <Wifi className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {event.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {event.error && (
                              <div className="text-red-600 text-xs mt-1">
                                {event.error.message}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Info Tab */}
        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Information</CardTitle>
              <CardDescription>
                Detailed technical data about the current session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Session Token</h4>
                <div className="font-mono text-xs bg-muted p-2 rounded break-all">
                  {session.access_token ? `${session.access_token.substring(0, 50)}...` : 'No token'}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">User Metadata</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(user.user_metadata, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Session Manager State</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(getSessionState(), null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Simple auth state hook demonstration
 * Shows how components can easily access auth state
 */
export function useAuthState() {
  const { user, loading } = useAuth()
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user
  }
} 