const FALLBACK_ORIGIN = 'https://www.anisora.ai';
const RETURN_URL_BASE = 'https://anisora.invalid';
export const AUTH_RETURN_COOKIE = 'anisora-auth-return';

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

export function getAuthErrorMessage(value: string | null | undefined) {
  if (!value) return null;

  if (
    value === 'access_denied' ||
    value === 'invalid_recovery_link' ||
    value === 'otp_expired'
  ) {
    return 'This sign-in or recovery link is invalid or has expired. Request a new link and try again.';
  }

  if (value === 'unexpected_recovery_error') {
    return "We couldn't verify this password recovery link. Request a new link and try again.";
  }

  return "We couldn't complete authentication. Please try again.";
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

export function persistAuthReturnPath(value?: string | null) {
  if (typeof document === 'undefined') return;

  const returnPath = sanitizeReturnPath(value);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AUTH_RETURN_COOKIE}=${encodeURIComponent(returnPath)}; Path=/; Max-Age=3600; SameSite=Lax${secure}`;
}

export function readAuthReturnPath(value?: string | null) {
  if (!value) return '/dashboard';

  try {
    return sanitizeReturnPath(decodeURIComponent(value));
  } catch {
    return '/dashboard';
  }
}
