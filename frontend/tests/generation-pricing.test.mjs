import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGenerationQuote,
  generationHardLimit,
  quoteIsWithinLimit,
} from '../src/lib/generation/pricing.ts';

test('quotes a five-second video when fal bills by second', () => {
  const quote = buildGenerationQuote({
    kind: 'video',
    model: 'fal-ai/example',
    payload: {
      prices: [{
        endpoint_id: 'fal-ai/example',
        unit_price: 0.08,
        unit: 'second',
        currency: 'USD',
      }],
    },
    environment: { MAX_VIDEO_GENERATION_USD: '0.50' },
  });

  assert.equal(quote?.quantity, 5);
  assert.equal(quote?.estimatedCostUsd, 0.4);
  assert.equal(quoteIsWithinLimit(quote), true);
});

test('fails closed for missing, zero, or non-USD prices', () => {
  assert.equal(buildGenerationQuote({ kind: 'reference', model: 'x', payload: {} }), null);
  assert.equal(buildGenerationQuote({
    kind: 'reference', model: 'x', payload: {
      prices: [{ endpoint_id: 'x', unit_price: 0, unit: 'image', currency: 'USD' }],
    },
  }), null);
  assert.equal(buildGenerationQuote({
    kind: 'reference', model: 'x', payload: {
      prices: [{ endpoint_id: 'x', unit_price: 1, unit: 'image', currency: 'EUR' }],
    },
  }), null);
  assert.equal(buildGenerationQuote({
    kind: 'video', model: 'x', payload: {
      prices: [{ endpoint_id: 'x', unit_price: 1, unit: 'mystery_unit', currency: 'USD' }],
    },
  }), null);
});

test('adds a conservative margin when reference images are billed by megapixel', () => {
  const quote = buildGenerationQuote({
    kind: 'reference', model: 'x', payload: {
      prices: [{ endpoint_id: 'x', unit_price: 0.03, unit: 'megapixel', currency: 'USD' }],
    },
  });
  assert.equal(quote?.quantity, 1.1);
  assert.equal(quote?.estimatedCostUsd, 0.033);
});

test('uses conservative defaults and rejects quotes over the hard limit', () => {
  assert.equal(generationHardLimit('reference', {}), 0.2);
  assert.equal(generationHardLimit('video', {}), 2);
  assert.equal(quoteIsWithinLimit({
    currency: 'USD', estimatedCostUsd: 2.01, hardLimitUsd: 2,
    model: 'x', quantity: 1, unit: 'video', unitPriceUsd: 2.01,
  }), false);
});
