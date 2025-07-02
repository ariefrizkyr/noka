import DOMPurify from 'dompurify'
import validator from 'validator'
import { JSDOM } from 'jsdom'

// Create a JSDOM window for server-side DOMPurify
const window = new JSDOM('').window
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const purify = DOMPurify(window as any)

/**
 * Sanitization options for different contexts
 */
export interface SanitizationOptions {
  allowHTML?: boolean
  maxLength?: number
  trim?: boolean
  strictEmail?: boolean
}

/**
 * Default sanitization options
 */
const DEFAULT_OPTIONS: SanitizationOptions = {
  allowHTML: false,
  maxLength: 1000,
  trim: true,
  strictEmail: false,
}

/**
 * Sanitize string input to prevent XSS
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
  
  // Sanitize HTML
  if (opts.allowHTML) {
    // Allow basic HTML but sanitize dangerous content
    sanitized = purify.sanitize(sanitized, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em'],
      ALLOWED_ATTR: [],
    })
  } else {
    // Strip all HTML tags
    sanitized = purify.sanitize(sanitized, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  }
  
  return sanitized
}

/**
 * Sanitize email input
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
  
  // Normalize email
  sanitized = validator.normalizeEmail(sanitized, {
    gmail_lowercase: true,
    gmail_remove_dots: false,
    outlookdotcom_lowercase: true,
    yahoo_lowercase: true,
    icloud_lowercase: true,
  }) || sanitized
  
  return sanitized
}

/**
 * Sanitize password input (minimal processing to preserve intentional characters)
 */
export function sanitizePassword(password: string): string {
  if (typeof password !== 'string') {
    return ''
  }
  
  // Only strip HTML tags, don't trim or limit length significantly
  return purify.sanitize(password, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const sanitized = sanitizeEmail(email)
  return validator.isEmail(sanitized)
}

/**
 * Validate password strength
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

/**
 * Form field value type for sanitization
 */
export type FormFieldValue = string | number | boolean | string[] | null | undefined

/**
 * Sanitize form data object
 */
export function sanitizeFormData(
  data: Record<string, FormFieldValue>,
  fieldOptions: Record<string, SanitizationOptions> = {}
): Record<string, FormFieldValue> {
  const sanitized: Record<string, FormFieldValue> = {}
  
  for (const [key, value] of Object.entries(data)) {
    const options = fieldOptions[key] || {}
    
    if (typeof value === 'string') {
      // Special handling for common fields
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value)
      } else if (key.toLowerCase().includes('password')) {
        sanitized[key] = sanitizePassword(value)
      } else {
        sanitized[key] = sanitizeString(value, options)
      }
    } else if (Array.isArray(value)) {
      // Sanitize array of strings
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item, options) : item
      )
    } else {
      // Keep non-string values as-is (numbers, booleans, etc.)
      sanitized[key] = value
    }
  }
  
  return sanitized
}

/**
 * Check for potentially malicious patterns
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
 * Comprehensive input validation and sanitization
 */
export function validateAndSanitizeInput(
  input: string,
  type: 'email' | 'password' | 'text' = 'text',
  options: SanitizationOptions = {}
): {
  sanitized: string
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  let sanitized = input
  
  // Check for malicious patterns first
  const maliciousCheck = detectMaliciousPatterns(input)
  if (maliciousCheck.isSuspicious) {
    errors.push('Input contains potentially malicious content')
    return { sanitized: '', isValid: false, errors }
  }
  
  // Type-specific validation and sanitization
  switch (type) {
    case 'email':
      sanitized = sanitizeEmail(input)
      if (!validateEmail(sanitized)) {
        errors.push('Invalid email format')
      }
      break
      
    case 'password':
      sanitized = sanitizePassword(input)
      const passwordValidation = validatePassword(sanitized)
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors)
      }
      break
      
    default:
      sanitized = sanitizeString(input, options)
      break
  }
  
  return {
    sanitized,
    isValid: errors.length === 0,
    errors,
  }
} 