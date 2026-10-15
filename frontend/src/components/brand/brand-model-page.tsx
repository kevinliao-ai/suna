import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

import { StructuredData } from '@/components/seo/structured-data';
import { VideoSeoFaqSection } from '@/components/video-intelligence/video-seo-sections';
import { brandPages, type BrandPage } from '@/lib/anisora-brand-pages';
import { siteConfig } from '@/lib/site';

export function brandPageMetadata(page: BrandPage) {
  return {
    title: { absolute: page.metaTitle },
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: `/${page.slug}`,
      type: 'article',
    },
  };
}

export function BrandModelPage({ page }: { page: BrandPage }) {
  const related = brandPages.filter((item) => item.slug !== page.slug);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <StructuredData
        type="article"
        breadcrumbs={[
          { name: 'Home', url: siteConfig.url },
          { name: page.keyword, url: `${siteConfig.url}/${page.slug}` },
        ]}
        faq={page.faq}
      />

      <section className="px-6 py-14 sm:py-18">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Independent guide · Updated {page.updatedAt}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {page.heading}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {page.intro}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#quick-generator"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/90"
            >
              Try anime image-to-video online <ArrowRight className="size-4" />
            </Link>
            <a
              href={page.sources[0].url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-accent"
            >
              Official repository <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 px-6 py-10">
        <dl className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.facts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-lg border border-border bg-background p-4"
            >
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="mt-1 text-base font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <article className="px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-base leading-7 text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.code ? (
                <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm leading-6">
                  <code>{section.code}</code>
                </pre>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      <VideoSeoFaqSection items={page.faq} />

      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Related guides</h2>
            <ul className="mt-4 space-y-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/${item.slug}`}
                    className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
                  >
                    {item.metaTitle}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/models"
                  className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
                >
                  Compare AI video models
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Sources</h2>
            <ul className="mt-4 space-y-2">
              {page.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {source.label} <ExternalLink className="size-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
