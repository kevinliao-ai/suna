import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  authPricingHref,
  normalizeConversionSource,
  pricingHref,
} from '../src/lib/conversion-source.ts';

test('conversion sources are normalized into privacy-safe Stripe metadata', () => {
  assert.equal(normalizeConversionSource('Director-First-Project'), 'director-first-project');
  assert.equal(normalizeConversionSource('  model-comparison  '), 'model-comparison');
  assert.equal(normalizeConversionSource('../../evil'), 'direct');
  assert.equal(normalizeConversionSource('email@example.com'), 'direct');
  assert.equal(normalizeConversionSource('a'.repeat(65)), 'direct');
  assert.equal(normalizeConversionSource(undefined), 'direct');
});

test('pricing attribution survives the authentication return path', () => {
  assert.equal(
    pricingHref('director-generation-gate'),
    '/pricing?source=director-generation-gate',
  );
  assert.equal(
    authPricingHref('director-generation-gate'),
    '/auth?returnUrl=%2Fpricing%3Fsource%3Ddirector-generation-gate',
  );
});

test('checkout persists attribution through Stripe and both return paths', async () => {
  const checkout = await readFile(
    new URL('../src/app/api/billing/checkout/route.ts', import.meta.url),
    'utf8',
  );

  assert.match(checkout, /anisora_conversion_source: conversionSource/g);
  assert.match(checkout, /dashboard\?billing=success&source=/);
  assert.match(checkout, /pricing\?checkout=canceled&source=/);
});

test('the activation-to-paid funnel captures intent without prompts or scripts', async () => {
  const sources = await Promise.all(
    [
      '../src/components/pricing-funnel-tracker.tsx',
      '../src/components/billing-action-button.tsx',
      '../src/components/anime-director/director-generation-panel.tsx',
      '../src/components/anime-director/director-planner.tsx',
      '../src/app/(dashboard)/dashboard/page.tsx',
    ].map((path) => readFile(new URL(path, import.meta.url), 'utf8')),
  );
  const source = sources.join('\n');

  for (const event of [
    'pricing_viewed',
    'director_plan_exported',
    'director_project_created',
    'director_generation_paywall_viewed',
    'director_generation_upgrade_clicked',
    'director_generation_started',
    'director_generation_submitted',
    'director_generation_failed',
    'billing_checkout_started',
    'billing_checkout_created',
    'billing_checkout_returned_success',
    'billing_checkout_returned_canceled',
  ]) {
    assert.match(source, new RegExp(event));
  }

  assert.doesNotMatch(
    source,
    /posthog\.capture\([^;]*\b(email|prompt|script)\s*:/is,
  );
});
