import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const requestedPath =
    requestUrl.searchParams.get('returnUrl') ?? '/dashboard';
  const next =
    requestedPath.startsWith('/') && !requestedPath.startsWith('//')
      ? requestedPath
      : '/dashboard';
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
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
