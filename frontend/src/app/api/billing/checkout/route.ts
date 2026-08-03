import { NextResponse, type NextRequest } from 'next/server';
import { getServerAuthOrigin } from '@/lib/auth-redirect';
import {
  getAuthenticatedBillingUser,
  getConfiguredPrice,
  getOrCreateStripeCustomer,
  getStripeClient,
  getUserBillingEntitlement,
} from '@/lib/billing/server';
import { billingError, billingException } from '@/lib/billing/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 1024;

export async function POST(request: NextRequest) {
  try {
    const contentType =
      request.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.startsWith('application/json')) {
      return billingError(
        415,
        'unsupported_media_type',
        'Send the request as JSON.',
      );
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
      return billingError(
        413,
        'payload_too_large',
        'The request is too large.',
      );
    }

    const user = await getAuthenticatedBillingUser();
    if (!user) {
      return billingError(
        401,
        'authentication_required',
        'Sign in to upgrade.',
      );
    }

    let body: { planId?: unknown };
    try {
      body = (await request.json()) as { planId?: unknown };
    } catch {
      return billingError(400, 'invalid_json', 'Provide a valid JSON request.');
    }

    if (typeof body.planId !== 'string') {
      return billingError(400, 'invalid_plan', 'Choose a valid billing plan.');
    }

    const configuredPrice = getConfiguredPrice(body.planId);
    if (!configuredPrice) {
      return billingError(400, 'invalid_plan', 'Choose a valid billing plan.');
    }

    const entitlement = await getUserBillingEntitlement(user.id);
    if (entitlement.tier === 'pro') {
      return billingError(
        409,
        'subscription_exists',
        'This account already has Studio Pro. Manage it from Billing.',
      );
    }

    const customerId = await getOrCreateStripeCustomer(user);
    const origin = getServerAuthOrigin(request.nextUrl.origin);
    const session = await getStripeClient().checkout.sessions.create(
      {
        mode: 'subscription',
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price: configuredPrice.priceId, quantity: 1 }],
        success_url: `${origin}/dashboard?billing=success`,
        cancel_url: `${origin}/pricing?checkout=canceled`,
        billing_address_collection: 'auto',
        customer_update: { address: 'auto', name: 'auto' },
        metadata: {
          anisora_user_id: user.id,
          anisora_plan_id: configuredPrice.plan.id,
        },
        subscription_data: {
          metadata: {
            anisora_user_id: user.id,
            anisora_plan_id: configuredPrice.plan.id,
          },
        },
      },
      {
        idempotencyKey: `anisora-checkout-${user.id}-${configuredPrice.plan.id}-${Math.floor(Date.now() / 300000)}`,
      },
    );

    if (!session.url) {
      throw new Error('Stripe Checkout did not return a URL.');
    }

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    return billingException(error);
  }
}
