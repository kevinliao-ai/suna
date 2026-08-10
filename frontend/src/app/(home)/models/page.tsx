import Link from 'next/link';
import { ArrowRight, BadgeCheck, CircleDollarSign, ExternalLink, Gauge, Layers, SlidersHorizontal } from 'lucide-react';
import { StructuredData } from '@/components/seo/structured-data';
import { siteConfig } from '@/lib/site';
import { videoModelComparisons, videoModels, videoModelUseCases } from '@/lib/video-intelligence';

export const metadata = {
  title: 'AI Video Model Directory',
  description:
    'Compare active AI video models for anime scenes, creator workflows, and production planning.',
  alternates: {
    canonical: '/models',
  },
};

const statusLabel = {
  active: 'Active',
  legacy: 'Legacy',
  watchlist: 'Watchlist',
};

export default function ModelsPage() {
  const activeModels = videoModels.filter((model) => model.status === 'active');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <StructuredData
        type="article"
        breadcrumbs={[
          { name: 'Home', url: siteConfig.url },
          { name: 'AI Video Model Directory', url: `${siteConfig.url}/models` },
        ]}
      />

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
              Video Intelligence
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Choose the right AI video model before you spend credits.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              AniSora tracks model strengths, access patterns, and workflow fit so
              creators can plan anime scenes, ad variants, and reference-driven
              video experiments with less guesswork.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/video-cost-calculator"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-85"
              >
                Open cost calculator <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-accent"
              >
                Upgrade Studio workflow
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <article className="rounded-lg border border-border p-5">
              <Layers className="size-5 text-violet-600" />
              <p className="mt-4 text-2xl font-semibold">{videoModels.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Tracked models</p>
            </article>
            <article className="rounded-lg border border-border p-5">
              <BadgeCheck className="size-5 text-emerald-600" />
              <p className="mt-4 text-2xl font-semibold">{activeModels.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Active integration candidates</p>
            </article>
            <article className="rounded-lg border border-border p-5">
              <SlidersHorizontal className="size-5 text-sky-600" />
              <p className="mt-4 text-2xl font-semibold">{videoModelComparisons.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Comparison guides</p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {videoModelUseCases.map((item) => (
            <article key={item.title} className="rounded-lg border border-border bg-background p-5">
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                Market map
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Model profiles
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Scores are planning weights, not official benchmarks. Provider
              pricing, rights, and rate limits should be verified before any paid
              batch or production integration.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {videoModels.map((model) => (
              <article key={model.slug} className="rounded-lg border border-border bg-background p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{model.provider}</p>
                    <h3 className="mt-1 text-xl font-semibold">{model.name}</h3>
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                    {statusLabel[model.status]}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {model.summary}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Best for</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {model.bestFor.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Watchouts</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {model.watchouts.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                    <Gauge className="size-3" /> Quality {model.planningQuality}/5
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                    <SlidersHorizontal className="size-3" /> Control {model.planningControl}/5
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                    <CircleDollarSign className="size-3" /> Cost {model.planningCost}/5
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-4">
                  <Link
                    href={`/models/${model.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-500"
                  >
                    Read profile <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href={model.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Official source <ExternalLink className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
              Comparison guides
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              High-intent model decisions
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {videoModelComparisons.map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/compare/${comparison.slug}`}
                className="rounded-lg border border-border p-5 transition hover:bg-accent"
              >
                <h3 className="text-lg font-semibold">{comparison.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {comparison.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
