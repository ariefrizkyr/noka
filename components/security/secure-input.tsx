'use client'

import { forwardRef, useCallback, useRef, useImperativeHandle } from 'react'
import { Input } from '@/components/ui/input'
import { detectMaliciousPatterns, sanitizeEmail, sanitizePassword, sanitizeString } from '@/lib/security/sanitization-client'
import { cn } from '@/lib/utils'

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Type of input for specialized sanitization
   */
  secureType?: 'email' | 'password' | 'text'
  
  /**
   * Whether to sanitize input in real-time
   * @default true
   */
  sanitize?: boolean
  
  /**
   * Whether to block malicious patterns
   * @default true
   */
  blockMalicious?: boolean
  
  /**
   * Custom sanitization options
   */
  sanitizeOptions?: {
    maxLength?: number
    allowHTML?: boolean
    trim?: boolean
  }
  
  /**
   * Callback when malicious content is detected
   */
  onMaliciousDetected?: (patterns: string[]) => void
  
  /**
   * Callback when input is sanitized
   */
  onSanitized?: (original: string, sanitized: string) => void
}

/**
 * Secure input component that automatically sanitizes user input
 * while maintaining the existing UI/UX
 */
export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({
    secureType = 'text',
    sanitize = true,
    blockMalicious = true,
    sanitizeOptions = {},
    onMaliciousDetected,
    onSanitized,
    onChange,
    className,
    ...props
  }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const originalValue = e.target.value
      let sanitizedValue = originalValue

      if (sanitize && originalValue) {
        // Check for malicious patterns first
        if (blockMalicious) {
          const maliciousCheck = detectMaliciousPatterns(originalValue)
          if (maliciousCheck.isSuspicious) {
            onMaliciousDetected?.(maliciousCheck.patterns)
            // Prevent the input from changing if malicious
            e.preventDefault()
            return
          }
        }

        // Apply type-specific sanitization
        switch (secureType) {
          case 'email':
            sanitizedValue = sanitizeEmail(originalValue)
            break
          case 'password':
            sanitizedValue = sanitizePassword(originalValue)
            break
          default:
            sanitizedValue = sanitizeString(originalValue, sanitizeOptions)
            break
        }

        // If value changed due to sanitization, update the input
        if (sanitizedValue !== originalValue) {
          onSanitized?.(originalValue, sanitizedValue)
          
          // Update the input value
          e.target.value = sanitizedValue
          
          // Create a new event with the sanitized value
          const sanitizedEvent = {
            ...e,
            target: {
              ...e.target,
              value: sanitizedValue,
            },
          } as React.ChangeEvent<HTMLInputElement>
          
          onChange?.(sanitizedEvent)
          return
        }
      }

      // Call original onChange if no sanitization was needed
      onChange?.(e)
    }, [secureType, sanitize, blockMalicious, sanitizeOptions, onMaliciousDetected, onSanitized, onChange])

    return (
      <Input
        ref={inputRef}
        onChange={handleInputChange}
        className={cn(className)}
        {...props}
      />
    )
  }
)

SecureInput.displayName = 'SecureInput'

/**
 * Specialized secure email input
 */
export const SecureEmailInput = forwardRef<HTMLInputElement, Omit<SecureInputProps, 'secureType'>>(
  (props, ref) => (
    <SecureInput
      ref={ref}
      secureType="email"
      type="email"
      {...props}
    />
  )
)

SecureEmailInput.displayName = 'SecureEmailInput'

/**
 * Specialized secure password input
 */
export const SecurePasswordInput = forwardRef<HTMLInputElement, Omit<SecureInputProps, 'secureType'>>(
  (props, ref) => (
    <SecureInput
      ref={ref}
      secureType="password"
      type="password"
      {...props}
    />
  )
)

SecurePasswordInput.displayName = 'SecurePasswordInput' 