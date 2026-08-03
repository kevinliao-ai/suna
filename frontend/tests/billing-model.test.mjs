import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isKnownSubscriptionStatus,
  resolveBillingEntitlement,
} from '../src/lib/billing/model.ts';
import { getBillingPlan } from '../src/lib/billing/plans.ts';

const now = new Date('2026-08-03T00:00:00.000Z');

function subscription(overrides = {}) {
  return {
    stripe_subscription_id: 'sub_test',
    user_id: 'user-test',
    stripe_customer_id: 'cus_test',
    stripe_price_id: 'price_test',
    plan_id: 'studio-pro-monthly',
    status: 'active',
    currency: 'usd',
    cancel_at_period_end: false,
    current_period_start: '2026-07-03T00:00:00.000Z',
    current_period_end: '2026-08-04T00:00:00.000Z',
    canceled_at: null,
    ...overrides,
  };
}

test('only allows server-defined AniSora plans', () => {
  assert.equal(getBillingPlan('studio-pro-monthly')?.amount, 599);
  assert.equal(getBillingPlan('studio-pro-annual')?.amount, 5900);
  assert.equal(getBillingPlan('price_attacker_controlled'), null);
});

test('active and trialing subscriptions receive Pro access', () => {
  assert.equal(resolveBillingEntitlement(subscription(), now).tier, 'pro');
  assert.equal(
    resolveBillingEntitlement(subscription({ status: 'trialing' }), now).tier,
    'pro',
  );
});

test('cancel-at-period-end keeps access without treating cancellation as immediate', () => {
  const result = resolveBillingEntitlement(
    subscription({ cancel_at_period_end: true }),
    now,
  );
  assert.equal(result.tier, 'pro');
  assert.equal(result.cancelAtPeriodEnd, true);
  assert.equal(
    resolveBillingEntitlement(
      subscription({ status: 'canceled', cancel_at_period_end: true }),
      now,
    ).tier,
    'pro',
  );
});

test('past-due access has a bounded three-day grace period', () => {
  assert.equal(
    resolveBillingEntitlement(
      subscription({
        status: 'past_due',
        current_period_end: '2026-08-01T00:00:00.000Z',
      }),
      now,
    ).tier,
    'pro',
  );
  assert.equal(
    resolveBillingEntitlement(
      subscription({
        status: 'past_due',
        current_period_end: '2026-07-30T23:59:59.000Z',
      }),
      now,
    ).tier,
    'free',
  );
});

test('unpaid, incomplete, paused, and expired cancellation are Free', () => {
  for (const status of [
    'unpaid',
    'incomplete',
    'incomplete_expired',
    'paused',
  ]) {
    assert.equal(
      resolveBillingEntitlement(subscription({ status }), now).tier,
      'free',
    );
  }

  assert.equal(
    resolveBillingEntitlement(
      subscription({
        status: 'canceled',
        cancel_at_period_end: false,
        current_period_end: '2026-08-04T00:00:00.000Z',
      }),
      now,
    ).tier,
    'free',
  );

  assert.equal(
    resolveBillingEntitlement(
      subscription({
        status: 'canceled',
        cancel_at_period_end: true,
        current_period_end: '2026-08-02T00:00:00.000Z',
      }),
      now,
    ).tier,
    'free',
  );
});

test('recognizes only persisted Stripe subscription statuses', () => {
  assert.equal(isKnownSubscriptionStatus('active'), true);
  assert.equal(isKnownSubscriptionStatus('admin_override'), false);
});
