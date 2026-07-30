import assert from 'node:assert/strict';
import test from 'node:test';

import {
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
