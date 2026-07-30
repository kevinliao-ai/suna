import { createClient } from '@/lib/supabase/server';
import { getServerAuthOrigin, sanitizeReturnPath } from '@/lib/auth-redirect';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = sanitizeReturnPath(requestUrl.searchParams.get('returnUrl'));
  const baseUrl = getServerAuthOrigin(requestUrl.origin);
  const providerError = requestUrl.searchParams.get('error');

  if (providerError) {
    console.error(
      'Auth callback error:',
      providerError,
      requestUrl.searchParams.get('error_description'),
    );
    return NextResponse.redirect(
      `${baseUrl}/auth?error=${encodeURIComponent(providerError)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        `${baseUrl}/auth?error=${encodeURIComponent(error.message)}`,
      );
    }

    return NextResponse.redirect(`${baseUrl}${next}`);
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(`${baseUrl}/auth?error=unexpected_error`);
  }
}
