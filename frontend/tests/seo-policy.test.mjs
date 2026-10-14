import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('indexable pages declare their own canonical instead of inheriting the homepage', async () => {
  for (const path of ['../src/app/pricing/page.tsx', '../src/app/legal/page.tsx']) {
    assert.match(await read(path), /canonical:/, path);
  }
});

test('structured data is rendered into server HTML', async () => {
  const source = await read('../src/components/seo/structured-data.tsx');
  assert.doesNotMatch(source, /next\/script/);
  assert.match(source, /<script/);
  assert.match(source, /replace\(\/<\/g/);
});

test('homepage FAQ answers stay in the server HTML', async () => {
  const faq = await read('../src/components/home/sections/faq-section.tsx');
  const home = await read('../src/app/(home)/page.tsx');
  assert.match(faq, /<AccordionContent\s+forceMount/);
  assert.match(home, /<StructuredData faq=\{faq\} \/>/);
});

test('the discontinued Sora resolver is excluded from search', async () => {
  const page = await read('../src/app/(home)/sora-watermark-remove/page.tsx');
  const sitemap = await read('../src/app/sitemap.ts');
  assert.match(page, /robots: \{ index: false, follow: true \}/);
  assert.doesNotMatch(sitemap, /sora-watermark-remove/);
});
