'use client';

import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  animeShotRecipes,
  recipeGenres,
  recipeShotTypes,
} from '@/lib/anime-shot-recipes';

export function RecipeDirectory() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [shotType, setShotType] = useState('All');
  const recipes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return animeShotRecipes.filter(
      (recipe) =>
        (genre === 'All' || recipe.genre === genre) &&
        (shotType === 'All' || recipe.shotType === shotType) &&
        (!needle ||
          `${recipe.title} ${recipe.mood} ${recipe.genre} ${recipe.shotType}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [genre, query, shotType]);

  return (
    <>
      <div className="grid gap-3 rounded-xl border border-border bg-background p-4 md:grid-cols-[1fr_190px_190px]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search recipes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search mood, genre, or shot..."
            className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-violet-500"
          />
        </label>
        <label className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            aria-label="Filter by genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-border bg-background pl-10 pr-3 text-sm"
          >
            <option>All</option>
            {recipeGenres.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <select
          aria-label="Filter by shot type"
          value={shotType}
          onChange={(event) => setShotType(event.target.value)}
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option>All</option>
          {recipeShotTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">
        Showing {recipes.length} curated recipes
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <article
            key={recipe.slug}
            className="flex flex-col rounded-xl border border-border bg-background p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
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
            <h2 className="mt-4 text-xl font-semibold">{recipe.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {recipe.script}
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Camera
            </p>
            <p className="mt-1 text-sm">{recipe.camera}</p>
            <Link
              href={`/recipes/${recipe.slug}`}
              className="mt-6 inline-flex text-sm font-semibold text-violet-600 hover:text-violet-500"
            >
              Open recipe →
            </Link>
          </article>
        ))}
      </div>
      {recipes.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No recipe matches those filters. Try a broader search.
        </div>
      ) : null}
    </>
  );
}
