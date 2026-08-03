import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationUrl = new URL(
  '../../backend/supabase/migrations/20260729090000_anisora_studio.sql',
  import.meta.url,
);
const rollbackUrl = new URL(
  '../../backend/supabase/rollback/20260729090000_anisora_studio.sql',
  import.meta.url,
);
const verificationUrl = new URL(
  '../../backend/supabase/verification/anisora_studio_rls.sql',
  import.meta.url,
);
const autoRlsHardeningUrl = new URL(
  '../../backend/supabase/migrations/20260730100000_restrict_rls_auto_enable.sql',
  import.meta.url,
);

test('Studio migration preserves required RLS and privilege boundaries', async () => {
  const sql = (await readFile(migrationUrl, 'utf8')).toLowerCase();

  for (const table of ['anisora_projects', 'anisora_assets', 'anisora_tasks']) {
    assert.match(
      sql,
      new RegExp(`alter table public\\.${table} enable row level security`),
    );
    assert.match(sql, new RegExp(`on public\\.${table}[\\s\\S]*?with check`));
  }

  assert.match(sql, /to authenticated;/);
  assert.match(sql, /from anon;/);
  assert.match(sql, /url ~ '\^https\?:\/\/'/);
  assert.match(
    sql,
    /anisora_assets_user_created_idx[\s\S]*?\(user_id, created_at desc\)/,
  );
  assert.match(
    sql,
    /anisora_tasks_user_created_idx[\s\S]*?\(user_id, created_at asc\)/,
  );
});

test('rollback refuses to drop data-bearing Studio tables', async () => {
  const sql = (await readFile(rollbackUrl, 'utf8')).toLowerCase();

  assert.match(sql, /if exists \(select 1 from public\.anisora_projects/);
  assert.match(sql, /rollback refused/);
  assert.match(sql, /drop table if exists public\.anisora_projects/);
});

test('RLS verification is transactional and exercises two identities', async () => {
  const sql = (await readFile(verificationUrl, 'utf8')).toLowerCase();

  assert.match(sql, /^-- run only in a disposable\/non-production/m);
  assert.match(sql, /\bbegin;/);
  assert.match(sql, /\brollback;/);
  assert.match(sql, /anisora\.test_user_a/);
  assert.match(sql, /anisora\.test_user_b/);
  assert.match(sql, /cross_task_insert_blocked/);
});

test('automatic RLS helper is not executable by client roles', async () => {
  const sql = (await readFile(autoRlsHardeningUrl, 'utf8')).toLowerCase();

  assert.match(sql, /to_regprocedure\('public\.rls_auto_enable\(\)'\)/);
  assert.match(
    sql,
    /revoke execute on function public\.rls_auto_enable\(\)[\s\S]*from public, anon, authenticated/,
  );
});
