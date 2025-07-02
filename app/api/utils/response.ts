import { NextResponse } from 'next/server'

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | object | null
  message: string
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      error: null,
      message,
    },
    { status }
  )
}

/**
 * Create response for resource creation
 */
export function createCreatedResponse<T>(
  data: T,
  message: string = 'Resource created successfully'
): NextResponse<ApiResponse<T>> {
  return createSuccessResponse(data, message, 201)
}

/**
 * Create response for successful updates
 */
export function createUpdatedResponse<T>(
  data: T,
  message: string = 'Resource updated successfully'
): NextResponse<ApiResponse<T>> {
  return createSuccessResponse(data, message, 200)
}

/**
 * Create response for successful deletions
 */
export function createDeletedResponse(
  message: string = 'Resource deleted successfully'
): NextResponse<ApiResponse<null>> {
  return createSuccessResponse(null, message, 200)
} 