import { createClient } from '@/lib/supabase/server';
import { getServerAuthOrigin } from '@/lib/auth-redirect';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const baseUrl = getServerAuthOrigin(requestUrl.origin);
  const code = requestUrl.searchParams.get('code');
  const providerError = requestUrl.searchParams.get('error');

  if (providerError || !code) {
    return NextResponse.redirect(
      `${baseUrl}/auth?error=${encodeURIComponent(providerError || 'invalid_recovery_link')}`,
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Password recovery code exchange failed:', error.message);
      return NextResponse.redirect(
        `${baseUrl}/auth?error=invalid_recovery_link`,
      );
    }

    return NextResponse.redirect(`${baseUrl}/auth/reset-password`);
  } catch (error) {
    console.error(
      'Unexpected password recovery callback error:',
      error instanceof Error ? error.name : 'UnknownError',
    );
    return NextResponse.redirect(
      `${baseUrl}/auth?error=unexpected_recovery_error`,
    );
  }
}
