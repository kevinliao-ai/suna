import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createQuickGenerationProjectSettings,
  normalizeQuickGenerationPrompt,
  quickGenerationImageLimit,
  quickGenerationPromptLimit,
  readQuickGenerationImageType,
} from '../src/lib/generation/quick-input.ts';

const routeUrl = new URL('../src/app/api/generation/quick/route.ts', import.meta.url);
const componentUrl = new URL(
  '../src/components/home/sections/home-quick-generator.tsx',
  import.meta.url,
);

test('quick generation creates a single-shot Director project', () => {
  const prompt = 'A girl turns toward the camera as petals drift past.';
  const { name, settings } = createQuickGenerationProjectSettings(prompt);
  assert.ok(name.length <= 120);
  assert.equal(settings.product, 'anisora-anime-director-plan');
  assert.equal(settings.director.plan.shots.length, 1);
  assert.equal(settings.director.plan.shots[0].id, 'shot-1');
  assert.equal(settings.director.plan.shots[0].visualPrompt, prompt);
  assert.equal(settings.director.plan.estimatedSeconds, 5);
});

test('quick generation rejects free accounts before reading uploads or spending', async () => {
  const source = await readFile(routeUrl, 'utf8');
  const entitlement = source.indexOf("creditState.entitlement.tier !== 'pro'");
  assert.ok(entitlement > 0);
  for (const later of [
    'request.formData()',
    "getFalGenerationQuote('video', { fresh: true })",
    '.upload(imagePath',
    ".from('anisora_tasks').insert",
  ]) {
    assert.ok(entitlement < source.indexOf(later), later);
  }
  assert.ok(
    source.indexOf('reserveGenerationCredits(') < source.indexOf('submitFalRequest({'),
  );
  assert.match(source, /catch \(submissionError\) \{\s+await releaseGenerationCredits/);
  assert.match(source, /public: false/);
});

test('homepage generator analytics never include the prompt or image', async () => {
  const source = await readFile(componentUrl, 'utf8');
  const captures = source.match(/posthog\.capture\([^;]*\);/gs) || [];
  assert.ok(captures.length >= 5);
  for (const capture of captures) {
    assert.doesNotMatch(capture, /prompt|image:|imageUrl|mediaUrl/);
  }
});

test('quick generation prompt is trimmed and bounded', () => {
  assert.equal(normalizeQuickGenerationPrompt('  anime scene prompt  '), 'anime scene prompt');
  assert.equal(normalizeQuickGenerationPrompt('short'), null);
  assert.equal(normalizeQuickGenerationPrompt('x'.repeat(quickGenerationPromptLimit + 1)), null);
  assert.equal(normalizeQuickGenerationPrompt(null), null);
});

test('quick generation image type must match its file signature', () => {
  assert.equal(
    readQuickGenerationImageType(
      'image/jpeg',
      new Uint8Array([0xff, 0xd8, 0xff, 0x00]),
    ),
    'jpg',
  );
  assert.equal(
    readQuickGenerationImageType(
      'image/png',
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    'png',
  );
  assert.equal(
    readQuickGenerationImageType(
      'image/webp',
      new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
    ),
    'webp',
  );
  assert.equal(
    readQuickGenerationImageType('image/jpeg', new Uint8Array([0x89, 0x50, 0x4e, 0x47])),
    null,
  );
  assert.equal(
    readQuickGenerationImageType(
      'image/jpeg',
      new Uint8Array(quickGenerationImageLimit + 1),
    ),
    null,
  );
});