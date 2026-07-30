import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectDeletedStudioIds,
  createStudioProject,
  parseStoredProjects,
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
