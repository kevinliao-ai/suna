import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationUrl = new URL(
  '../../backend/supabase/migrations/20260812090000_anisora_generation_credits.sql',
  import.meta.url,
);
const generationRouteUrl = new URL('../src/app/api/generation/fal/route.ts', import.meta.url);
const webhookUrl = new URL('../src/app/api/webhooks/fal/route.ts', import.meta.url);

test('credit tables are owner-readable and service-role-only writable', async () => {
  const sql = (await readFile(migrationUrl, 'utf8')).toLowerCase();
  for (const table of ['anisora_generation_credit_accounts', 'anisora_generation_credit_ledger']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(sql, /using \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(sql, /revoke insert, update, delete[\s\S]*from authenticated/);
  assert.match(sql, /grant execute on function public\.reserve_anisora_generation_credits[\s\S]*to service_role/);
  assert.match(sql, /idempotency_key text not null unique/);
});

test('generation reserves before provider submission and releases submission failures', async () => {
  const source = await readFile(generationRouteUrl, 'utf8');
  assert.match(source, /await reserveGenerationCredits[\s\S]*await submitFalRequest/);
  assert.match(source, /releaseGenerationCredits\(user\.id, taskId\)/);
  assert.match(source, /subscription_required/);
  assert.match(source, /insufficient_credits/);
});

test('verified provider webhooks settle success and release failures', async () => {
  const source = await readFile(webhookUrl, 'utf8');
  assert.match(source, /settleGenerationCredits\(task\.user_id, taskId\)/);
  assert.match(source, /releaseGenerationCredits\(task\.user_id, taskId\)/);
  assert.ok(source.indexOf('verifyFalWebhook') < source.indexOf('settleGenerationCredits'));
});
