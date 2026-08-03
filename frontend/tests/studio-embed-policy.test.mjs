import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const dashboardUrl = new URL(
  '../src/app/(dashboard)/dashboard/page.tsx',
  import.meta.url,
);
const toolEmbedUrl = new URL(
  '../src/components/tool-embed.tsx',
  import.meta.url,
);
const homeContentUrl = new URL('../src/lib/home.tsx', import.meta.url);

test('external creative tools stay inside the Studio embed', async () => {
  const [dashboard, toolEmbed, homeContent] = await Promise.all([
    readFile(dashboardUrl, 'utf8'),
    readFile(toolEmbedUrl, 'utf8'),
    readFile(homeContentUrl, 'utf8'),
  ]);

  assert.doesNotMatch(dashboard, /Open tool in a new tab/);
  assert.doesNotMatch(dashboard, /href=\{activeTool\.url\}/);
  assert.doesNotMatch(toolEmbed, /Open provider/);
  assert.doesNotMatch(toolEmbed, /allow-popups/);
  assert.doesNotMatch(homeContent, /open an external application/i);
  assert.match(homeContent, /run inside AniSora Studio/);
});
