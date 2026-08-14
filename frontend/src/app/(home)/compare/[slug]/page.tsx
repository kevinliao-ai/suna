import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { StructuredData } from '@/components/seo/structured-data';
import { VideoConversionSection, VideoSeoFaqSection } from '@/components/video-intelligence/video-seo-sections';
import { siteConfig } from '@/lib/site';
import { getComparisonFaq, getModelsForComparison, getVideoModelComparison, videoModelComparisons } from '@/lib/video-intelligence';
import { getCasesForModels } from '@/lib/director-workflow-cases';
import { RelatedCaseLinks } from '@/components/cases/related-case-links';

interface ComparisonPageProps {
  params: Promise<{ slug: string }>;
}

const rows = [
  { label: 'Best fit', value: 'bestFor' },
  { label: 'Inputs', value: 'inputs' },
  { label: 'Outputs', value: 'outputs' },
  { label: 'Watchouts', value: 'watchouts' },
] as const;

export function generateStaticParams() {
  return videoModelComparisons.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({ params }: ComparisonPageProps) {
  const { slug } = await params;
  const comparison = getVideoModelComparison(slug);

  if (!comparison) {
    return {};
  }

  return {
    title: comparison.title,
    description: comparison.summary,
    alternates: {
      canonical: `/compare/${comparison.slug}`,
    },
  };
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { slug } = await params;
  const comparison = getVideoModelComparison(slug);

  if (!comparison) {
    notFound();
  }

  const models = getModelsForComparison(comparison);
  const faq = getComparisonFaq(comparison);
  const workflowCases = getCasesForModels([...comparison.modelSlugs]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <StructuredData
        type="article"
        breadcrumbs={[
          { name: 'Home', url: siteConfig.url },
          { name: 'AI Video Models', url: `${siteConfig.url}/models` },
          { name: comparison.title, url: `${siteConfig.url}/compare/${comparison.slug}` },
        ]}
        faq={faq}
      />

      <section className="px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/models"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to model directory
          </Link>

          <div className="mt-8 max-w-4xl">
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
              Video model comparison
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
              {comparison.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {comparison.summary}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/video-cost-calculator"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-85"
              >
                Estimate batch cost <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/pricing?source=model-comparison"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-accent"
              >
                Upgrade Studio workflow
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {models.map((model) => (
            <article key={model.slug} className="rounded-lg border border-border bg-background p-5">
              <p className="text-sm text-muted-foreground">{model.provider}</p>
              <h2 className="mt-1 text-2xl font-semibold">{model.name}</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {model.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-3 py-1">Quality {model.planningQuality}/5</span>
                <span className="rounded-full bg-muted px-3 py-1">Control {model.planningControl}/5</span>
                <span className="rounded-full bg-muted px-3 py-1">Speed {model.planningSpeed}/5</span>
                <span className="rounded-full bg-muted px-3 py-1">Cost {model.planningCost}/5</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[140px_1fr_1fr] border-b border-border bg-muted/30 text-sm font-semibold">
            <div className="p-4">Criteria</div>
            {models.map((model) => (
              <div key={model.slug} className="border-l border-border p-4">
                {model.provider} {model.name}
              </div>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[140px_1fr_1fr] border-b border-border last:border-b-0">
              <div className="bg-muted/20 p-4 text-sm font-medium">{row.label}</div>
              {models.map((model) => (
                <div key={model.slug} className="border-l border-border p-4 text-sm leading-6 text-muted-foreground">
                  {model[row.value].join(', ')}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
              Recommendation
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">How to decide</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {comparison.decision}
            </p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {comparison.intent} Verify live pricing, rights, and model limits before committing a paid production batch.
            </p>
          </div>
          <aside className="rounded-lg border border-border bg-muted/30 p-5">
            <h3 className="text-base font-semibold">Official sources</h3>
            <div className="mt-4 grid gap-3">
              {models.map((model) => (
                <a
                  key={model.slug}
                  href={model.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-accent"
                >
                  {model.provider} <ExternalLink className="size-4" />
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <VideoConversionSection
        title={`Turn the ${comparison.title} decision into a testable batch.`}
        description="Use AniSora to estimate the batch, choose a provider, and keep your model decision attached to prompts, references, and project tasks."
      />

      <VideoSeoFaqSection items={faq} />
      <RelatedCaseLinks items={workflowCases} title={`Test ${comparison.title} with a defined shot plan`} />
    </main>
  );
}
