import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildDirectorProductionRows,
  filterProductionRows,
  productionReadinessSummary,
  serializeProductionManifest,
} from '../src/lib/director-production.ts';

const taskIds = Array.from(
  { length: 8 },
  (_, index) =>
    `${String(index + 1).padStart(8, '0')}-1111-4111-8111-111111111111`,
);

const shots = Array.from({ length: 4 }, (_, index) => ({
  id: `shot-${index + 1}`,
  title: `Shot ${index + 1}`,
  beat: `Beat ${index + 1}`,
  durationSeconds: 4,
  camera: 'Medium tracking shot',
  visualPrompt: 'Cinematic anime frame',
  voicePrompt: 'Quiet city ambience',
  route: 'Reference image → image-to-video',
  checklist: [],
}));

function generationTask(index, kind) {
  const shotNumber = Math.floor(index / 2) + 1;
  return {
    id: taskIds[index],
    provider: 'fal',
    shotId: `shot-${shotNumber}`,
    kind,
    status: 'done',
    mediaUrl: `https://cdn.example.com/${index}.${kind === 'video' ? 'mp4' : 'jpg'}`,
    archiveStatus: 'stored',
    errorMessage: null,
    requiredCredits: 4,
    estimatedCostUsd: 0.02,
    createdAt: `2026-08-17T0${index}:00:00Z`,
  };
}

const tasks = [
  generationTask(0, 'reference'),
  generationTask(1, 'video'),
  generationTask(2, 'reference'),
  generationTask(4, 'reference'),
  generationTask(5, 'video'),
  generationTask(6, 'reference'),
  generationTask(7, 'video'),
];

const selections = {
  'shot-1': { reference: taskIds[0], video: taskIds[1] },
  'shot-2': { reference: taskIds[2] },
  'shot-3': { reference: taskIds[4], video: taskIds[5] },
  'shot-4': { reference: taskIds[6], video: taskIds[7] },
};

const assets = [
  {
    id: 'asset-hero',
    kind: 'character',
    name: 'Ari',
    description: 'Young mage',
    visualAnchors: 'silver hair, navy coat',
    negativeConstraints: 'no outfit changes',
    referenceTaskId: taskIds[0],
  },
];

const rows = buildDirectorProductionRows(
  shots,
  tasks,
  selections,
  assets,
  {
    'shot-1': ['asset-hero'],
    'shot-3': ['asset-hero'],
  },
  {
    'shot-1': { status: 'approved', note: '' },
    'shot-3': { status: 'needs_revision', note: 'Coat color shifted.' },
  },
);

test('production rows classify final output and continuity readiness', () => {
  assert.deepEqual(
    rows.map((row) => row.readiness),
    ['ready', 'missing_output', 'needs_revision', 'awaiting_review'],
  );
  assert.equal(rows[0].continuityAssets[0].name, 'Ari');
  assert.equal(rows[1].finalVideo, null);
  assert.deepEqual(productionReadinessSummary(rows), {
    total: 4,
    ready: 1,
    missingOutput: 1,
    needsRevision: 1,
    awaitingReview: 1,
  });
});

test('production readiness requires explicit valid final-take selections', () => {
  const unselected = buildDirectorProductionRows(
    [shots[0]],
    tasks,
    {},
    assets,
    { 'shot-1': ['asset-hero'] },
    { 'shot-1': { status: 'approved', note: '' } },
  );
  assert.equal(unselected[0].readiness, 'missing_output');
  assert.equal(unselected[0].finalReference, null);
  assert.equal(unselected[0].finalVideo, null);

  const stale = buildDirectorProductionRows(
    [shots[0]],
    tasks,
    {
      'shot-1': {
        reference: taskIds[7],
        video: taskIds[1],
      },
    },
    assets,
    {},
    { 'shot-1': { status: 'approved', note: '' } },
  );
  assert.equal(stale[0].finalReference, null);
  assert.equal(stale[0].readiness, 'missing_output');
});

test('production filters preserve shot order and group action items', () => {
  assert.deepEqual(
    filterProductionRows(rows, 'ready').map((row) => row.shot.id),
    ['shot-1'],
  );
  assert.deepEqual(
    filterProductionRows(rows, 'action_required').map((row) => row.shot.id),
    ['shot-2', 'shot-3', 'shot-4'],
  );
  assert.deepEqual(
    filterProductionRows(rows, 'missing_output').map((row) => row.shot.id),
    ['shot-2'],
  );
});

test('production manifest is deterministic and contains only final takes', () => {
  const manifest = JSON.parse(
    serializeProductionManifest({
      projectId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      projectTitle: 'Sky Train',
      rows,
      exportedAt: '2026-08-17T10:00:00.000Z',
    }),
  );

  assert.equal(manifest.product, 'anisora-director-production-manifest');
  assert.equal(manifest.version, 1);
  assert.equal(manifest.readiness.ready, 1);
  assert.equal(manifest.shots.length, 4);
  assert.equal(manifest.shots[0].finalVideo.taskId, taskIds[1]);
  assert.equal(manifest.shots[1].finalVideo, null);
  assert.equal(manifest.shots[2].continuityReview.note, 'Coat color shifted.');
});

test('continuity board analytics exclude creative content and media identity', async () => {
  const board = await readFile(
    new URL(
      '../src/components/anime-director/director-continuity-board.tsx',
      import.meta.url,
    ),
    'utf8',
  );
  for (const eventName of [
    'director_production_manifest_exported',
    'director_continuity_board_filtered',
  ]) {
    const start = board.indexOf(`posthog.capture('${eventName}'`);
    const end = board.indexOf('});', start);
    assert.notEqual(start, -1);
    assert.doesNotMatch(
      board.slice(start, end),
      /projectTitle|title|prompt|note|mediaUrl|taskId|assetId|url/,
    );
  }
  assert.match(board, /Cross-shot continuity board/);
  assert.match(board, /Export production manifest/);
});
