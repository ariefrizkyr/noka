import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * useGoogleSignIn
 *
 * Provides a handler for Google sign-in using Supabase OAuth.
 * Manages loading and error state for UI integration.
 *
 * @param {string | null} redirectUrl - Optional redirect URL after authentication
 * @returns {object} { signIn, isLoading, error }
 */
export function useGoogleSignIn(redirectUrl?: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      // Build the callback URL with redirect parameter if provided
      const callbackUrl = redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`
        : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [redirectUrl]);

  return { signIn, isLoading, error };
} 