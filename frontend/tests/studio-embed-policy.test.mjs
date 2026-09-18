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
const nativeAnimeUrl = new URL(
  '../src/components/native-anime-workspace.tsx',
  import.meta.url,
);
const vercelConfigUrl = new URL('../vercel.json', import.meta.url);

test('anime video is native while the external voice tool stays in Studio', async () => {
  const [dashboard, toolEmbed, homeContent, nativeAnime, vercelConfig] =
    await Promise.all([
      readFile(dashboardUrl, 'utf8'),
      readFile(toolEmbedUrl, 'utf8'),
      readFile(homeContentUrl, 'utf8'),
      readFile(nativeAnimeUrl, 'utf8'),
      readFile(vercelConfigUrl, 'utf8'),
    ]);

  assert.doesNotMatch(dashboard, /Open tool in a new tab/);
  assert.doesNotMatch(dashboard, /href=\{activeTool\.url\}/);
  assert.match(dashboard, /activeTool\.kind === 'native'/);
  assert.match(dashboard, /<NativeAnimeWorkspace/);
  assert.doesNotMatch(toolEmbed, /Open provider/);
  assert.doesNotMatch(toolEmbed, /allow-popups/);
  assert.doesNotMatch(homeContent, /open an external application/i);
  assert.match(homeContent, /Anime Director/);
  assert.match(nativeAnime, /buildDirectorHandoffHref/);
  assert.match(nativeAnime, /href=\{directorHref\}/);
  assert.match(nativeAnime, /No ModelScope iframe/);
  assert.doesNotMatch(dashboard, /bilibili-index-anisora\.ms\.show/);
  assert.doesNotMatch(vercelConfig, /bilibili-index-anisora\.ms\.show/);
});
