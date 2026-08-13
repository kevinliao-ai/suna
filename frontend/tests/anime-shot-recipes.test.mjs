import assert from 'node:assert/strict';
import test from 'node:test';

import {
  animeShotRecipes,
  getAnimeShotRecipe,
  getRelatedRecipes,
} from '../src/lib/anime-shot-recipes.ts';

test('publishes exactly 30 complete and uniquely addressable recipes', () => {
  assert.equal(animeShotRecipes.length, 30);
  assert.equal(new Set(animeShotRecipes.map(({ slug }) => slug)).size, 30);

  for (const recipe of animeShotRecipes) {
    assert.match(recipe.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(recipe.title.length >= 10);
    assert.ok(recipe.script.length >= 35);
    assert.ok(recipe.prompt.length >= 80);
    assert.ok(recipe.whyItWorks.length >= 60);
    assert.equal(recipe.tips.length, 2);
    assert.equal(getAnimeShotRecipe(recipe.slug), recipe);
  }
});

test('related recipes exclude the current recipe and preserve intent', () => {
  const recipe = getAnimeShotRecipe('rooftop-hero-reveal');
  assert.ok(recipe);
  const related = getRelatedRecipes(recipe);
  assert.equal(related.length, 3);
  assert.ok(related.every((item) => item.slug !== recipe.slug));
  assert.ok(
    related.every(
      (item) =>
        item.genre === recipe.genre || item.shotType === recipe.shotType,
    ),
  );
});
