import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { brandPages, officialRepositoryUrl } from '../src/lib/anisora-brand-pages.ts';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('brand ranking pages each target one unique keyword and canonical', () => {
  const slugs = new Set(brandPages.map((page) => page.slug));
  const keywords = new Set(brandPages.map((page) => page.keyword));
  assert.equal(slugs.size, brandPages.length);
  assert.equal(keywords.size, brandPages.length);
  for (const page of brandPages) {
    assert.match(page.slug, /^[a-z0-9-]+$/);
    assert.ok(page.metaTitle.includes(page.keyword), page.slug);
    assert.ok(page.description.length >= 110 && page.description.length <= 170, page.slug);
    assert.ok(page.faq.length >= 4, page.slug);
    assert.ok(page.sections.length >= 4, page.slug);
    assert.match(page.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test('brand pages disclose independence and the hosted model honestly', () => {
  for (const page of brandPages) {
    const text = JSON.stringify(page);
    assert.match(text, /independent/i, page.slug);
    assert.match(text, /Kling 2\.1/, page.slug);
    assert.equal(page.sources[0].url, officialRepositoryUrl);
    assert.doesNotMatch(text, /coming soon|preview only|lorem|TODO/i, page.slug);
  }
});

test('brand pages are routed, canonical, and listed with content dates', async () => {
  const component = await read('../src/components/brand/brand-model-page.tsx');
  const sitemap = await read('../src/app/sitemap.ts');
  assert.match(component, /canonical: `\/\$\{page\.slug\}`/);
  assert.match(component, /<StructuredData/);
  assert.match(sitemap, /brandPages\.map/);
  assert.match(sitemap, /route\.updatedAt/);
  for (const page of brandPages) {
    const route = await read(`../src/app/(home)/${page.slug}/page.tsx`);
    assert.match(route, new RegExp(`getBrandPage\\('${page.slug}'\\)`));
  }
});
