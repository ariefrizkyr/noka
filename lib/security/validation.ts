import { z } from 'zod'
import { sanitizeFormData, validateAndSanitizeInput, type FormFieldValue } from './sanitization'
import { validateCSRFToken } from './csrf'

/**
 * Enhanced validation result with security metadata
 */
export interface ValidationResult<T = Record<string, unknown>> {
  success: boolean
  data?: T
  errors: string[]
  securityIssues: string[]
  sanitized: boolean
}

/**
 * Security-aware schema validation options
 */
export interface SecureValidationOptions {
  requireCSRF?: boolean
  sanitizeInputs?: boolean
  checkMaliciousPatterns?: boolean
  maxFieldLength?: number
}

/**
 * Enhanced email validation schema with security checks
 */
export const secureEmailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(254, 'Email is too long') // RFC 5321 limit
  .refine(
    (email) => {
      // Basic email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    { message: 'Invalid email format' }
  )
  .refine(
    (email) => {
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /[<>]/,           // HTML tags
        /javascript:/i,    // JavaScript protocol
        /data:/i,         // Data protocol
        /vbscript:/i,     // VBScript protocol
      ]
      return !suspiciousPatterns.some(pattern => pattern.test(email))
    },
    { message: 'Email contains invalid characters' }
  )

/**
 * Enhanced password validation schema with security checks
 */
export const securePasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password is too long')
  .refine(
    (password) => {
      // Check for at least one letter and one number
      return /^(?=.*[a-zA-Z])(?=.*\d)/.test(password)
    },
    { message: 'Password must contain at least one letter and one number' }
  )
  .refine(
    (password) => {
      // Check for HTML/Script injection attempts
      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
      ]
      return !maliciousPatterns.some(pattern => pattern.test(password))
    },
    { message: 'Password contains invalid characters' }
  )

/**
 * Combined authentication form schema
 */
export const authFormSchema = z.object({
  email: secureEmailSchema,
  password: securePasswordSchema,
})

/**
 * Password reset form schema
 */
export const resetPasswordSchema = z.object({
  email: secureEmailSchema,
})

/**
 * New password confirmation schema
 */
export const newPasswordSchema = z.object({
  password: securePasswordSchema,
})

/**
 * Validate and sanitize authentication form data
 */
export async function validateAuthForm(
  formData: FormData | Record<string, unknown>,
  options: SecureValidationOptions = {}
): Promise<ValidationResult> {
  const opts = {
    requireCSRF: true,
    sanitizeInputs: true,
    checkMaliciousPatterns: true,
    maxFieldLength: 1000,
    ...options,
  }

  const errors: string[] = []
  const securityIssues: string[] = []
  let sanitized = false

  try {
    // Extract data from FormData or use as-is
    let data: Record<string, unknown>
    if (formData instanceof FormData) {
      data = Object.fromEntries(formData.entries())
    } else {
      data = formData
    }

    // CSRF validation if required
    if (opts.requireCSRF) {
      const csrfToken = data.csrfToken || data['csrf-token']
      if (!csrfToken) {
        securityIssues.push('CSRF token missing')
        return {
          success: false,
          errors: ['Security token required'],
          securityIssues,
          sanitized: false,
        }
      }

      const csrfValid = await validateCSRFToken(String(csrfToken))
      if (!csrfValid) {
        securityIssues.push('CSRF token invalid')
        return {
          success: false,
          errors: ['Invalid security token'],
          securityIssues,
          sanitized: false,
        }
      }
    }

    // Sanitize inputs if requested
    if (opts.sanitizeInputs) {
      data = sanitizeFormData(data as Record<string, FormFieldValue>, {
        email: { maxLength: 254, trim: true },
        password: { maxLength: 128, trim: false },
      })
      sanitized = true
    }

    // Additional security checks
    if (opts.checkMaliciousPatterns) {
      for (const [field, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          const validation = validateAndSanitizeInput(value, 'text')
          if (!validation.isValid) {
            securityIssues.push(`Malicious pattern detected in ${field}`)
            errors.push(`Invalid content in ${field}`)
          }
        }
      }
    }

    // Validate with Zod schema
    const result = authFormSchema.safeParse(data)
    
    if (!result.success) {
      const zodErrors = result.error.issues.map(issue => issue.message)
      errors.push(...zodErrors)
    }

    return {
      success: result.success && errors.length === 0,
      data: result.success ? result.data : undefined,
      errors,
      securityIssues,
      sanitized,
    }
  } catch (error) {
    console.error('Validation error:', error)
    return {
      success: false,
      errors: ['Validation failed'],
      securityIssues: ['Validation exception'],
      sanitized: false,
    }
  }
}

/**
 * Validate password reset form
 */
