import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolveAuthOrigin,
  sanitizeReturnPath,
} from '../src/lib/auth-redirect.ts';

test('accepts same-origin return paths with query strings and fragments', () => {
  assert.equal(
    sanitizeReturnPath('/dashboard?project=demo#tasks'),
    '/dashboard?project=demo#tasks',
  );
});

test('rejects protocol-relative, absolute, backslash, and control URLs', () => {
  for (const value of [
    '//example.com',
    'https://example.com',
    '/\\example.com',
    '/dashboard\nSet-Cookie:test',
    '',
  ]) {
    assert.equal(sanitizeReturnPath(value), '/dashboard');
  }
});

test('uses the exact Vercel Preview origin for Preview auth callbacks', () => {
  assert.equal(
    resolveAuthOrigin({
      requestOrigin: 'https://anisora-git-demo.example.vercel.app',
      siteUrl: 'https://www.anisora.ai',
      vercelBranchUrl: 'anisora-git-demo.example.vercel.app',
      vercelEnv: 'preview',
      vercelUrl: 'anisora-immutable.example.vercel.app',
    }),
    'https://anisora-git-demo.example.vercel.app',
  );
});

test('rejects a spoofed Preview request origin', () => {
  assert.equal(
    resolveAuthOrigin({
      requestOrigin: 'https://attacker.example',
      siteUrl: 'https://www.anisora.ai',
      vercelBranchUrl: 'anisora-git-demo.example.vercel.app',
      vercelEnv: 'preview',
      vercelUrl: 'anisora-immutable.example.vercel.app',
    }),
    'https://anisora-git-demo.example.vercel.app',
  );
});

test('uses the configured production origin outside Preview', () => {
  assert.equal(
    resolveAuthOrigin({
      requestOrigin: 'https://untrusted.example',
      siteUrl: 'https://www.anisora.ai/path',
      vercelEnv: 'production',
    }),
    'https://www.anisora.ai',
  );
});

test('allows only local HTTP origins during development', () => {
  assert.equal(
    resolveAuthOrigin({
      nodeEnv: 'development',
      requestOrigin: 'http://localhost:3000',
    }),
    'http://localhost:3000',
  );
  assert.equal(
    resolveAuthOrigin({
      nodeEnv: 'development',
      requestOrigin: 'http://example.com',
    }),
    'https://www.anisora.ai',
  );
});
