import Link from 'next/link';
import { ArrowRight, Calculator, Cloud, Sparkles } from 'lucide-react';
import type { VideoIntelligenceFaq } from '@/lib/video-intelligence';

interface VideoSeoFaqSectionProps {
  items: VideoIntelligenceFaq[];
}

interface VideoConversionSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function VideoSeoFaqSection({ items }: VideoSeoFaqSectionProps) {
  return (
    <section className="border-t border-border px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          Planning FAQ
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Common creator questions
        </h2>
        <div className="mt-7 grid gap-3">
          {items.map((item) => (
            <article key={item.question} className="rounded-lg border border-border p-5">
              <h3 className="text-base font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VideoConversionSection({
  eyebrow = 'Move from research to workflow',
  title = 'Keep model decisions, prompts, and references together.',
  description = 'AniSora Studio Pro helps creators turn model research into organized projects with cloud sync, recovery, and cleaner repeatable workflows.',
}: VideoConversionSectionProps) {
  return (
    <section className="border-t border-border bg-muted/30 px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/video-cost-calculator"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-85"
            >
              <Calculator className="size-4" /> Estimate a batch
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              <Sparkles className="size-4" /> View Studio Pro
            </Link>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-background p-5">
          <Cloud className="size-5 text-violet-600" />
          <h3 className="mt-4 text-lg font-semibold">Studio Pro fits after selection</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Pick a model, estimate the batch, then keep the creative plan recoverable across sessions and devices.
          </p>
          <Link
            href="/auth?returnUrl=/dashboard"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-500"
          >
            Open Studio <ArrowRight className="size-4" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
