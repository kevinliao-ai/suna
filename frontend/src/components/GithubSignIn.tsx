'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Icons } from './home/icons';
import { persistAuthReturnPath, sanitizeReturnPath } from '@/lib/auth-redirect';
import { useAuthMethodTracking } from '@/lib/stores/auth-tracking';
import { createClient } from '@/lib/supabase/client';

interface GitHubSignInProps {
  returnUrl?: string;
}

export default function GitHubSignIn({ returnUrl }: GitHubSignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { wasLastMethod, markAsUsed } = useAuthMethodTracking('github');
  const supabase = createClient();

  const handleGitHubSignIn = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const safeReturnUrl = sanitizeReturnPath(returnUrl);
      persistAuthReturnPath(safeReturnUrl);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      markAsUsed();
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sign in with GitHub',
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleGitHubSignIn}
        disabled={isLoading}
        className="w-full h-12 flex items-center justify-center text-sm font-medium tracking-wide rounded-full bg-background text-foreground border border-border hover:bg-accent/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-sans"
        aria-label={
          isLoading ? 'Signing in with GitHub...' : 'Sign in with GitHub'
        }
        type="button"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Icons.github className="w-4 h-4 mr-2" />
        )}
        <span className="font-medium">
          {isLoading ? 'Signing in...' : 'Continue with GitHub'}
        </span>
      </button>

      {wasLastMethod && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm">
          <div className="w-full h-full bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
