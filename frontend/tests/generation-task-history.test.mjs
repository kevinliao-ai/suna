import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  generationTaskMatchesReference,
  generationVersions,
  isDirectorShotId,
  readGenerationSelections,
  readGenerationTask,
  readSavedDirectorShotPrompt,
  resolveGenerationSelection,
  visibleGenerationVersions,
} from '../src/lib/generation/task-history.ts';

const firstTaskId = '11111111-1111-4111-8111-111111111111';
const secondTaskId = '22222222-2222-4222-8222-222222222222';

function task({
  id,
  createdAt,
  status = 'done',
  mediaUrl = 'https://cdn.example.com/output.jpg',
  kind = 'reference',
  shotId = 'shot-1',
}) {
  return {
    id,
    provider: 'fal',
    status,
    input: {
      shotId,
      kind,
      billing: { requiredCredits: 4, estimatedCostUsd: 0.0123 },
    },
    output: { mediaUrl, archiveStatus: 'stored' },
    error_message: status === 'failed' ? 'Provider error' : null,
    created_at: createdAt,
  };
}

test('Director shot IDs support generated and UUID workbench shots', () => {
  assert.equal(isDirectorShotId('shot-1'), true);
  assert.equal(
    isDirectorShotId('shot-123e4567-e89b-12d3-a456-426614174000'),
    true,
  );
  assert.equal(isDirectorShotId('shot/../../unsafe'), false);
  assert.equal(isDirectorShotId('scene-1'), false);
});

test('task history keeps billing, archive, failure, and queued states', () => {
  const parsed = readGenerationTask(
    task({ id: firstTaskId, createdAt: '2026-08-17T01:00:00Z' }),
  );
  assert.equal(parsed.requiredCredits, 4);
  assert.equal(parsed.estimatedCostUsd, 0.0123);
  assert.equal(parsed.archiveStatus, 'stored');

  const queued = readGenerationTask({
    ...task({ id: secondTaskId, createdAt: '2026-08-17T02:00:00Z' }),
    status: 'todo',
  });
  assert.equal(queued.status, 'todo');
});

test('versions sort newest first while an explicit final take wins', () => {
  const older = readGenerationTask(
    task({ id: firstTaskId, createdAt: '2026-08-17T01:00:00Z' }),
  );
  const newer = readGenerationTask(
    task({ id: secondTaskId, createdAt: '2026-08-17T02:00:00Z' }),
  );
  const versions = generationVersions([older, newer], 'shot-1', 'reference');

  assert.deepEqual(
    versions.map((version) => version.id),
    [secondTaskId, firstTaskId],
  );
  assert.equal(resolveGenerationSelection(versions).id, secondTaskId);
  assert.equal(
    resolveGenerationSelection(versions, firstTaskId).id,
    firstTaskId,
  );
});

test('simulation results stay visible but cannot become a paid final take', () => {
  const simulated = readGenerationTask({
    ...task({ id: firstTaskId, createdAt: '2026-08-17T03:00:00Z' }),
    provider: 'simulation',
  });
  assert.equal(resolveGenerationSelection([simulated], firstTaskId), null);
});

test('a selected older take remains visible outside the newest history limit', () => {
  const versions = Array.from({ length: 8 }, (_, index) => ({
    ...readGenerationTask(
      task({
        id: `${String(index + 1).padStart(8, '0')}-1111-4111-8111-111111111111`,
        createdAt: `2026-08-17T${String(index + 1).padStart(2, '0')}:00:00Z`,
      }),
    ),
  })).reverse();

  const visible = visibleGenerationVersions(versions, versions[7].id, 3);
  assert.equal(visible.length, 4);
  assert.equal(visible[3].id, versions[7].id);
});

test('saved final-take selections are sanitized by shot and UUID', () => {
  assert.deepEqual(
    readGenerationSelections({
      'shot-1': { reference: firstTaskId, video: 'not-a-task' },
      '../unsafe': { reference: secondTaskId },
    }),
    { 'shot-1': { reference: firstTaskId } },
  );
});

test('saved prompts and references match the exact project shot', () => {
  const settings = {
    director: {
      plan: {
        shots: [{ id: 'shot-1', visualPrompt: '  Saved production prompt.  ' }],
      },
      continuityAssets: [
        {
          id: 'asset-hero',
          kind: 'character',
          name: 'Hero',
          description: 'Young mage',
          visualAnchors: 'silver hair and navy coat',
          negativeConstraints: 'no outfit changes',
        },
      ],
      continuityBindings: { 'shot-1': ['asset-hero'] },
    },
  };
  const prompt = readSavedDirectorShotPrompt(settings, 'shot-1');
  assert.ok(prompt.startsWith('Saved production prompt.'));
  assert.match(prompt, /Continuity lock/);
  assert.match(prompt, /silver hair and navy coat/);
  assert.equal(readSavedDirectorShotPrompt(settings, 'shot-2'), null);
  assert.equal(
    generationTaskMatchesReference(
      {
        input: { shotId: 'shot-1', kind: 'reference' },
        output: { mediaUrl: 'https://cdn.example.com/reference.jpg' },
      },
      'shot-1',
      'https://cdn.example.com/reference.jpg',
    ),
    true,
  );
});

test('generation uses saved prompts and verifies reference ownership', async () => {
  const route = await readFile(
    new URL('../src/app/api/generation/fal/route.ts', import.meta.url),
    'utf8',
  );
  const panel = await readFile(
    new URL(
      '../src/components/anime-director/director-generation-panel.tsx',
      import.meta.url,
    ),
    'utf8',
  );
  const repository = await readFile(
    new URL('../src/lib/anime-director-projects.ts', import.meta.url),
    'utf8',
  );

  assert.match(
    route,
    /const prompt = readSavedDirectorShotPrompt\(project\.settings, shotId\)/,
  );
  assert.match(
    route,
    /generationTaskMatchesReference\(task, shotId, body\.imageUrl/,
  );
  assert.ok(
    route.indexOf('const prompt = readSavedDirectorShotPrompt') <
      route.indexOf('await submitFalRequest'),
  );
  assert.match(panel, /Shot versions and final takes/);
  assert.match(panel, /director_generation_version_selected/);
  assert.match(repository, /selectedGenerationTaskIds/);

  const eventStart = panel.indexOf(
    "posthog.capture('director_generation_version_selected'",
  );
  const eventEnd = panel.indexOf('});', eventStart);
  assert.doesNotMatch(
    panel.slice(eventStart, eventEnd),
    /prompt|mediaUrl|taskId|errorMessage/,
  );
});
