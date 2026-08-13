import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('pricing sells the production workflow and accurately discloses monthly credits', async () => {
  const source = await readFile(
    new URL('../src/app/pricing/page.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /PRO_MONTHLY_GENERATION_CREDITS/);
  assert.match(source, /Recipe-to-Director shot planning/);
  assert.match(source, /requires your approval before provider spend/);
  assert.match(source, /Annual plans still[\s\S]*refill generation credits monthly/);
  assert.doesNotMatch(source, /not third-party generation credits/);
});
