import { Check, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const benefits = [
  'Keep projects synced across devices',
  'Restore tasks and saved asset links automatically',
  'Get priority access to new Studio tool adapters',
];

export function PricingPreviewSection() {
  return (
    <section id="pricing" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-background to-fuchsia-500/10 p-7 shadow-[0_24px_80px_-40px_rgba(124,58,237,0.7)] md:grid-cols-[1.05fr_0.95fr] md:p-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <Crown className="size-3.5" />
            STUDIO PRO
          </div>
          <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">
            Your creative workspace, always within reach.
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
            Studio Pro protects the work AniSora owns: cloud project sync,
            automatic recovery, and a reliable place to organize your creative
            process. Third-party generation usage remains separate.
          </p>
          <ul className="mt-7 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm font-medium">
                <Check className="size-4 text-violet-600 dark:text-violet-400" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <aside className="relative overflow-hidden rounded-2xl bg-zinc-950 p-7 text-white shadow-xl dark:bg-white dark:text-zinc-950">
          <div className="absolute -right-12 -top-12 size-40 rounded-full bg-violet-500/35 blur-3xl" />
          <p className="relative text-sm font-medium opacity-70">Start with Studio Pro</p>
          <div className="relative mt-5 flex items-end gap-2">
            <span className="text-5xl font-semibold tracking-tight">$5.99</span>
            <span className="mb-1 text-sm opacity-65">/ month</span>
          </div>
          <p className="relative mt-3 text-sm leading-6 opacity-70">
            Or save 18% with annual billing at $59/year.
          </p>
          <Link
            href="/pricing?source=home-pricing"
            className="relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-zinc-950 transition hover:scale-[1.01] hover:bg-violet-50 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
          >
            View plans & upgrade
            <ArrowRight className="size-4" />
          </Link>
          <p className="relative mt-4 text-center text-xs opacity-55">
            Secure checkout powered by Stripe. Cancel anytime.
          </p>
        </aside>
      </div>
    </section>
  );
}

