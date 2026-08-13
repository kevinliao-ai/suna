'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import posthog from 'posthog-js';

export function CaseViewTracker({
  slug,
  shotCount,
}: {
  slug: string;
  shotCount: number;
}) {
  const captured = useRef(false);
  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    posthog.capture('director_case_viewed', {
      case_slug: slug,
      shot_count: shotCount,
    });
  }, [shotCount, slug]);
  return null;
}

export function CaseDirectorLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/dashboard/director?case=${slug}`}
      onClick={() =>
        posthog.capture('director_case_start_clicked', {
          case_slug: slug,
          destination: 'director',
        })
      }
      className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
    >
      <Sparkles className="size-4" /> Load the complete plan in Director
      <ArrowRight className="size-4" />
    </Link>
  );
}
