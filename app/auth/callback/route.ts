import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';
  const origin = url.origin;

  if (!code) {
    // Redirect to a specific error page for missing code
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=missing_code`);
  }

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth callback error:', error.message);
      // Redirect to error page with error message as query param (encoded)
      const errorMsg = encodeURIComponent(error.message || 'unknown_error');
      return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exchange_failed&message=${errorMsg}`);
    }
    // Success: redirect to dashboard or next
    return NextResponse.redirect(`${origin}${next}`);
  } catch (err: unknown) {
    console.error('Auth callback unexpected error:', (err as Error)?.message || err);
    const errorMsg = encodeURIComponent((err as Error)?.message || 'unexpected_error');
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exchange_failed&message=${errorMsg}`);
  }
} 