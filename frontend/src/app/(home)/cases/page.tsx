import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FlaskConical } from 'lucide-react';
import { StructuredData } from '@/components/seo/structured-data';
import { directorWorkflowCases, getCasePlan } from '@/lib/director-workflow-cases';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'AI Anime Director Workflow Cases',
  description:
    'Study six reproducible anime production plans with scripts, shot lists, camera decisions, verification checks, and editable AniSora Director handoffs.',
  alternates: { canonical: '/cases' },
};

export default function CaseDirectoryPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'AniSora Director Workflow Cases',
          description: metadata.description,
          url: `${siteConfig.url}/cases`,
          hasPart: directorWorkflowCases.map((item) => ({
            '@type': 'Article',
            name: item.title,
            url: `${siteConfig.url}/cases/${item.slug}`,
          })),
        }}
      />
      <section className="border-b border-border bg-muted/30 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
              Reproducible planning studies
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              See how an anime idea becomes a controlled shot list.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Six editorial cases publish the input script, selected Recipes,
              camera logic, expected draft count, and review criteria. They are
              planning studies—not unsupported claims about provider output.
            </p>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="flex gap-2"><FlaskConical className="size-4 shrink-0 text-violet-600" /> Inputs and method disclosed</div>
            <div className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> Verification checklist included</div>
            <div className="flex gap-2"><ArrowRight className="size-4 shrink-0 text-sky-600" /> Complete plan loads into Director</div>
          </div>
        </div>
      </section>
      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {directorWorkflowCases.map((item) => {
            const plan = getCasePlan(item);
            return (
              <article key={item.slug} className="rounded-2xl border border-border p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
                  {item.eyebrow}
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-3 py-1">{plan.shots.length} shots</span>
                  <span className="rounded-full bg-muted px-3 py-1">{plan.estimatedSeconds}s planned</span>
                  <span className="rounded-full bg-muted px-3 py-1">{plan.estimatedTestRenders} draft budget</span>
                </div>
                <Link href={`/cases/${item.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600">
                  Study the workflow <ArrowRight className="size-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
