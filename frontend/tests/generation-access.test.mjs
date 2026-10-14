import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  generationSimulationEnabled,
  isGenerationAllowlisted,
  paidGenerationRolloutEnabled,
} from '../src/lib/generation/access.ts';

const generationRouteUrl = new URL('../src/app/api/generation/fal/route.ts', import.meta.url);

test('paid generation stays closed while the kill switch is off', () => {
  assert.equal(paidGenerationRolloutEnabled('pro@example.com', {}), false);
  assert.equal(
    paidGenerationRolloutEnabled('pro@example.com', { ENABLE_PAID_GENERATION: 'false' }),
    false,
  );
});

test('paid generation opens to every signed-in account when enabled', () => {
  const environment = { ENABLE_PAID_GENERATION: 'true', GENERATION_TEST_EMAILS: 'tester@example.com' };
  assert.equal(paidGenerationRolloutEnabled('pro@example.com', environment), true);
  assert.equal(paidGenerationRolloutEnabled('tester@example.com', environment), true);
});

test('allowlist-only rollout limits paid generation to testers', () => {
  const environment = {
    ENABLE_PAID_GENERATION: 'true',
    PAID_GENERATION_ALLOWLIST_ONLY: 'true',
    GENERATION_TEST_EMAILS: ' Tester@Example.com ,other@example.com',
  };
  assert.equal(paidGenerationRolloutEnabled('tester@example.com', environment), true);
  assert.equal(paidGenerationRolloutEnabled('pro@example.com', environment), false);
  assert.equal(paidGenerationRolloutEnabled(null, environment), false);
});

test('simulation remains allowlist-only', () => {
  const environment = {
    ENABLE_GENERATION_SIMULATION: 'true',
    GENERATION_TEST_EMAILS: 'tester@example.com',
  };
  assert.equal(generationSimulationEnabled('tester@example.com', environment), true);
  assert.equal(generationSimulationEnabled('pro@example.com', environment), false);
  assert.equal(isGenerationAllowlisted('', environment), false);
});

test('free accounts are rejected before provider pricing or task creation', async () => {
  const source = await readFile(generationRouteUrl, 'utf8');
  const entitlementCheck = source.indexOf("creditState.entitlement.tier !== 'pro'");
  assert.ok(entitlementCheck > 0);
  assert.ok(entitlementCheck < source.indexOf('getFalGenerationQuote(kind, { fresh: true })'));
  assert.ok(entitlementCheck < source.indexOf(".from('anisora_tasks').insert"));
});
