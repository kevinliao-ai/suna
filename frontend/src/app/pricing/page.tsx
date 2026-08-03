import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BILLING_PLANS, formatPlanPrice } from '@/lib/billing/plans';
import { BillingActionButton } from '@/components/billing-action-button';

export const metadata = {
  title: 'Pricing',
  description: 'Choose an AniSora Studio workspace plan.',
};

const benefits = [
  'Cross-device cloud project sync',
  'Up to 100 cloud projects',
  'Tasks and asset links restored automatically',
  'Priority access to new creative tool adapters',
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10 text-zinc-950 dark:bg-[#0c0c0d] dark:text-zinc-50">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Sparkles className="size-4" />
            </span>
            AniSora Studio
          </Link>
          <Link
            href={user ? '/dashboard' : '/auth?returnUrl=/pricing'}
            className="text-sm font-medium"
          >
            {user ? 'Open Studio' : 'Sign in'}
          </Link>
        </header>

        <section className="mx-auto mt-20 max-w-2xl text-center">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Simple workspace pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Keep every creative project within reach.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-500">
            Generation continues in the selected external tools. Studio Pro pays
            for AniSora-owned cloud organization and recovery—not third-party
            generation credits.
          </p>
          {params.checkout === 'canceled' ? (
            <p className="mx-auto mt-6 max-w-lg rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              Checkout was canceled. Nothing was charged.
            </p>
          ) : null}
        </section>

        <section className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {BILLING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-sm font-medium text-zinc-500">
                {plan.interval === 'month' ? 'Monthly' : 'Annual · save 18%'}
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold">
                  {formatPlanPrice(plan.amount, plan.currency)}
                </span>
                <span className="pb-1 text-sm text-zinc-500">
                  /{plan.interval}
                </span>
              </div>
              <ul className="mt-7 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
              {user ? (
                <BillingActionButton
                  action="checkout"
                  planId={plan.id}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:opacity-85 disabled:opacity-60 dark:bg-white dark:text-zinc-950"
                >
                  Choose {plan.interval === 'month' ? 'monthly' : 'annual'}
                </BillingActionButton>
              ) : (
                <Link
                  href="/auth?returnUrl=/pricing"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
                >
                  Sign in to upgrade
                </Link>
              )}
            </article>
          ))}
        </section>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-zinc-500">
          Subscriptions renew automatically until canceled. You can manage or
          cancel from the Stripe customer portal. Third-party generation usage
          and availability are governed by each provider.
        </p>
      </div>
    </main>
  );
}
