import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Camera, Clock } from 'lucide-react';
import { StructuredData } from '@/components/seo/structured-data';
import { RecipePlannerLink } from '@/components/recipes/recipe-planner-link';
import { RecipeFunnelTracker } from '@/components/recipes/recipe-funnel-tracker';
import {
  animeShotRecipes,
  getAnimeShotRecipe,
  getRelatedRecipes,
} from '@/lib/anime-shot-recipes';
import { siteConfig } from '@/lib/site';

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return animeShotRecipes.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const recipe = getAnimeShotRecipe((await params).slug);
  if (!recipe) return {};
  return {
    title: `${recipe.title} Anime Shot Recipe`,
    description: `${recipe.script} Get the camera direction, AI video prompt, timing, and production tips.`,
    alternates: { canonical: `/recipes/${recipe.slug}` },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipe = getAnimeShotRecipe((await params).slug);
  if (!recipe) notFound();
  const related = getRelatedRecipes(recipe);
  return (
    <main>
      <RecipeFunnelTracker
        event="recipe_viewed"
        properties={{
          recipe_slug: recipe.slug,
          genre: recipe.genre,
          shot_type: recipe.shotType,
        }}
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: recipe.title,
          description: recipe.script,
          totalTime: `PT${recipe.duration}S`,
          step: [
            {
              '@type': 'HowToStep',
              name: 'Set the scene beat',
              text: recipe.script,
            },
            {
              '@type': 'HowToStep',
              name: 'Plan the camera',
              text: recipe.camera,
            },
            {
              '@type': 'HowToStep',
              name: 'Generate a controlled draft',
              text: recipe.prompt,
            },
          ],
          url: `${siteConfig.url}/recipes/${recipe.slug}`,
        }}
      />
      <section className="border-b border-border bg-muted/30 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All recipes
          </Link>
          <div className="mt-7 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-violet-700 dark:text-violet-300">
              {recipe.genre}
            </span>
            <span className="rounded-full bg-background px-3 py-1.5">
              {recipe.shotType}
            </span>
            <span className="rounded-full bg-background px-3 py-1.5">
              {recipe.mood}
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            {recipe.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {recipe.script}
          </p>
          <RecipePlannerLink slug={recipe.slug} />
        </div>
      </section>
      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-6">
            <article className="rounded-xl border border-border p-6">
              <h2 className="text-2xl font-semibold">Generation prompt</h2>
              <p className="mt-4 rounded-lg bg-muted p-5 text-sm leading-7">
                {recipe.prompt}
              </p>
            </article>
            <article className="rounded-xl border border-border p-6">
              <h2 className="text-2xl font-semibold">Why this shot works</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                {recipe.whyItWorks}
              </p>
              <h3 className="mt-6 font-semibold">Production tips</h3>
              <ul className="mt-3 grid gap-2">
                {recipe.tips.map((tip) => (
                  <li key={tip} className="text-sm text-muted-foreground">
                    • {tip}
                  </li>
                ))}
              </ul>
            </article>
          </div>
          <aside className="h-fit rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-center gap-2">
              <Camera className="size-4 text-violet-600" />
              <span className="text-sm font-semibold">Camera</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {recipe.camera}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Clock className="size-4 text-violet-600" />
              <span className="text-sm font-semibold">Target duration</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {recipe.duration} seconds · optimize for {recipe.priority}
            </p>
            <h3 className="mt-6 text-sm font-semibold">Visual style</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {recipe.style}
            </p>
          </aside>
        </div>
      </section>
      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold">Related shot recipes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/recipes/${item.slug}`}
                className="rounded-xl border border-border p-5 transition hover:bg-muted/40"
              >
                <p className="text-xs text-violet-600">
                  {item.genre} · {item.shotType}
                </p>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.camera}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
