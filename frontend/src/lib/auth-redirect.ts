const FALLBACK_ORIGIN = 'https://www.anisora.ai';
const RETURN_URL_BASE = 'https://anisora.invalid';

interface AuthOriginOptions {
  nodeEnv?: string;
  requestOrigin?: string;
  siteUrl?: string;
  vercelBranchUrl?: string;
  vercelEnv?: string;
  vercelUrl?: string;
}

function normalizeHttpsOrigin(value?: string) {
  if (!value) return null;

  const candidate = value.includes('://') ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function normalizeLocalOrigin(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    ) {
      return url.origin;
    }
  } catch {
    return null;
  }

  return null;
}

export function sanitizeReturnPath(
  value: string | null | undefined,
  fallback = '/dashboard',
) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  if (value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) {
    return fallback;
  }

  try {
    const url = new URL(value, RETURN_URL_BASE);
    if (url.origin !== RETURN_URL_BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function resolveAuthOrigin(options: AuthOriginOptions = {}) {
  if (options.vercelEnv === 'preview') {
    const requestOrigin = normalizeHttpsOrigin(options.requestOrigin);
    const branchOrigin = normalizeHttpsOrigin(options.vercelBranchUrl);
    const deploymentOrigin = normalizeHttpsOrigin(options.vercelUrl);

    if (
      requestOrigin &&
      [branchOrigin, deploymentOrigin].includes(requestOrigin)
    ) {
      return requestOrigin;
    }

    if (branchOrigin) return branchOrigin;
    if (deploymentOrigin) return deploymentOrigin;
  }

  if (options.nodeEnv === 'development') {
    const localOrigin = normalizeLocalOrigin(options.requestOrigin);
    if (localOrigin) return localOrigin;
  }

  return (
    normalizeHttpsOrigin(options.siteUrl) ||
    normalizeHttpsOrigin(options.requestOrigin) ||
    FALLBACK_ORIGIN
  );
}

export function getServerAuthOrigin(requestOrigin?: string) {
  return resolveAuthOrigin({
    nodeEnv: process.env.NODE_ENV,
    requestOrigin,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
  });
}
