import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  composeContinuityPrompt,
  continuityCoverage,
  continuityReviewSummary,
  createContinuityAsset,
  MAX_CONTINUITY_ASSETS,
  MAX_CONTINUITY_ASSETS_PER_SHOT,
  readContinuityAssets,
  readContinuityBindings,
  readContinuityReviews,
  removeContinuityAsset,
  toggleContinuityBinding,
  updateContinuityAsset,
  updateContinuityReview,
} from '../src/lib/director-continuity.ts';

const character = {
  id: 'asset-mage',
  kind: 'character',
  name: 'Ari',
  description: 'Young rooftop mage',
  visualAnchors: 'silver bob, amber eyes, navy coat',
  negativeConstraints: 'no outfit or age changes',
};

const scene = {
  id: 'asset-rooftop',
  kind: 'scene',
  name: 'Sunset rooftop',
  description: 'Dense city skyline',
  visualAnchors: 'copper rail, west light, blue runes',
  negativeConstraints: 'no rain or night lighting',
};
const referenceTaskId = '33333333-3333-4333-8333-333333333333';

test('continuity assets sanitize text, reject unsafe IDs, and enforce limits', () => {
  const raw = [
    { ...character, name: `  ${'A'.repeat(100)}  ` },
    { ...character, name: 'Duplicate' },
    { ...scene, id: '../unsafe' },
    ...Array.from({ length: 20 }, (_, index) => ({
      ...scene,
      id: `asset-scene-${index}`,
    })),
  ];
  const assets = readContinuityAssets(raw);

  assert.equal(assets.length, MAX_CONTINUITY_ASSETS);
  assert.equal(assets[0].name.length, 80);
  assert.equal(assets.filter((asset) => asset.id === character.id).length, 1);
  assert.equal(
    assets.some((asset) => asset.id === '../unsafe'),
    false,
  );
});

test('asset creation, editing, removal, and binding cleanup stay deterministic', () => {
  let assets = createContinuityAsset([], 'character', 'asset-new');
  assets = updateContinuityAsset(assets, 'asset-new', {
    name: 'Hero',
    visualAnchors: 'green eyes',
    referenceTaskId,
  });
  const bindings = toggleContinuityBinding({}, 'shot-1', 'asset-new', assets);

  assert.equal(assets[0].name, 'Hero');
  assert.equal(assets[0].referenceTaskId, referenceTaskId);
  assert.deepEqual(bindings, { 'shot-1': ['asset-new'] });

  const removed = removeContinuityAsset(assets, bindings, 'asset-new');
  assert.deepEqual(removed.assets, []);
  assert.deepEqual(removed.bindings, {});
});

test('canonical references and continuity reviews reject malformed saved data', () => {
  const assets = readContinuityAssets([
    { ...character, referenceTaskId },
    { ...scene, referenceTaskId: 'unsafe-task' },
  ]);
  assert.equal(assets[0].referenceTaskId, referenceTaskId);
  assert.equal(assets[1].referenceTaskId, undefined);

  let reviews = readContinuityReviews(
    {
      'shot-1': { status: 'approved', note: `  ${'A'.repeat(300)}  ` },
      'shot-2': { status: 'unknown', note: 'invalid' },
      '../unsafe': { status: 'needs_revision', note: 'invalid' },
    },
    ['shot-1', 'shot-2'],
  );
  assert.equal(reviews['shot-1'].note.length, 240);
  assert.equal(reviews['shot-2'], undefined);

  reviews = updateContinuityReview(reviews, 'shot-2', {
    status: 'needs_revision',
    note: 'Hair color shifted.',
  });
  assert.deepEqual(continuityReviewSummary(['shot-1', 'shot-2'], reviews), {
    reviewed: 2,
    approved: 1,
    needsRevision: 1,
  });
  assert.equal(
    updateContinuityReview(reviews, 'shot-2', null)['shot-2'],
    undefined,
  );
});

test('bindings only retain known assets, valid shots, and four assets per shot', () => {
  const assets = Array.from({ length: 6 }, (_, index) => ({
    ...character,
    id: `asset-character-${index}`,
  }));
  const bindings = readContinuityBindings(
    {
      'shot-1': [...assets.map((asset) => asset.id), 'asset-missing'],
      '../unsafe': [assets[0].id],
      'shot-2': [assets[0].id],
    },
    assets,
    ['shot-1'],
  );

  assert.equal(bindings['shot-1'].length, MAX_CONTINUITY_ASSETS_PER_SHOT);
  assert.equal(bindings['shot-2'], undefined);
  assert.equal(bindings['../unsafe'], undefined);
});

test('generation prompt adds only bound assets without changing the base prompt', () => {
  const base = 'Medium shot of Ari opening a notebook.';
  const bindings = { 'shot-1': [character.id], 'shot-2': [scene.id] };
  const prompt = composeContinuityPrompt(
    base,
    [character, scene],
    bindings,
    'shot-1',
  );

  assert.ok(prompt.startsWith(base));
  assert.match(prompt, /Continuity lock/);
  assert.match(prompt, /silver bob, amber eyes, navy coat/);
  assert.doesNotMatch(prompt, /copper rail/);
  assert.equal(base, 'Medium shot of Ari opening a notebook.');
  assert.equal(continuityCoverage(['shot-1', 'shot-2'], bindings), 2);
});

test('continuity analytics remain categorical and never include creative text', async () => {
  const planner = await readFile(
    new URL(
      '../src/components/anime-director/director-planner.tsx',
      import.meta.url,
    ),
    'utf8',
  );
  const eventNames = [
    'director_continuity_asset_added',
    'director_continuity_asset_removed',
    'director_continuity_binding_changed',
    'director_continuity_reference_changed',
    'director_continuity_review_changed',
  ];

  for (const eventName of eventNames) {
    const start = planner.indexOf(`posthog.capture('${eventName}'`);
    const end = planner.indexOf('});', start);
    assert.notEqual(start, -1);
    assert.doesNotMatch(
      planner.slice(start, end),
      /name|description|visualAnchors|negativeConstraints|prompt|note/,
    );
  }
});
