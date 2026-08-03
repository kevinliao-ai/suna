import assert from 'node:assert/strict';
import test from 'node:test';

import { createStudioProject } from '../src/lib/studio/model.ts';
import { saveCloudProjects } from '../src/lib/studio/repository.ts';

function createSupabaseRecorder() {
  const operations = [];

  return {
    operations,
    client: {
      from(table) {
        return {
          async upsert(rows) {
            operations.push({
              type: 'upsert',
              table,
              ids: rows.map((r) => r.id),
            });
            return { error: null };
          },
          delete() {
            return {
              eq(column, value) {
                assert.equal(column, 'user_id');
                assert.equal(value, 'user-a');
                return {
                  async in(idColumn, ids) {
                    assert.equal(idColumn, 'id');
                    operations.push({ type: 'delete', table, ids });
                    return { error: null };
                  },
                };
              },
            };
          },
        };
      },
    },
  };
}

function syncedProject() {
  return {
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
}

test('cloud save deletes only records explicitly removed since last sync', async () => {
  const previous = syncedProject();
  const current = { ...previous, assets: [] };
  const { client, operations } = createSupabaseRecorder();

  await saveCloudProjects(client, 'user-a', [current], [previous]);

  assert.deepEqual(
    operations.filter((operation) => operation.type === 'delete'),
    [{ type: 'delete', table: 'anisora_assets', ids: ['asset-a'] }],
  );
});

test('first cloud import never performs inferred deletes', async () => {
  const { client, operations } = createSupabaseRecorder();

  await saveCloudProjects(client, 'user-a', [syncedProject()], []);

  assert.deepEqual(
    operations.filter((operation) => operation.type === 'delete'),
    [],
  );
});
