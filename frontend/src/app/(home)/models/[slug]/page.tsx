import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ExternalLink, Gauge, SlidersHorizontal, Timer, WalletCards } from 'lucide-react';
import { StructuredData } from '@/components/seo/structured-data';
import { siteConfig } from '@/lib/site';
import { getModelFitScore, getVideoModel, videoModelComparisons, videoModels } from '@/lib/video-intelligence';

interface ModelDetailPageProps {
  params: Promise<{ slug: string }>;
}

const statusLabel = {
  active: 'Active integration candidate',
  legacy: 'Legacy reference',
  watchlist: 'Watchlist',
};

const scoreCards = [
  { key: 'planningQuality', label: 'Quality', icon: Gauge },
  { key: 'planningControl', label: 'Control', icon: SlidersHorizontal },
  { key: 'planningSpeed', label: 'Speed', icon: Timer },
  { key: 'planningCost', label: 'Cost', icon: WalletCards },
] as const;

export function generateStaticParams() {
  return videoModels.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: ModelDetailPageProps) {
  const { slug } = await params;
  const model = getVideoModel(slug);

  if (!model) {
    return {};
  }

  return {
    title: `${model.provider} ${model.name} AI Video Model`,
    description: `${model.summary} Compare ${model.name} use cases, inputs, watchouts, and AniSora planning fit.`,
    alternates: {
      canonical: `/models/${model.slug}`,
    },
  };
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { slug } = await params;
  const model = getVideoModel(slug);

  if (!model) {
    notFound();
  }

  const relatedComparisons = videoModelComparisons.filter((comparison) =>
    comparison.modelSlugs.includes(model.slug),
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <StructuredData
        type="article"
        breadcrumbs={[
          { name: 'Home', url: siteConfig.url },
          { name: 'AI Video Models', url: `${siteConfig.url}/models` },
          { name: model.name, url: `${siteConfig.url}/models/${model.slug}` },
        ]}
      />

      <section className="px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/models"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to model directory
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                {model.provider}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                {model.name} for AI video planning
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {model.summary}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/video-cost-calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-85"
                >
                  Estimate a batch <ArrowRight className="size-4" />
                </Link>
                <a
                  href={model.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-accent"
                >
                  Official source <ExternalLink className="size-4" />
                </a>
              </div>
            </div>

            <aside className="rounded-lg border border-border bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Planning status</p>
              <p className="mt-2 text-lg font-semibold">{statusLabel[model.status]}</p>
              <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">AniSora fit score</p>
              <p className="mt-2 text-3xl font-semibold">{getModelFitScore(model)}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Internal planning score based on quality, control, speed, and cost.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scoreCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.key} className="rounded-lg border border-border bg-background p-5">
                <Icon className="size-5 text-violet-600" />
                <p className="mt-4 text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold">{model[card.key]}/5</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          <article className="rounded-lg border border-border p-5">
            <h2 className="text-lg font-semibold">Best for</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
              {model.bestFor.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-lg border border-border p-5">
            <h2 className="text-lg font-semibold">Inputs and outputs</h2>
            <p className="mt-4 text-sm font-medium">Inputs</p>
            <p className="mt-1 text-sm text-muted-foreground">{model.inputs.join(', ')}</p>
            <p className="mt-4 text-sm font-medium">Outputs</p>
            <p className="mt-1 text-sm text-muted-foreground">{model.outputs.join(', ')}</p>
          </article>
          <article className="rounded-lg border border-border p-5">
            <h2 className="text-lg font-semibold">Watchouts</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
              {model.watchouts.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {relatedComparisons.length ? (
        <section className="border-t border-border px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold tracking-tight">Related comparisons</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relatedComparisons.map((comparison) => (
                <Link
                  key={comparison.slug}
                  href={`/compare/${comparison.slug}`}
                  className="rounded-lg border border-border p-5 transition hover:bg-accent"
                >
                  <p className="text-base font-semibold">{comparison.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {comparison.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
