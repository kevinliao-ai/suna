import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationUrl = new URL(
  '../../backend/supabase/migrations/20260803090000_anisora_billing.sql',
  import.meta.url,
);
const eventOrderMigrationUrl = new URL(
  '../../backend/supabase/migrations/20260803100000_anisora_billing_event_order.sql',
  import.meta.url,
);
const checkoutUrl = new URL(
  '../src/app/api/billing/checkout/route.ts',
  import.meta.url,
);
const webhookUrl = new URL(
  '../src/app/api/stripe/webhook/route.ts',
  import.meta.url,
);
const verificationUrl = new URL(
  '../../backend/supabase/verification/anisora_billing_rls.sql',
  import.meta.url,
);

test('billing migration is isolated, user-readable, and service-role writable', async () => {
  const sql = (await readFile(migrationUrl, 'utf8')).toLowerCase();

  for (const table of [
    'anisora_billing_customers',
    'anisora_subscriptions',
    'anisora_stripe_events',
  ]) {
    assert.match(
      sql,
      new RegExp(`alter table public\\.${table} enable row level security`),
    );
  }

  assert.doesNotMatch(sql, /\bbasejump\./);
  assert.match(sql, /using \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(sql, /to service_role;/);
  assert.match(sql, /from anon;/);
  assert.match(sql, /revoke insert, update, delete[\s\S]*from authenticated;/);
  assert.match(
    sql,
    /revoke all on public\.anisora_stripe_events from authenticated;/,
  );
  assert.match(
    sql,
    /revoke execute on function public\.set_anisora_billing_updated_at\(\)[\s\S]*from public, anon, authenticated/,
  );
});

test('Checkout accepts an internal plan ID instead of a client-controlled price ID', async () => {
  const source = await readFile(checkoutUrl, 'utf8');

  assert.match(source, /getConfiguredPrice\(body\.planId\)/);
  assert.doesNotMatch(source, /body\.priceId/);
  assert.match(source, /client_reference_id: user\.id/);
});

test('Webhook verifies the raw payload signature and records processed event IDs', async () => {
  const source = await readFile(webhookUrl, 'utf8');

  assert.match(source, /await request\.text\(\)/);
  assert.match(source, /webhooks\.constructEvent/);
  assert.match(source, /stripe-signature/);
  assert.match(source, /anisora_stripe_events/);
  assert.match(source, /event\.id/);
  assert.match(source, /Stripe webhook processed/);
  assert.match(source, /Stripe webhook duplicate ignored/);
  assert.doesNotMatch(source, /console\.(info|log)\([^\n]*payload/);
  assert.match(source, /event\.created/);
});

test('subscription writes reject out-of-order Stripe events atomically', async () => {
  const sql = (await readFile(eventOrderMigrationUrl, 'utf8')).toLowerCase();

  assert.match(sql, /last_stripe_event_created bigint not null default 0/);
  assert.match(sql, /add column if not exists cancel_at timestamptz/);
  assert.match(sql, /on conflict \(stripe_subscription_id\) do update/);
  assert.match(
    sql,
    /anisora_subscriptions\.last_stripe_event_created\s*<= excluded\.last_stripe_event_created/,
  );
  assert.match(sql, /return coalesce\(applied, false\)/);
  assert.match(sql, /cancel_at = excluded\.cancel_at/);
  assert.match(
    sql,
    /revoke all on function public\.upsert_anisora_subscription[\s\S]*from public, anon, authenticated/,
  );
  assert.match(
    sql,
    /grant execute on function public\.upsert_anisora_subscription[\s\S]*to service_role/,
  );
});

test('billing RLS verification is transactional and checks two users', async () => {
  const sql = (await readFile(verificationUrl, 'utf8')).toLowerCase();

  assert.match(sql, /^-- run only in a disposable\/non-production/m);
  assert.match(sql, /\bbegin;/);
  assert.match(sql, /\brollback;/);
  assert.match(sql, /anisora\.test_user_a/);
  assert.match(sql, /anisora\.test_user_b/);
  assert.match(sql, /authenticated user can write billing state/);
  assert.match(sql, /authenticated user can read stripe events/);
});
