export const EMBED_HOSTS = new Set([
  'indexteam-indextts-2-demo.ms.show',
  'indexteam-indextts-2-demo.hf.space',
]);

export const DEFAULT_INDEX_TTS_EMBED_URL =
  'https://indexteam-indextts-2-demo.hf.space/?__theme=dark';

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
 * The remaining voice embed URL is shipped to the browser and must never
 * contain a real secret.
 * Temporary access parameters can be configured in Vercel for rotation, but
 * proper protection requires a server-side API or a short-lived token exchange.
 */
export const embedConfig = Object.freeze({
  indexTts: resolveEmbedUrl(
    process.env.NEXT_PUBLIC_INDEX_TTS_EMBED_URL,
    DEFAULT_INDEX_TTS_EMBED_URL,
  ),
});
