'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export const PostHogIdentify = () => {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    const supabase = createClient();
    const listener = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        posthog.identify(session.user.id, { email: session.user.email });
      } else {
        posthog.reset();
      }
    });

    return () => {
      listener.data.subscription.unsubscribe();
    };
  }, []);

  return null;
};
