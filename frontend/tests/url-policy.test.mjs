import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_ANISORA_EMBED_URL,
  resolveEmbedUrl,
} from '../src/lib/embed-config.ts';
import { parseSoraShareUrl } from '../src/lib/sora-url-policy.ts';

test('embed URL policy accepts the configured trusted host', () => {
  const value = 'https://bilibili-index-anisora.ms.show/?__theme=dark';
  assert.equal(resolveEmbedUrl(value, DEFAULT_ANISORA_EMBED_URL), value);
});

test('embed URL policy rejects HTTP and untrusted hosts', () => {
  assert.equal(
    resolveEmbedUrl(
      'http://bilibili-index-anisora.ms.show/',
      DEFAULT_ANISORA_EMBED_URL,
    ),
    DEFAULT_ANISORA_EMBED_URL,
  );
  assert.equal(
    resolveEmbedUrl('https://example.com/', DEFAULT_ANISORA_EMBED_URL),
    DEFAULT_ANISORA_EMBED_URL,
  );
});

test('Sora policy accepts exact official HTTPS hosts', () => {
  assert.equal(
    parseSoraShareUrl('https://sora.com/share/example')?.hostname,
    'sora.com',
  );
  assert.equal(
    parseSoraShareUrl('https://www.sora.com/share/example')?.hostname,
    'www.sora.com',
  );
});

test('Sora policy rejects deceptive, insecure, and malformed URLs', () => {
  assert.equal(parseSoraShareUrl('http://sora.com/share/example'), null);
  assert.equal(parseSoraShareUrl('https://sora.com.evil.test/share'), null);
  assert.equal(parseSoraShareUrl('not-a-url'), null);
});
