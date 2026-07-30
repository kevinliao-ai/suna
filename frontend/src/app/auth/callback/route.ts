import { createClient } from '@/lib/supabase/server';
import {
  AUTH_RETURN_COOKIE,
  getServerAuthOrigin,
  readAuthReturnPath,
  sanitizeReturnPath,
} from '@/lib/auth-redirect';
import { NextResponse, type NextRequest } from 'next/server';

function redirectAndClearReturnCookie(url: string) {
  const response = NextResponse.redirect(url);
  response.cookies.delete(AUTH_RETURN_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const returnCookie = request.cookies.get(AUTH_RETURN_COOKIE)?.value;
  const next = returnCookie
    ? readAuthReturnPath(returnCookie)
    : sanitizeReturnPath(requestUrl.searchParams.get('returnUrl'));
  const baseUrl = getServerAuthOrigin(requestUrl.origin);
  const providerError = requestUrl.searchParams.get('error');

  if (providerError) {
    console.error(
      'Auth callback error:',
      providerError,
      requestUrl.searchParams.get('error_description'),
    );
    return redirectAndClearReturnCookie(
      `${baseUrl}/auth?error=${encodeURIComponent(providerError)}`,
    );
  }

  if (!code) {
    return redirectAndClearReturnCookie(`${baseUrl}/auth`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging auth code:', error.message);
      return redirectAndClearReturnCookie(
        `${baseUrl}/auth?error=${encodeURIComponent(error.message)}`,
      );
    }

    return redirectAndClearReturnCookie(`${baseUrl}${next}`);
  } catch (error) {
    console.error(
      'Unexpected error in auth callback:',
      error instanceof Error ? error.name : 'UnknownError',
    );
    return redirectAndClearReturnCookie(
      `${baseUrl}/auth?error=unexpected_error`,
    );
  }
}
