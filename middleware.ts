import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options } as CookieOptions & { name: string; value: string });
          });
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  return response;
}

// Matcher excludes static assets, images, and public error pages
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/auth-code-error|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 