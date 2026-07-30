import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectDeletedStudioIds,
  createStudioProject,
  parseStudioBackup,
  parseStoredProjects,
  serializeStudioBackup,
} from '../src/lib/studio/model.ts';

test('creates a valid local-first studio project', () => {
  const project = createStudioProject('Launch trailer');

  assert.equal(project.name, 'Launch trailer');
  assert.equal(project.activeTool, 'anisora');
  assert.deepEqual(project.assets, []);
  assert.deepEqual(project.tasks, []);
  assert.match(project.id, /.+/);
});

test('restores compatible projects and rejects malformed storage', () => {
  const project = createStudioProject();
  const restored = parseStoredProjects(JSON.stringify([project, null, {}]));

  assert.equal(restored.length, 1);
  assert.equal(restored[0].id, project.id);
  assert.deepEqual(parseStoredProjects('{broken'), []);
  assert.deepEqual(parseStoredProjects(null), []);
});

test('adds an empty task list to older stored projects', () => {
  const project = createStudioProject();
  const legacy = { ...project };
  delete legacy.tasks;

  const [restored] = parseStoredProjects(JSON.stringify([legacy]));
  assert.deepEqual(restored.tasks, []);
});

test('filters unsafe nested data when restoring browser storage', () => {
  const project = {
    ...createStudioProject(),
    assets: [
      {
        id: 'asset-safe',
        name: 'Reference',
        url: 'https://example.com/reference.png',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
      {
        id: 'asset-unsafe',
        name: 'Unsafe reference',
        url: 'javascript:alert(1)',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
    tasks: [
      {
        id: 'task-safe',
        title: 'Render',
        status: 'todo',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
      {
        id: 'task-invalid',
        title: 'Invalid state',
        status: 'running',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
  };

  const [restored] = parseStoredProjects(JSON.stringify([project]));

  assert.deepEqual(
    restored.assets.map((asset) => asset.id),
    ['asset-safe'],
  );
  assert.deepEqual(
    restored.tasks.map((task) => task.id),
    ['task-safe'],
  );
});

test('round-trips an AniSora Studio backup', () => {
  const project = createStudioProject('Launch trailer');
  const exportedAt = '2026-07-30T00:00:00.000Z';
  const backup = serializeStudioBackup([project], exportedAt);
  const parsed = JSON.parse(backup);

  assert.equal(parsed.product, 'anisora-studio');
  assert.equal(parsed.version, 1);
  assert.equal(parsed.exportedAt, exportedAt);
  assert.deepEqual(parseStudioBackup(backup), [project]);
});

test('rejects malformed, oversized, or unsafe backup files', () => {
  assert.throws(() => parseStudioBackup('{broken'), /not valid JSON/);
  assert.throws(
    () => parseStudioBackup(JSON.stringify({ product: 'other' })),
    /not an AniSora Studio v1 backup/,
  );
  assert.throws(
    () => parseStudioBackup('x'.repeat(2_000_001)),
    /larger than 2 MB/,
  );

  const unsafeProject = {
    ...createStudioProject(),
    assets: [
      {
        id: 'asset-unsafe',
        name: 'Unsafe reference',
        url: 'javascript:alert(1)',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
  };
  const unsafeBackup = JSON.stringify({
    product: 'anisora-studio',
    version: 1,
    exportedAt: '2026-07-30T00:00:00.000Z',
    projects: [unsafeProject],
  });

  assert.throws(
    () => parseStudioBackup(unsafeBackup),
    /invalid or unsupported project data/,
  );

  const duplicateIdProject = {
    ...createStudioProject(),
    id: 'duplicate-id',
    tasks: [
      {
        id: 'duplicate-id',
        title: 'Conflicting task',
        status: 'todo',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
  };
  const duplicateBackup = serializeStudioBackup([duplicateIdProject]);

  assert.throws(() => parseStudioBackup(duplicateBackup), /duplicate/);
});

test('only marks records explicitly removed from the last synced snapshot', () => {
  const previous = {
    ...createStudioProject('Synced project'),
    id: 'project-a',
    assets: [
      {
        id: 'asset-a',
        name: 'Reference',
        url: 'https://example.com/reference.png',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
    tasks: [
      {
        id: 'task-a',
        title: 'Render',
        status: 'todo',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
  };
  const current = {
    ...previous,
    assets: [],
    tasks: previous.tasks,
  };

  assert.deepEqual(collectDeletedStudioIds([previous], [current]), {
    projectIds: [],
    assetIds: ['asset-a'],
    taskIds: [],
  });
});

test('does not infer deletion for rows absent from the prior local snapshot', () => {
  const project = { ...createStudioProject(), id: 'project-a' };

  assert.deepEqual(collectDeletedStudioIds([project], [project]), {
    projectIds: [],
    assetIds: [],
    taskIds: [],
  });
});

test('marks child rows when their project is explicitly removed', () => {
  const previous = {
    ...createStudioProject(),
    id: 'project-a',
    assets: [
      {
        id: 'asset-a',
        name: 'Reference',
        url: 'https://example.com/reference.png',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
    tasks: [
      {
        id: 'task-a',
        title: 'Render',
        status: 'todo',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
  };

  assert.deepEqual(collectDeletedStudioIds([previous], []), {
    projectIds: ['project-a'],
    assetIds: ['asset-a'],
    taskIds: ['task-a'],
  });
});
