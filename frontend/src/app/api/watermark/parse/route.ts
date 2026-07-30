import { NextResponse, type NextRequest } from 'next/server';
import { parseSoraShareUrl } from '@/lib/sora-url-policy';

const MAX_BODY_BYTES = 4096;
const MAX_URL_LENGTH = 2048;

interface ResolverResponse {
  links?: {
    mp4?: unknown;
    thumbnail?: unknown;
    post_id?: unknown;
  };
}

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ success: false, error, message }, { status });
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function errorName(error: unknown) {
  return error instanceof Error ? error.name : '';
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.startsWith('application/json')) {
    return errorResponse(
      415,
      'Unsupported media type',
      'Send the request as JSON.',
    );
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
    return errorResponse(413, 'Payload too large', 'The request is too large.');
  }

  let body: { videoUrl?: unknown };
  try {
    body = (await request.json()) as { videoUrl?: unknown };
  } catch {
    return errorResponse(400, 'Invalid JSON', 'Provide a valid JSON request.');
  }

  try {
    if (
      typeof body.videoUrl !== 'string' ||
      body.videoUrl.length > MAX_URL_LENGTH
    ) {
      return errorResponse(
        400,
        'Invalid video URL',
        'Provide a valid Sora share link.',
      );
    }

    const videoUrl = parseSoraShareUrl(body.videoUrl);
    if (!videoUrl) {
      return errorResponse(
        400,
        'Unsupported URL',
        'Only official sora.com HTTPS share links are accepted.',
      );
    }

    const resolverUrl = `https://api.dyysy.com/links/${encodeURIComponent(
      videoUrl.toString(),
    )}`;
    const response = await fetch(resolverUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AniSora-Link-Resolver/1.0',
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });

    if (response.status === 404) {
      return errorResponse(
        404,
        'Video not found',
        'The provider could not resolve this share link.',
      );
    }
    if (response.status === 429) {
      return errorResponse(
        429,
        'Rate limit exceeded',
        'The external provider is busy. Try again later.',
      );
    }
    if (!response.ok) {
      console.error('Resolver request failed:', response.status);
      return errorResponse(
        502,
        'Provider request failed',
        'The external resolver is temporarily unavailable.',
      );
    }

    const data = (await response.json()) as ResolverResponse;
    if (!isHttpsUrl(data.links?.mp4)) {
      return errorResponse(
        502,
        'Invalid provider response',
        'The external resolver returned an invalid media link.',
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        links: {
          mp4: data.links.mp4,
          thumbnail: isHttpsUrl(data.links?.thumbnail)
            ? data.links.thumbnail
            : '',
          post_id:
            typeof data.links?.post_id === 'string' ? data.links.post_id : '',
        },
        provider: 'external',
        parsedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const name = errorName(error);
    console.error('Sora link resolver error:', name || 'UnknownError');
    if (['AbortError', 'TimeoutError'].includes(name)) {
      return errorResponse(
        504,
        'Request timeout',
        'The external resolver did not respond in time.',
      );
    }
    return errorResponse(
      500,
      'Internal server error',
      'The request could not be processed.',
    );
  }
}
