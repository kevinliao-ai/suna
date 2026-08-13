'use client';

import { useEffect, useRef } from 'react';
import posthog from 'posthog-js';

export function RecipeFunnelTracker({
  event,
  properties,
}: {
  event:
    'recipe_directory_viewed' | 'recipe_collection_viewed' | 'recipe_viewed';
  properties?: Record<string, string | number>;
}) {
  const captured = useRef(false);
  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    posthog.capture(event, properties);
  }, [event, properties]);

  return null;
}

export function CollectionPlannerLink({ slug }: { slug: string }) {
  return (
    <a
      href={`/auth?returnUrl=${encodeURIComponent('/dashboard/director')}`}
      onClick={() =>
        posthog.capture('recipe_collection_start_clicked', {
          collection_slug: slug,
          destination: 'director',
        })
      }
      className="mt-8 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
    >
      Build a shot plan →
    </a>
  );
}
