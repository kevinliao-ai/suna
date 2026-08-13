import assert from 'node:assert/strict';
import test from 'node:test';

import {
  animeShotCollections,
  getAnimeShotCollection,
  getCollectionRecipes,
} from '../src/lib/anime-shot-collections.ts';

test('publishes exactly ten substantial and uniquely addressable collections', () => {
  assert.equal(animeShotCollections.length, 10);
  assert.equal(new Set(animeShotCollections.map(({ slug }) => slug)).size, 10);

  for (const collection of animeShotCollections) {
    assert.match(collection.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(collection.title.length >= 35);
    assert.ok(collection.description.length >= 90);
    assert.ok(collection.editorial.length >= 120);
    assert.equal(collection.planningRules.length, 3);
    assert.equal(collection.commonMistakes.length, 2);
    assert.equal(collection.faq.length, 2);
    assert.equal(getAnimeShotCollection(collection.slug), collection);
    assert.ok(getCollectionRecipes(collection).length >= 3);
  }
});

test('collections apply one clear genre or shot-type intent', () => {
  for (const collection of animeShotCollections) {
    const filters = Object.values(collection.filter).filter(Boolean);
    assert.equal(filters.length, 1);
    const recipes = getCollectionRecipes(collection);
    assert.ok(
      recipes.every((recipe) =>
        collection.filter.genre
          ? recipe.genre === collection.filter.genre
          : recipe.shotType === collection.filter.shotType,
      ),
    );
  }
});
