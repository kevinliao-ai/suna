import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BILLING_PLANS, formatPlanPrice } from '@/lib/billing/plans';
import { BillingActionButton } from '@/components/billing-action-button';
import { PRO_MONTHLY_GENERATION_CREDITS } from '@/lib/generation/credits';
import {
  authPricingHref,
  normalizeConversionSource,
} from '@/lib/conversion-source';
import { PricingFunnelTracker } from '@/components/pricing-funnel-tracker';

export const metadata = {
  title: 'AniSora Studio Pro Pricing',
  description:
    'Choose monthly or annual AniSora Studio Pro with cloud projects, reusable anime workflows, and monthly generation credits.',
};

const benefits = [
  `${PRO_MONTHLY_GENERATION_CREDITS} generation credits refreshed monthly`,
  'Cross-device cloud project sync',
  'Up to 100 cloud projects',
  'Recipe-to-Director shot planning',
  'Private task, asset, and generation history',
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; source?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;
  const source = normalizeConversionSource(params.source);
  const signInHref = authPricingHref(source);

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-10 text-zinc-950 dark:bg-[#0c0c0d] dark:text-zinc-50">
      <PricingFunnelTracker
        source={source}
        signedIn={Boolean(user)}
        checkout={params.checkout}
      />
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Sparkles className="size-4" />
            </span>
            AniSora Studio
          </Link>
          <Link
            href={user ? '/dashboard' : signInHref}
            className="text-sm font-medium"
          >
            {user ? 'Open Studio' : 'Sign in'}
          </Link>
        </header>

        <section className="mx-auto mt-20 max-w-2xl text-center">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Studio Pro for anime production
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Turn a recipe into a production-ready shot.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-500">
            Studio Pro combines reusable Director plans, cloud project history,
            and {PRO_MONTHLY_GENERATION_CREDITS} monthly AniSora generation
            credits. Every paid generation still shows its credit quote and
            requires your approval before provider spend.
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
                  source={source}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:opacity-85 disabled:opacity-60 dark:bg-white dark:text-zinc-950"
                >
                  Choose {plan.interval === 'month' ? 'monthly' : 'annual'}
                </BillingActionButton>
              ) : (
                <Link
                  href={signInHref}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
                >
                  Sign in to upgrade
                </Link>
              )}
            </article>
          ))}
        </section>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-zinc-500">
          Subscriptions renew automatically until canceled. Annual plans still
          refill generation credits monthly; unused credits do not imply
          unlimited provider usage. You can manage or cancel from the Stripe
          customer portal.
        </p>
      </div>
    </main>
  );
}
