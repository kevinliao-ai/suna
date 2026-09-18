import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createAnimeDirectorPlan } from '../src/lib/anime-director.ts';
import {
  buildDirectorHandoffHref,
  getLinkedDirectorProjects,
  readStudioHandoffId,
  summarizeDirectorProject,
} from '../src/lib/studio-director-link.ts';

function createSavedProject(overrides = {}) {
  const plan = createAnimeDirectorPlan({
    script: 'A hero enters the station.\nThe train leaves at sunrise.',
    projectTitle: 'Station opening',
    style: 'cinematic anime',
    priority: 'control',
  });

  return {
    id: 'director-1',
    title: plan.title,
    style: 'cinematic anime',
    script: 'A hero enters the station.',
    priority: 'control',
    plan,
    updatedAt: '2026-09-18T00:00:00.000Z',
    ...overrides,
  };
}

test('handoff ids accept Studio ids but reject URL and query injection', () => {
  assert.equal(readStudioHandoffId('studio-project_123'), 'studio-project_123');
  assert.equal(
    readStudioHandoffId(' 550e8400-e29b-41d4-a716-446655440000 '),
    '550e8400-e29b-41d4-a716-446655440000',
  );
  assert.equal(readStudioHandoffId('//evil.example'), undefined);
  assert.equal(readStudioHandoffId('project&directorProject=other'), undefined);
  assert.equal(readStudioHandoffId('a'.repeat(129)), undefined);
});

test('Director handoff URLs contain only validated project identifiers', () => {
  assert.equal(
    buildDirectorHandoffHref('studio-1', 'director-1'),
    '/dashboard/director?source=studio&studioProject=studio-1&directorProject=director-1',
  );
});

test('linked Director projects expose production progress without user content', () => {
  const first = createSavedProject({
    studioProjectId: 'studio-1',
    selectedGenerationTaskIds: {
      'shot-1': { video: '550e8400-e29b-41d4-a716-446655440000' },
    },
    continuityReviews: {
      'shot-1': { status: 'approved', note: 'Looks good' },
    },
  });
  const other = createSavedProject({
    id: 'director-2',
    studioProjectId: 'studio-2',
  });

  assert.deepEqual(getLinkedDirectorProjects([first, other], 'studio-1'), [
    first,
  ]);

  const summary = summarizeDirectorProject(first);
  assert.equal(summary.projectId, 'director-1');
  assert.equal(summary.shotCount, first.plan.shots.length);
  assert.equal(summary.finalTakeCount, 1);
  assert.equal(summary.reviewedShotCount, 1);
  assert.equal(summary.needsRevisionCount, 0);
  assert.equal('script' in summary, false);
  assert.equal('style' in summary, false);
});

test('Studio linkage is persisted in Director settings and restored on load', async () => {
  const repository = await readFile(
    new URL('../src/lib/anime-director-projects.ts', import.meta.url),
    'utf8',
  );
  const planner = await readFile(
    new URL(
      '../src/components/anime-director/director-planner.tsx',
      import.meta.url,
    ),
    'utf8',
  );

  assert.match(repository, /studioProjectId: readStudioHandoffId/);
  assert.match(planner, /initialSavedProjectId/);
  assert.match(planner, /studioProjectId,/);
  assert.doesNotMatch(planner, /posthog\.capture\([^)]*studioProjectId/s);
});
