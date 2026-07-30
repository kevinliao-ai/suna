const ALLOWED_SORA_HOSTS = new Set(['sora.com', 'www.sora.com']);

export function parseSoraShareUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ALLOWED_SORA_HOSTS.has(url.hostname)
      ? url
      : null;
  } catch {
    return null;
  }
}
