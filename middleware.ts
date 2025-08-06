import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createRateLimitMiddleware } from './lib/security/rate-limit'
import { setCSRFTokens } from './lib/security/csrf'

export async function middleware(request: NextRequest) {
  // Apply rate limiting first for auth endpoints
  const pathname = request.nextUrl.pathname
  
  if (pathname.startsWith('/auth/') && request.method === 'POST') {
    let endpoint = ''
    if (pathname.includes('/login')) endpoint = 'login'
    else if (pathname.includes('/register')) endpoint = 'register'
    else if (pathname.includes('/reset-password')) endpoint = 'reset-password'
    
    if (endpoint) {
      const rateLimitResponse = createRateLimitMiddleware(endpoint)(request)
      if (rateLimitResponse) {
        return rateLimitResponse
      }
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Add security headers
  const headers = new Headers(supabaseResponse.headers)
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.supabase.co",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  headers.set('Content-Security-Policy', csp)
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
            headers,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Set CSRF tokens for auth pages that don't have a user
  if (!user && pathname.startsWith('/auth/')) {
    try {
      await setCSRFTokens()
    } catch (error) {
      console.error('Failed to set CSRF tokens:', error)
    }
  }

  // Handle authentication and onboarding flow
  if (user) {
    // Check onboarding status for authenticated users
    if (pathname.startsWith('/dashboard') || pathname === '/') {
      try {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        // If onboarding not completed, redirect to onboarding
        if (!settings?.onboarding_completed) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        // If error checking onboarding (e.g., no settings exist), redirect to onboarding
        if (pathname.startsWith('/dashboard') || pathname === '/') {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }
      }
    }

    // If user is authenticated and onboarding completed, don't allow access to auth pages
    if (pathname.startsWith('/auth/') && !pathname.includes('/callback')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } else {
    // No user - redirect protected routes to login
    if (
      !pathname.startsWith('/auth') &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/invitations') && // Allow invitation pages for token validation
      pathname !== '/' &&
      pathname !== '/legal/privacy-policy' &&
      pathname !== '/legal/terms-of-service'
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

// Matcher excludes static assets, images, and public error pages
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/auth-code-error|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 