import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createAnimeDirectorPlan } from '../src/lib/anime-director.ts';

test('a recipe seeds the exact first-shot production specification', () => {
  const plan = createAnimeDirectorPlan({
    script: 'The hero reaches the rooftop edge.',
    projectTitle: 'Rooftop reveal',
    style: 'cinematic anime',
    priority: 'control',
    seedShot: {
      camera: 'low-angle crane up from boots to silhouette',
      durationSeconds: 5,
      visualPrompt: 'Exact curated recipe prompt.',
      checklist: ['Lock the costume silhouette before animating.'],
    },
  });

  assert.equal(plan.shots[0].camera, 'low-angle crane up from boots to silhouette');
  assert.equal(plan.shots[0].durationSeconds, 5);
  assert.equal(plan.shots[0].visualPrompt, 'Exact curated recipe prompt.');
  assert.equal(
    plan.shots[0].checklist[0],
    'Lock the costume silhouette before animating.',
  );
});

test('recipe links enter Director directly and rely on auth middleware to preserve intent', async () => {
  const source = await readFile(
    new URL('../src/components/recipes/recipe-planner-link.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /href=\{returnUrl\}/);
  assert.match(source, /\/dashboard\/director\?recipe=/);
  assert.doesNotMatch(source, /href=\{`\/auth\?/);
});

test('saved Director projects retain recipe attribution without storing user content in analytics', async () => {
  const repository = await readFile(
    new URL('../src/lib/anime-director-projects.ts', import.meta.url),
    'utf8',
  );
  const planner = await readFile(
    new URL('../src/components/anime-director/director-planner.tsx', import.meta.url),
    'utf8',
  );

  assert.match(repository, /sourceRecipeSlug/);
  assert.match(planner, /director_recipe_loaded/);
  assert.match(planner, /director_post_save_upgrade_clicked/);
  assert.doesNotMatch(planner, /posthog\.capture\([^)]*(email|prompt|script)/s);
});
