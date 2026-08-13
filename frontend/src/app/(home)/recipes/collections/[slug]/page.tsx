import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, TriangleAlert } from 'lucide-react';
import {
  CollectionPlannerLink,
  RecipeFunnelTracker,
} from '@/components/recipes/recipe-funnel-tracker';
import { StructuredData } from '@/components/seo/structured-data';
import {
  animeShotCollections,
  getAnimeShotCollection,
  getCollectionRecipes,
  getRelatedCollections,
} from '@/lib/anime-shot-collections';
import { siteConfig } from '@/lib/site';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return animeShotCollections.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const collection = getAnimeShotCollection((await params).slug);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `/recipes/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = getAnimeShotCollection((await params).slug);
  if (!collection) notFound();
  const recipes = getCollectionRecipes(collection);
  const related = getRelatedCollections(collection);

  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: collection.title,
        description: collection.description,
        url: `${siteConfig.url}/recipes/collections/${collection.slug}`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: recipes.length,
          itemListElement: recipes.map((recipe, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: recipe.title,
            url: `${siteConfig.url}/recipes/${recipe.slug}`,
          })),
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: collection.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  return (
    <main>
      <StructuredData data={schemas} />
      <RecipeFunnelTracker
        event="recipe_collection_viewed"
        properties={{
          collection_slug: collection.slug,
          recipe_count: recipes.length,
        }}
      />
      <section className="border-b border-border bg-muted/30 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All anime shot recipes
          </Link>
          <p className="mt-8 text-sm font-medium text-violet-600 dark:text-violet-400">
            {collection.eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {collection.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {collection.description}
          </p>
          <p className="mt-6 max-w-3xl border-l-2 border-violet-500 pl-5 text-sm leading-7 text-muted-foreground">
            {collection.editorial}
          </p>
          <CollectionPlannerLink slug={collection.slug} />
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-violet-600">
            Selected patterns
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {recipes.length} recipes for this intent
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {recipes.map((recipe) => (
              <article
                key={recipe.slug}
                className="rounded-xl border border-border p-5"
              >
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-violet-700 dark:text-violet-300">
                    {recipe.genre}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1">
                    {recipe.shotType}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1">
                    {recipe.duration}s
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">{recipe.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {recipe.whyItWorks}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Camera
                </p>
                <p className="mt-1 text-sm">{recipe.camera}</p>
                <Link
                  href={`/recipes/${recipe.slug}`}
                  className="mt-5 inline-flex text-sm font-semibold text-violet-600 hover:text-violet-500"
                >
                  Open full recipe →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 px-6 py-14">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-background p-6">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <h2 className="mt-4 text-xl font-semibold">Planning rules</h2>
            <ul className="mt-4 grid gap-3">
              {collection.planningRules.map((rule) => (
                <li
                  key={rule}
                  className="text-sm leading-6 text-muted-foreground"
                >
                  • {rule}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-border bg-background p-6">
            <TriangleAlert className="size-5 text-amber-600" />
            <h2 className="mt-4 text-xl font-semibold">Common failure modes</h2>
            <ul className="mt-4 grid gap-3">
              {collection.commonMistakes.map((mistake) => (
                <li
                  key={mistake}
                  className="text-sm leading-6 text-muted-foreground"
                >
                  • {mistake}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Creator questions
          </h2>
          <div className="mt-6 grid gap-3">
            {collection.faq.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-border p-5"
              >
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
          <h2 className="mt-14 text-2xl font-semibold">
            Explore another collection
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/recipes/collections/${item.slug}`}
                className="rounded-xl border border-border p-5 transition hover:bg-muted/40"
              >
                <p className="text-xs text-violet-600">{item.eyebrow}</p>
                <h3 className="mt-2 font-semibold">{item.shortTitle}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
