import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * useGoogleSignIn
 *
 * Provides a handler for Google sign-in using Supabase OAuth.
 * Manages loading and error state for UI integration.
 *
 * @returns {object} { signIn, isLoading, error }
 */
export function useGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { signIn, isLoading, error };
} 