/**
 * Simple in-memory rate limiting for authentication endpoints
 * In production, consider using Redis or other persistent storage
 */

interface RateLimitEntry {
  count: number
  firstAttempt: number
  lastAttempt: number
  blocked: boolean
  blockUntil?: number
}

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxAttempts: number // Max attempts in window
  blockDurationMs: number // How long to block after max attempts
  progressiveDelay: boolean // Whether to add delays between attempts
}

// Default configurations for different endpoints
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
    progressiveDelay: true,
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDurationMs: 60 * 60 * 1000, // 1 hour
    progressiveDelay: false,
  },
  'reset-password': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
    progressiveDelay: false,
  },
}

// In-memory storage (in production, use Redis)
const rateLimitStore: Map<string, RateLimitEntry> = new Map()

/**
 * Get client identifier from request
 */
export function getClientId(request: Request): string {
  // Try to get real IP from headers (for proxy scenarios)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // Include user agent for additional fingerprinting
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Create a hash of IP + User Agent for better identification
  const identifier = `${ip}:${userAgent.substring(0, 50)}`
  
  return Buffer.from(identifier).toString('base64')
}

/**
 * Check if client is rate limited
 */
export function checkRateLimit(
  clientId: string,
  endpoint: string
): {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
  message?: string
} {
  const config = RATE_LIMIT_CONFIGS[endpoint]
  if (!config) {
    // No rate limiting configured for this endpoint
    return {
      allowed: true,
      remaining: Infinity,
      resetTime: Date.now(),
    }
  }
  
  const key = `${clientId}:${endpoint}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  
  // If no entry exists, create one
  if (!entry) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
    })
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    }
  }
  
  // Check if block period has expired
  if (entry.blocked && entry.blockUntil && now > entry.blockUntil) {
    // Reset the entry
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
    })
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    }
  }
  
  // Check if still blocked
  if (entry.blocked) {
    const retryAfter = entry.blockUntil ? Math.ceil((entry.blockUntil - now) / 1000) : config.blockDurationMs / 1000
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockUntil || now + config.blockDurationMs,
      retryAfter,
      message: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
    }
  }
  
  // Check if window has expired
  if (now - entry.firstAttempt > config.windowMs) {
    // Reset the window
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
    })
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
    }
  }
  
  // Increment count
  const newCount = entry.count + 1
  const remaining = Math.max(0, config.maxAttempts - newCount)
  
  // Check if limit exceeded
  if (newCount > config.maxAttempts) {
    // Block the client
    rateLimitStore.set(key, {
      ...entry,
      count: newCount,
      lastAttempt: now,
      blocked: true,
      blockUntil: now + config.blockDurationMs,
    })
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + config.blockDurationMs,
      retryAfter: Math.ceil(config.blockDurationMs / 1000),
      message: `Too many failed attempts. Account temporarily locked for ${Math.ceil(config.blockDurationMs / (1000 * 60))} minutes.`,
    }
  }
  
  // Update entry
  rateLimitStore.set(key, {
    ...entry,
    count: newCount,
    lastAttempt: now,
  })
  
  // Calculate progressive delay if enabled
  let retryAfter: number | undefined
  if (config.progressiveDelay && newCount > 1) {
    // Progressive delay: 1s, 2s, 4s, 8s, etc.
    retryAfter = Math.min(Math.pow(2, newCount - 2), 30) // Cap at 30 seconds
  }
  
  return {
    allowed: true,
    remaining,
    resetTime: entry.firstAttempt + config.windowMs,
    retryAfter,
    message: remaining === 1 ? 'Warning: Last attempt before temporary lockout' : undefined,
  }
}

/**
 * Record a successful attempt (resets rate limiting for this client)
 */
export function recordSuccess(clientId: string, endpoint: string): void {
  const key = `${clientId}:${endpoint}`
  rateLimitStore.delete(key)
}

/**
 * Clear expired entries from the store (cleanup function)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries that have been blocked and the block has expired
    if (entry.blocked && entry.blockUntil && now > entry.blockUntil) {
      rateLimitStore.delete(key)
      continue
    }
    
    // Remove entries where the window has expired and they're not blocked
    if (!entry.blocked) {
      const config = RATE_LIMIT_CONFIGS[key.split(':')[1]]
      if (config && now - entry.firstAttempt > config.windowMs) {
        rateLimitStore.delete(key)
      }
    }
  }
}

/**
 * Middleware helper to check rate limiting
 */
export function createRateLimitMiddleware(endpoint: string) {
  return (request: Request) => {
    const clientId = getClientId(request)
    const result = checkRateLimit(clientId, endpoint)
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: result.message,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS[endpoint]?.maxAttempts.toString() || '5',
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
          },
        }
      )
    }
    
    return null // No rate limiting applied
  }
}

/**
 * Get rate limit status for a client without incrementing
 */
export function getRateLimitStatus(clientId: string, endpoint: string) {
  const config = RATE_LIMIT_CONFIGS[endpoint]
  if (!config) {
    return {
      limited: false,
      remaining: Infinity,
      resetTime: Date.now(),
    }
  }
  
  const key = `${clientId}:${endpoint}`
  const entry = rateLimitStore.get(key)
  const now = Date.now()
  
  if (!entry) {
    return {
      limited: false,
      remaining: config.maxAttempts,
      resetTime: now + config.windowMs,
    }
  }
  
  // Check if blocked
  if (entry.blocked) {
    return {
      limited: true,
      remaining: 0,
      resetTime: entry.blockUntil || now + config.blockDurationMs,
      retryAfter: entry.blockUntil ? Math.ceil((entry.blockUntil - now) / 1000) : config.blockDurationMs / 1000,
    }
  }
  
  // Check if window expired
  if (now - entry.firstAttempt > config.windowMs) {
    return {
      limited: false,
      remaining: config.maxAttempts,
      resetTime: now + config.windowMs,
    }
  }
  
  return {
    limited: false,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetTime: entry.firstAttempt + config.windowMs,
  }
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
} 