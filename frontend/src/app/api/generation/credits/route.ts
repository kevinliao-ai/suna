import { NextResponse } from 'next/server';

import { ensureGenerationCreditBalance } from '@/lib/generation/credit-server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Sign in is required.' } }, { status: 401 });
  }

  try {
    const state = await ensureGenerationCreditBalance(user.id);
    return NextResponse.json(state, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json(
      { error: { code: 'credits_unavailable', message: 'Generation credits are temporarily unavailable.' } },
      { status: 503 },
    );
  }
}
