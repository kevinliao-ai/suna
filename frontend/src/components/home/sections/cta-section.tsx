import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/home';

export function CTASection() {
  const { ctaSection } = siteConfig;

  return (
    <section id="cta" className="w-full px-6 py-16">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-zinc-950 px-6 py-20 text-center text-white dark:bg-white dark:text-zinc-950">
        <Sparkles className="mx-auto size-6" />
        <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
          {ctaSection.title}
        </h2>
        <p className="mt-4 text-sm opacity-60">{ctaSection.subtext}</p>
        <Link
          href={ctaSection.button.href}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:opacity-80 dark:bg-zinc-950 dark:text-white"
        >
          {ctaSection.button.text}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
