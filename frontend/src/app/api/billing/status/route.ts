import { NextResponse } from 'next/server';
import {
  getAuthenticatedBillingUser,
  getUserBillingEntitlement,
} from '@/lib/billing/server';
import { billingError, billingException } from '@/lib/billing/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedBillingUser();
    if (!user) {
      return billingError(
        401,
        'authentication_required',
        'Sign in to view billing.',
      );
    }

    const entitlement = await getUserBillingEntitlement(user.id);
    return NextResponse.json(
      { success: true, entitlement },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return billingException(error);
  }
}
