'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import posthog from 'posthog-js';

export function RecipePlannerLink({ slug }: { slug: string }) {
  const returnUrl = `/dashboard/director?recipe=${slug}`;
  return (
    <Link
      href={returnUrl}
      onClick={() =>
        posthog.capture('recipe_start_clicked', {
          recipe_slug: slug,
          destination: 'director',
        })
      }
      className="mt-7 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
    >
      <Sparkles className="size-4" /> Build this exact shot in Director{' '}
      <ArrowRight className="size-4" />
    </Link>
  );
}