export async function validateResetPasswordForm(
  formData: FormData | Record<string, unknown>,
  options: SecureValidationOptions = {}
): Promise<ValidationResult> {
  const opts = {
    requireCSRF: true,
    sanitizeInputs: true,
    checkMaliciousPatterns: true,
    ...options,
  }

  const errors: string[] = []
  const securityIssues: string[] = []
  let sanitized = false

  try {
    // Extract data
    let data: Record<string, unknown>
    if (formData instanceof FormData) {
      data = Object.fromEntries(formData.entries())
    } else {
      data = formData
    }

    // CSRF validation
    if (opts.requireCSRF) {
      const csrfToken = data.csrfToken || data['csrf-token']
      if (!csrfToken) {
        securityIssues.push('CSRF token missing')
        return {
          success: false,
          errors: ['Security token required'],
          securityIssues,
          sanitized: false,
        }
      }

      const csrfValid = await validateCSRFToken(String(csrfToken))
      if (!csrfValid) {
        securityIssues.push('CSRF token invalid')
        return {
          success: false,
          errors: ['Invalid security token'],
          securityIssues,
          sanitized: false,
        }
      }
    }

    // Sanitize inputs
    if (opts.sanitizeInputs) {
      data = sanitizeFormData(data as Record<string, FormFieldValue>, {
        email: { maxLength: 254, trim: true },
      })
      sanitized = true
    }

    // Validate with Zod schema
    const result = resetPasswordSchema.safeParse(data)
    
    if (!result.success) {
      const zodErrors = result.error.issues.map(issue => issue.message)
      errors.push(...zodErrors)
    }

    return {
      success: result.success && errors.length === 0,
      data: result.success ? result.data : undefined,
      errors,
      securityIssues,
      sanitized,
    }
  } catch (error) {
    console.error('Reset password validation error:', error)
    return {
      success: false,
      errors: ['Validation failed'],
      securityIssues: ['Validation exception'],
      sanitized: false,
    }
  }
}

/**
 * Validate new password form
 */
export async function validateNewPasswordForm(
  formData: FormData | Record<string, unknown>,
  options: SecureValidationOptions = {}
): Promise<ValidationResult> {
  const opts = {
    requireCSRF: true,
    sanitizeInputs: true,
    checkMaliciousPatterns: true,
    ...options,
  }

  const errors: string[] = []
  const securityIssues: string[] = []
  let sanitized = false

  try {
    // Extract data
    let data: Record<string, unknown>
    if (formData instanceof FormData) {
      data = Object.fromEntries(formData.entries())
    } else {
      data = formData
    }

    // CSRF validation
    if (opts.requireCSRF) {
      const csrfToken = data.csrfToken || data['csrf-token']
      if (!csrfToken) {
        securityIssues.push('CSRF token missing')
        return {
          success: false,
          errors: ['Security token required'],
          securityIssues,
          sanitized: false,
        }
      }

      const csrfValid = await validateCSRFToken(String(csrfToken))
      if (!csrfValid) {
        securityIssues.push('CSRF token invalid')
        return {
          success: false,
          errors: ['Invalid security token'],
          securityIssues,
          sanitized: false,
        }
      }
    }

    // Sanitize inputs
    if (opts.sanitizeInputs) {
      data = sanitizeFormData(data as Record<string, FormFieldValue>, {
        password: { maxLength: 128, trim: false },
      })
      sanitized = true
    }

    // Validate with Zod schema
    const result = newPasswordSchema.safeParse(data)
    
    if (!result.success) {
      const zodErrors = result.error.issues.map(issue => issue.message)
      errors.push(...zodErrors)
    }

    return {
      success: result.success && errors.length === 0,
      data: result.success ? result.data : undefined,
      errors,
      securityIssues,
      sanitized,
    }
  } catch (error) {
    console.error('New password validation error:', error)
    return {
      success: false,
      errors: ['Validation failed'],
      securityIssues: ['Validation exception'],
      sanitized: false,
    }
  }
}

/**
 * Generic secure form validation wrapper
 */
export async function validateSecureForm<T>(
  schema: z.ZodSchema<T>,
  formData: FormData | Record<string, unknown>,
  options: SecureValidationOptions = {}
): Promise<ValidationResult<T>> {
  const opts = {
    requireCSRF: false, // Default to false for generic forms
    sanitizeInputs: true,
    checkMaliciousPatterns: true,
    ...options,
  }

  const errors: string[] = []
  const securityIssues: string[] = []
  let sanitized = false

  try {
    // Extract data
    let data: Record<string, unknown>
    if (formData instanceof FormData) {
      data = Object.fromEntries(formData.entries())
    } else {
      data = formData
    }

    // CSRF validation if required
    if (opts.requireCSRF) {
      const csrfToken = data.csrfToken || data['csrf-token']
      if (!csrfToken) {
        securityIssues.push('CSRF token missing')
        return {
          success: false,
          errors: ['Security token required'],
          securityIssues,
          sanitized: false,
        }
      }

      const csrfValid = await validateCSRFToken(String(csrfToken))
      if (!csrfValid) {
        securityIssues.push('CSRF token invalid')
        return {
          success: false,
          errors: ['Invalid security token'],
          securityIssues,
          sanitized: false,
        }
      }
    }

    // Sanitize inputs
    if (opts.sanitizeInputs) {
      data = sanitizeFormData(data as Record<string, FormFieldValue>)
      sanitized = true
    }

    // Validate with provided schema
    const result = schema.safeParse(data)
    
    if (!result.success) {
      const zodErrors = result.error.issues.map(issue => issue.message)
      errors.push(...zodErrors)
    }

    return {
      success: result.success && errors.length === 0,
      data: result.success ? result.data : undefined,
      errors,
      securityIssues,
      sanitized,
    }
  } catch (error) {
    console.error('Secure form validation error:', error)
    return {
      success: false,
      errors: ['Validation failed'],
      securityIssues: ['Validation exception'],
      sanitized: false,
    }
  }
} 