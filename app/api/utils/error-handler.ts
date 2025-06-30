import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiError {
  message: string
  error: string | object
  status: number
}

/**
 * Standard API error response format
 */
export function createErrorResponse(
  message: string,
  error: string | object = '',
  status: number = 500
): NextResponse {
  return NextResponse.json(
    {
      data: null,
      error,
      message,
    },
    { status }
  )
}

/**
 * Handle different types of errors and return appropriate responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return createErrorResponse(
      'Validation failed',
      error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      })),
      400
    )
  }

  // Authentication errors
  if (error instanceof Error && error.message.includes('Authentication')) {
    return createErrorResponse(
      'Authentication required',
      error.message,
      401
    )
  }

  // Database/Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string }
    
    switch (dbError.code) {
      case 'PGRST116': // Row not found
        return createErrorResponse('Resource not found', dbError.message, 404)
      case '23505': // Unique violation
        return createErrorResponse('Resource already exists', dbError.message, 409)
      case '23503': // Foreign key violation
        return createErrorResponse('Invalid reference', dbError.message, 400)
      default:
        return createErrorResponse('Database error', dbError.message, 500)
    }
  }

  // Generic error
  if (error instanceof Error) {
    return createErrorResponse(
      'Internal server error',
      error.message,
      500
    )
  }

  // Unknown error
  return createErrorResponse(
    'An unexpected error occurred',
    'Unknown error',
    500
  )
} 