import assert from 'node:assert/strict';
import test from 'node:test';

import {
  creditsForQuote,
  PRO_MONTHLY_GENERATION_CREDITS,
  resolveCreditCycle,
} from '../src/lib/generation/credits.ts';

function entitlement(overrides = {}) {
  return {
    tier: 'pro', status: 'active', planId: 'studio-pro-monthly',
    cancelAtPeriodEnd: false, cancelAt: null, inGracePeriod: false,
    currentPeriodStart: '2026-08-10T00:00:00.000Z',
    currentPeriodEnd: '2026-09-10T00:00:00.000Z',
    ...overrides,
  };
}

test('converts quoted provider cost into conservative whole credits', () => {
  assert.equal(creditsForQuote({ estimatedCostUsd: 0.033 }), 4);
  assert.equal(creditsForQuote({ estimatedCostUsd: 0.4 }), 40);
  assert.equal(creditsForQuote({ estimatedCostUsd: 0 }), 1);
  assert.equal(PRO_MONTHLY_GENERATION_CREDITS, 200);
});

test('monthly subscriptions use the Stripe billing period', () => {
  assert.deepEqual(resolveCreditCycle(entitlement(), new Date('2026-08-12')), {
    periodStart: '2026-08-10T00:00:00.000Z',
    periodEnd: '2026-09-10T00:00:00.000Z',
  });
});

test('annual subscriptions refill credits monthly without granting the full year', () => {
  const cycle = resolveCreditCycle(entitlement({
    planId: 'studio-pro-annual',
    currentPeriodStart: '2026-01-31T00:00:00.000Z',
    currentPeriodEnd: '2027-01-31T00:00:00.000Z',
  }), new Date('2026-03-15T00:00:00.000Z'));

  assert.deepEqual(cycle, {
    periodStart: '2026-02-28T00:00:00.000Z',
    periodEnd: '2026-03-28T00:00:00.000Z',
  });
});

test('free or malformed entitlements receive no credit cycle', () => {
  assert.equal(resolveCreditCycle(entitlement({ tier: 'free' })), null);
  assert.equal(resolveCreditCycle(entitlement({ currentPeriodEnd: null })), null);
});
