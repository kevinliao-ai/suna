import { NextResponse, type NextRequest } from 'next/server';
import { getServerAuthOrigin } from '@/lib/auth-redirect';
import {
  getAuthenticatedBillingUser,
  getBillingAdminClient,
  getStripeClient,
} from '@/lib/billing/server';
import { billingError, billingException } from '@/lib/billing/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedBillingUser();
    if (!user) {
      return billingError(
        401,
        'authentication_required',
        'Sign in to manage billing.',
      );
    }

    const { data: customer, error } = await getBillingAdminClient()
      .from('anisora_billing_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (!customer?.stripe_customer_id) {
      return billingError(
        404,
        'billing_account_missing',
        'No billing account exists for this user.',
      );
    }

    const origin = getServerAuthOrigin(request.nextUrl.origin);
    const session = await getStripeClient().billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    return billingException(error);
  }
}
