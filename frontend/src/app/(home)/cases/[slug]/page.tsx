import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Camera, Check, Clock, ExternalLink } from 'lucide-react';
import { CaseDirectorLink, CaseViewTracker } from '@/components/cases/case-funnel-tracker';
import { StructuredData } from '@/components/seo/structured-data';
import {
  directorWorkflowCases,
  getCasePlan,
  getCaseRecipes,
  getDirectorWorkflowCase,
} from '@/lib/director-workflow-cases';
import { getVideoModel } from '@/lib/video-intelligence';
import { siteConfig } from '@/lib/site';

interface CasePageProps { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return directorWorkflowCases.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const item = getDirectorWorkflowCase((await params).slug);
  if (!item) return {};
  return {
    title: `${item.title} - AI Anime Workflow Case`,
    description: item.description,
    alternates: { canonical: `/cases/${item.slug}` },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const item = getDirectorWorkflowCase((await params).slug);
  if (!item) notFound();
  const recipes = getCaseRecipes(item);
  const plan = getCasePlan(item);
  const models = item.modelSlugs.map(getVideoModel).filter(Boolean);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <CaseViewTracker slug={item.slug} shotCount={plan.shots.length} />
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: item.title,
        description: item.description,
        datePublished: '2026-08-13',
        dateModified: '2026-08-13',
        author: { '@type': 'Organization', name: 'AniSora Studio' },
        mainEntityOfPage: `${siteConfig.url}/cases/${item.slug}`,
        about: item.searchIntent,
      }} />
      <section className="border-b border-border bg-muted/30 px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <Link href="/cases" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> All workflow cases
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{item.eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{item.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{item.description}</p>
              <div className="mt-8"><CaseDirectorLink slug={item.slug} /></div>
            </div>
            <aside className="rounded-xl border border-border bg-background p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Method note</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This is a reproducible AniSora planning case. It does not report third-party model quality, success rates, or provider cost without a recorded output test.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Shots</dt><dd className="mt-1 font-semibold">{plan.shots.length}</dd></div>
                <div><dt className="text-muted-foreground">Runtime</dt><dd className="mt-1 font-semibold">{plan.estimatedSeconds}s</dd></div>
                <div><dt className="text-muted-foreground">Draft budget</dt><dd className="mt-1 font-semibold">{plan.estimatedTestRenders}</dd></div>
                <div><dt className="text-muted-foreground">Priority</dt><dd className="mt-1 font-semibold capitalize">{item.priority}</dd></div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-sm font-medium text-violet-600">Published input</p>
            <h2 className="mt-2 text-3xl font-semibold">Script and constraints</h2>
            <div className="mt-5 whitespace-pre-line rounded-xl border border-border bg-muted/30 p-5 text-sm leading-7">{item.script}</div>
            <h3 className="mt-7 text-lg font-semibold">Production constraints</h3>
            <ul className="mt-3 grid gap-2">
              {item.constraints.map((constraint) => <li key={constraint} className="flex gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{constraint}</li>)}
            </ul>
          </div>
          <aside className="h-fit rounded-xl border border-border p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Intended user</p>
            <p className="mt-2 text-sm leading-6">{item.audience}</p>
            <p className="mt-5 text-xs font-semibold uppercase text-muted-foreground">Research question</p>
            <p className="mt-2 text-sm leading-6">{item.searchIntent}</p>
          </aside>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-violet-600">Shot-by-shot plan</p>
          <h2 className="mt-2 text-3xl font-semibold">Recipes become editable production specifications</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {plan.shots.map((shot, index) => (
              <article key={shot.id} className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs text-violet-600">Shot {index + 1}</p><h3 className="mt-1 font-semibold">{recipes[index]?.title || shot.title}</h3></div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"><Clock className="size-3" />{shot.durationSeconds}s</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{shot.beat}</p>
                <div className="mt-4 flex gap-2 text-sm"><Camera className="mt-0.5 size-4 shrink-0 text-violet-600" /><span>{shot.camera}</span></div>
                {recipes[index] ? <Link href={`/recipes/${recipes[index].slug}`} className="mt-4 inline-flex text-xs font-semibold text-violet-600">Open source Recipe →</Link> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold">Editorial decisions</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {item.decisions.map((decision) => <article key={decision.title} className="rounded-xl border border-border p-5"><h3 className="font-semibold">{decision.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{decision.explanation}</p></article>)}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border border-border p-5">
              <h2 className="text-xl font-semibold">Verification checklist</h2>
              <ul className="mt-4 grid gap-3">{item.verification.map((step) => <li key={step} className="flex gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{step}</li>)}</ul>
            </article>
            <article className="rounded-xl border border-border p-5">
              <h2 className="text-xl font-semibold">Models to test—not assumed winners</h2>
              <div className="mt-4 grid gap-3">{models.map((model) => model ? <Link key={model.slug} href={`/models/${model.slug}`} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm font-medium">{model.provider} {model.name}<ExternalLink className="size-4" /></Link> : null)}</div>
              {item.comparisonSlug ? <Link href={`/compare/${item.comparisonSlug}`} className="mt-4 inline-flex text-sm font-semibold text-violet-600">Read the planning comparison →</Link> : null}
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold">Creator questions</h2>
          <div className="mt-6 grid gap-4">{item.faq.map((faq) => <article key={faq.question} className="rounded-xl border border-border p-5"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p></article>)}</div>
          <div className="mt-8 flex justify-center"><CaseDirectorLink slug={item.slug} /></div>
        </div>
      </section>
    </main>
  );
}
