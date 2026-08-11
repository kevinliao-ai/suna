import { createHash, createPublicKey, verify } from 'node:crypto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const falJwksUrl = 'https://rest.fal.ai/.well-known/jwks.json';
const maxWebhookSkewSeconds = 300;
const jwksCacheMs = 23 * 60 * 60 * 1000;

let adminClient: SupabaseClient | null = null;
let jwksCache: { keys: Array<{ kty: string; crv: string; x: string }>; expiresAt: number } | null = null;

export class GenerationConfigurationError extends Error {}

function requiredEnvironment(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  throw new GenerationConfigurationError(`${names.join(' or ')} is not configured.`);
}

export function getGenerationAdminClient() {
  if (!adminClient) {
    adminClient = createClient(
      requiredEnvironment('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnvironment('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return adminClient;
}

export type FalGenerationKind = 'reference' | 'video';

export const falModels: Record<FalGenerationKind, string> = {
  reference: 'fal-ai/flux/schnell',
  video: 'fal-ai/kling-video/v2.1/standard/image-to-video',
};

export async function submitFalRequest({
  kind,
  input,
  webhookUrl,
}: {
  kind: FalGenerationKind;
  input: Record<string, unknown>;
  webhookUrl: string;
}) {
  const model = falModels[kind];
  const endpoint = new URL(`https://queue.fal.run/${model}`);
  endpoint.searchParams.set('fal_webhook', webhookUrl);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Key ${requiredEnvironment('FAL_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15_000),
  });

  const payload = (await response.json().catch(() => null)) as {
    request_id?: unknown;
    detail?: unknown;
  } | null;

  if (!response.ok || typeof payload?.request_id !== 'string') {
    throw new Error(
      `fal queue rejected the request (${response.status}).`,
    );
  }

  return { requestId: payload.request_id, model };
}

async function getFalJwks() {
  if (jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys;

  const response = await fetch(falJwksUrl, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Could not load fal webhook public keys.');

  const payload = (await response.json()) as {
    keys?: Array<{ kty?: unknown; crv?: unknown; x?: unknown }>;
  };
  const keys = (payload.keys || [])
    .filter(
      (key): key is { kty: string; crv: string; x: string } =>
        key.kty === 'OKP' && key.crv === 'Ed25519' && typeof key.x === 'string',
    );

  if (keys.length === 0) throw new Error('fal webhook public keys are unavailable.');
  jwksCache = { keys, expiresAt: Date.now() + jwksCacheMs };
  return keys;
}

export async function verifyFalWebhook(request: Request, rawBody: string) {
  const requestId = request.headers.get('x-fal-webhook-request-id');
  const userId = request.headers.get('x-fal-webhook-user-id');
  const timestamp = request.headers.get('x-fal-webhook-timestamp');
  const signatureHex = request.headers.get('x-fal-webhook-signature');

  if (!requestId || !userId || !timestamp || !signatureHex) return false;

  const timestampNumber = Number(timestamp);
  if (
    !Number.isInteger(timestampNumber)
    || Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > maxWebhookSkewSeconds
    || !/^[0-9a-f]+$/i.test(signatureHex)
  ) {
    return false;
  }

  const bodyHash = createHash('sha256').update(rawBody).digest('hex');
  const message = Buffer.from(
    [requestId, userId, timestamp, bodyHash].join('\n'),
    'utf8',
  );
  const signature = Buffer.from(signatureHex, 'hex');
  const keys = await getFalJwks();

  return keys.some((key) => {
    try {
      const publicKey = createPublicKey({
        key: { kty: key.kty, crv: key.crv, x: key.x },
        format: 'jwk',
      });
      return verify(null, message, publicKey, signature);
    } catch {
      return false;
    }
  });
}

export function extractFalMedia(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const value = payload as {
    images?: Array<{ url?: unknown; content_type?: unknown }>;
    video?: { url?: unknown; content_type?: unknown };
  };

  const candidate = value.video || value.images?.[0];
  if (!candidate || typeof candidate.url !== 'string') return null;

  try {
    const url = new URL(candidate.url);
    if (url.protocol !== 'https:') return null;
    return {
      url: url.toString(),
      contentType:
        typeof candidate.content_type === 'string'
          ? candidate.content_type
          : value.video
            ? 'video/mp4'
            : 'image/jpeg',
    };
  } catch {
    return null;
  }
}
