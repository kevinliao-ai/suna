import Link from 'next/link';
import { ArrowRight, WalletCards } from 'lucide-react';
import { VideoBudgetCalculator } from '@/components/video-intelligence/video-budget-calculator';
import { StructuredData } from '@/components/seo/structured-data';
import { siteConfig } from '@/lib/site';

export const metadata = {
  title: 'AI Video Cost Calculator',
  description:
    'Estimate AI video batch effort across leading creator models before choosing a provider or Studio workflow.',
  alternates: {
    canonical: '/video-cost-calculator',
  },
};

export default function VideoCostCalculatorPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <StructuredData
        type="tool"
        breadcrumbs={[
          { name: 'Home', url: siteConfig.url },
          {
            name: 'AI Video Cost Calculator',
            url: `${siteConfig.url}/video-cost-calculator`,
          },
        ]}
      />

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
            <WalletCards className="size-4" /> Creator budget planning
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Plan the batch before the render bill arrives.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Use this calculator to estimate relative effort for short AI video
            batches, then move the chosen workflow into AniSora Studio for project
            organization and paid workspace recovery.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/models"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-85"
            >
              Compare models <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/auth?returnUrl=/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-accent"
            >
              Open Studio
            </Link>
          </div>
        </div>
      </section>

      <VideoBudgetCalculator />

      <section className="px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Turn planning into a repeatable creative workflow.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Studio Pro is designed for cloud project organization, recovery, and
            cross-device access. External generation providers still control their
            own credits, rights, and availability.
          </p>
          <Link
            href="/pricing?source=cost-calculator"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            View Studio Pro pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
