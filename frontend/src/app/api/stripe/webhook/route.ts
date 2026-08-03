import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import {
  getBillingAdminClient,
  getStripeClient,
  upsertStripeSubscription,
} from '@/lib/billing/server';
import { billingError, billingException } from '@/lib/billing/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function objectId(object: unknown) {
  if (!object || typeof object !== 'object' || !('id' in object)) return null;
  return typeof object.id === 'string' ? object.id : null;
}

function stripeId(value: string | { id: string } | null) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

async function subscriptionFromInvoice(invoice: Stripe.Invoice) {
  const subscription = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = stripeId(subscription ?? null);
  if (!subscriptionId) return null;
  if (typeof subscription !== 'string') return subscription;
  return getStripeClient().subscriptions.retrieve(subscriptionId);
}

async function processStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId =
        session.metadata?.anisora_user_id || session.client_reference_id;
      const customerId = stripeId(session.customer);
      if (!userId || !customerId) {
        throw new Error(
          'Completed Checkout Session is missing AniSora metadata.',
        );
      }

      const { error: customerError } = await getBillingAdminClient()
        .from('anisora_billing_customers')
        .upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            billing_email: session.customer_details?.email || null,
          },
          { onConflict: 'user_id' },
        );
      if (customerError) throw customerError;

      const subscriptionId = stripeId(session.subscription);
      if (subscriptionId) {
        const subscription =
          typeof session.subscription === 'string'
            ? await getStripeClient().subscriptions.retrieve(subscriptionId)
            : session.subscription;
        await upsertStripeSubscription(subscription, userId, event.created);
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await upsertStripeSubscription(event.data.object, null, event.created);
      break;
    case 'invoice.paid':
    case 'invoice.payment_failed': {
      const subscription = await subscriptionFromInvoice(event.data.object);
      if (subscription) {
        await upsertStripeSubscription(subscription, null, event.created);
      }
      break;
    }
    default:
      break;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return billingError(
      400,
      'missing_signature',
      'Stripe signature is required.',
    );
  }

  try {
    const payload = await request.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
    }

    let event: Stripe.Event;
    try {
      event = getStripeClient().webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch {
      return billingError(
        400,
        'invalid_signature',
        'Webhook signature verification failed.',
      );
    }

    const admin = getBillingAdminClient();
    const { data: processed, error: readError } = await admin
      .from('anisora_stripe_events')
      .select('stripe_event_id')
      .eq('stripe_event_id', event.id)
      .maybeSingle();
    if (readError) throw readError;
    if (processed) {
      console.info('Stripe webhook duplicate ignored:', {
        eventId: event.id,
        eventType: event.type,
      });
      return NextResponse.json({ received: true, duplicate: true });
    }

    await processStripeEvent(event);

    const { error: eventError } = await admin
      .from('anisora_stripe_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        object_id: objectId(event.data.object),
      });
    if (eventError && eventError.code !== '23505') throw eventError;

    console.info('Stripe webhook processed:', {
      eventId: event.id,
      eventType: event.type,
      objectId: objectId(event.data.object),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    return billingException(error);
  }
}
