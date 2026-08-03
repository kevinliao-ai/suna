import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAuthErrorMessage,
  readAuthReturnPath,
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

test('restores only safe URL-encoded return paths from the auth cookie', () => {
  assert.equal(
    readAuthReturnPath('%2Fdashboard%3Fproject%3Ddemo'),
    '/dashboard?project=demo',
  );
  assert.equal(readAuthReturnPath('%2F%2Fevil.example'), '/dashboard');
  assert.equal(readAuthReturnPath('%E0%A4%A'), '/dashboard');
});

test('describes expired authentication links without reflecting provider text', () => {
  for (const value of [
    'access_denied',
    'invalid_recovery_link',
    'otp_expired',
  ]) {
    assert.match(getAuthErrorMessage(value), /invalid or has expired/);
  }

  assert.equal(getAuthErrorMessage(null), null);
});

test('uses a safe generic message for unknown authentication errors', () => {
  assert.equal(
    getAuthErrorMessage('<script>alert(1)</script>'),
    "We couldn't complete authentication. Please try again.",
  );
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
