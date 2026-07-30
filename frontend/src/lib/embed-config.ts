export const EMBED_HOSTS = new Set([
  'bilibili-index-anisora.ms.show',
  'indexteam-indextts-2-demo.ms.show',
]);

export const DEFAULT_ANISORA_EMBED_URL =
  'https://bilibili-index-anisora.ms.show/';
export const DEFAULT_INDEX_TTS_EMBED_URL =
  'https://indexteam-indextts-2-demo.ms.show/?__theme=dark&backend_url=/';

export function resolveEmbedUrl(
  value: string | undefined,
  fallback: string,
): string {
  try {
    const url = new URL(value || fallback);

    if (url.protocol !== 'https:' || !EMBED_HOSTS.has(url.hostname)) {
      return fallback;
    }

    return url.toString();
  } catch {
    return fallback;
  }
}

/**
 * These URLs are shipped to the browser and must never contain a real secret.
 * Temporary access parameters can be configured in Vercel for rotation, but
 * proper protection requires a server-side API or a short-lived token exchange.
 */
export const embedConfig = Object.freeze({
  anisora: resolveEmbedUrl(
    process.env.NEXT_PUBLIC_ANISORA_EMBED_URL,
    DEFAULT_ANISORA_EMBED_URL,
  ),
  indexTts: resolveEmbedUrl(
    process.env.NEXT_PUBLIC_INDEX_TTS_EMBED_URL,
    DEFAULT_INDEX_TTS_EMBED_URL,
  ),
});
