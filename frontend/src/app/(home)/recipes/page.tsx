import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Film, Sparkles } from 'lucide-react';
import { RecipeDirectory } from '@/components/recipes/recipe-directory';
import { StructuredData } from '@/components/seo/structured-data';
import { animeShotRecipes } from '@/lib/anime-shot-recipes';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: '30 Anime Shot Recipes for AI Video Creators',
  description:
    'Browse 30 curated anime shot recipes with camera direction, prompts, timing, and production tips. Start a recipe in AniSora Director Planner.',
  alternates: { canonical: '/recipes' },
};

export default function RecipesPage() {
  return (
    <main>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Anime Shot Recipes',
          description: metadata.description,
          url: `${siteConfig.url}/recipes`,
          numberOfItems: animeShotRecipes.length,
        }}
      />
      <section className="border-b border-border bg-muted/30 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm">
            <BookOpen className="size-4 text-violet-600" /> Anime Shot Recipes
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Start with a shot that already has a production plan.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Thirty curated patterns for action, romance, fantasy, everyday
            scenes, and science fiction. Each recipe explains the camera move,
            generation prompt, timing, and why the shot works.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/auth?returnUrl=/dashboard/director"
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
            >
              <Sparkles className="size-4" /> Open Director Planner
            </Link>
            <Link
              href="/video-cost-calculator"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold"
            >
              Estimate a batch <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-violet-600">
                Curated library
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Find your next shot
              </h2>
            </div>
            <Film className="hidden size-8 text-muted-foreground sm:block" />
          </div>
          <RecipeDirectory />
        </div>
      </section>
    </main>
  );
}
