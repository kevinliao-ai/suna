import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  directorWorkflowCases,
  getCasePlan,
  getCaseRecipes,
  getCasesForModels,
  getCasesForRecipe,
  getDirectorWorkflowCase,
} from '../src/lib/director-workflow-cases.ts';

test('publishes exactly six substantial and uniquely addressable workflow cases', () => {
  assert.equal(directorWorkflowCases.length, 6);
  assert.equal(new Set(directorWorkflowCases.map((item) => item.slug)).size, 6);

  for (const item of directorWorkflowCases) {
    assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(item.description.length >= 100);
    assert.ok(item.script.split('\n').length >= 3);
    assert.ok(item.constraints.length >= 3);
    assert.ok(item.decisions.length >= 3);
    assert.ok(item.verification.length >= 3);
    assert.ok(item.faq.length >= 2);
    assert.equal(getDirectorWorkflowCase(item.slug), item);
  }
});

test('each case resolves real Recipes into an exact multi-shot Director plan', () => {
  for (const item of directorWorkflowCases) {
    const recipes = getCaseRecipes(item);
    const plan = getCasePlan(item);
    assert.equal(recipes.length, item.recipeSlugs.length);
    assert.equal(plan.shots.length, recipes.length);
    for (const [index, recipe] of recipes.entries()) {
      assert.equal(plan.shots[index].camera, recipe.camera);
      assert.equal(plan.shots[index].durationSeconds, recipe.duration);
      assert.equal(plan.shots[index].visualPrompt, recipe.prompt);
    }
  }
});

test('recipe and model pages can discover contextual case links', () => {
  assert.ok(getCasesForRecipe('sword-draw-impact').some((item) => item.slug === 'anime-fight-scene-shot-plan'));
  assert.ok(getCasesForModels(['google-veo']).length >= 2);
});

test('case analytics use categorical IDs and never transmit creative content', async () => {
  const sources = await Promise.all([
    readFile(new URL('../src/components/cases/case-funnel-tracker.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/anime-director/director-planner.tsx', import.meta.url), 'utf8'),
  ]);
  const source = sources.join('\n');
  for (const event of ['director_case_viewed', 'director_case_start_clicked', 'director_case_loaded']) {
    assert.match(source, new RegExp(event));
  }
  assert.doesNotMatch(source, /posthog\.capture\([^)]*(email|prompt|script)/s);
});

test('public case copy clearly separates planning studies from provider benchmarks', async () => {
  const source = await readFile(
    new URL('../src/app/(home)/cases/[slug]/page.tsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /does not report third-party model quality/);
  assert.match(source, /Models to test—not assumed winners/);
});
