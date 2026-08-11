import { createHash, createHmac, createPublicKey, verify } from 'node:crypto';

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


function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest();
}

function r2ObjectUrl(key: string) {
  const accountId = requiredEnvironment('R2_ACCOUNT_ID');
  const bucket = requiredEnvironment('R2_BUCKET');
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return new URL(`/${encodeURIComponent(bucket)}/${encodedKey}`, `https://${accountId}.r2.cloudflarestorage.com`);
}

async function putR2Object(key: string, body: Buffer, contentType: string) {
  const accessKeyId = requiredEnvironment('R2_ACCESS_KEY_ID');
  const secretAccessKey = requiredEnvironment('R2_SECRET_ACCESS_KEY');
  const url = r2ObjectUrl(key);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = createHash('sha256').update(body).digest('hex');
  const canonicalHeaders =
    `content-type:${contentType}\nhost:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    'PUT',
    url.pathname,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, 'auto');
  const serviceKey = hmac(regionKey, 's3');
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body: body.buffer.slice(
      body.byteOffset,
      body.byteOffset + body.byteLength,
    ) as ArrayBuffer,
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    throw new Error(`R2 archive failed (${response.status}).`);
  }
}

export async function archiveGenerationMedia({
  taskId,
  projectId,
  userId,
  kind,
  mediaUrl,
  contentType,
}: {
  taskId: string;
  projectId: string;
  userId: string;
  kind: FalGenerationKind;
  mediaUrl: string;
  contentType: string;
}) {
  if (
    !process.env.R2_ACCOUNT_ID
    || !process.env.R2_BUCKET
    || !process.env.R2_ACCESS_KEY_ID
    || !process.env.R2_SECRET_ACCESS_KEY
  ) {
    return null;
  }

  const source = await fetch(mediaUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!source.ok) throw new Error('Could not download generated media for archiving.');

  const declaredSize = Number(source.headers.get('content-length') || 0);
  if (declaredSize > 50_000_000) {
    throw new Error('Generated media exceeds the 50 MB archive limit.');
  }

  const body = Buffer.from(await source.arrayBuffer());
  if (body.byteLength > 50_000_000) {
    throw new Error('Generated media exceeds the 50 MB archive limit.');
  }

  const extension =
    contentType.includes('video') ? 'mp4' : contentType.includes('png') ? 'png' : 'jpg';
  const key = `users/${userId}/projects/${projectId}/tasks/${taskId}.${extension}`;
  await putR2Object(key, body, contentType);
  return key;
}
