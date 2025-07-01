/**
 * Client-side input sanitization utilities
 * Browser-safe version without Node.js dependencies
 */

/**
 * Sanitization options for different contexts
 */
export interface SanitizationOptions {
  allowHTML?: boolean
  maxLength?: number
  trim?: boolean
}

/**
 * Default sanitization options
 */
const DEFAULT_OPTIONS: SanitizationOptions = {
  allowHTML: false,
  maxLength: 1000,
  trim: true,
}

/**
 * Simple HTML tag removal using regex (client-safe)
 */
function stripHTML(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize string input to prevent XSS (browser-safe version)
 */
export function sanitizeString(
  input: string,
  options: SanitizationOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  if (typeof input !== 'string') {
    return ''
  }
  
  let sanitized = input
  
  // Trim whitespace if requested
  if (opts.trim) {
    sanitized = sanitized.trim()
  }
  
  // Limit length
  if (opts.maxLength && sanitized.length > opts.maxLength) {
    sanitized = sanitized.substring(0, opts.maxLength)
  }
  
  // Sanitize HTML (simple version for client-side)
  if (!opts.allowHTML) {
    sanitized = stripHTML(sanitized)
    
    // Additional XSS prevention
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
  
  return sanitized
}

/**
 * Sanitize email input (client-safe version)
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }
  
  // Basic sanitization
  let sanitized = sanitizeString(email, { 
    allowHTML: false, 
    maxLength: 254, // RFC 5321 limit
    trim: true 
  })
  
  // Simple email normalization (client-safe)
  sanitized = sanitized.toLowerCase()
  
  return sanitized
}

/**
 * Sanitize password input (minimal processing to preserve intentional characters)
 */
export function sanitizePassword(password: string): string {
  if (typeof password !== 'string') {
    return ''
  }
  
  // Only strip HTML tags for passwords
  return stripHTML(password)
}

/**
 * Check for potentially malicious patterns (client-safe version)
 */
export function detectMaliciousPatterns(input: string): {
  isSuspicious: boolean
  patterns: string[]
} {
  const suspiciousPatterns = [
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<script/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /eval\s*\(/i,
    /expression\s*\(/i,
    /url\s*\(/i,
    /import\s*\(/i,
  ]
  
  const detectedPatterns: string[] = []
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      detectedPatterns.push(pattern.toString())
    }
  }
  
  return {
    isSuspicious: detectedPatterns.length > 0,
    patterns: detectedPatterns,
  }
}

/**
 * Validate email format (client-safe)
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate password strength (client-safe)
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required')
    return { isValid: false, errors }
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  // Check for at least one letter and one number
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one letter and one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
} 