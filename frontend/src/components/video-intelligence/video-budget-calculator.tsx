'use client';

import { estimateVideoBudget } from '@/lib/video-intelligence';
import { Calculator, Film, Gauge, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

const qualityOptions = [
  { label: 'Draft', value: 0.8 },
  { label: 'Standard', value: 1 },
  { label: 'High fidelity', value: 1.45 },
];

export function VideoBudgetCalculator() {
  const [clips, setClips] = useState(12);
  const [secondsPerClip, setSecondsPerClip] = useState(5);
  const [qualityMultiplier, setQualityMultiplier] = useState(1);

  const estimates = useMemo(
    () => estimateVideoBudget({ clips, secondsPerClip, qualityMultiplier }),
    [clips, secondsPerClip, qualityMultiplier],
  );

  const bestFit = estimates.reduce((best, item) =>
    item.fitScore > best.fitScore ? item : best,
  );

  return (
    <section className="border-y border-border bg-background px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
            <Calculator className="size-4" /> Planning calculator
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Estimate a video test batch before paying for renders.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            This is a planning tool for creator operations. It helps AniSora users
            compare relative model effort before they commit to a provider,
            subscription, or batch workflow.
          </p>

          <div className="mt-8 grid gap-4 rounded-lg border border-border bg-muted/30 p-5">
            <label className="grid gap-2 text-sm font-medium">
              Clips in batch
              <input
                type="number"
                min="1"
                max="200"
                value={clips}
                onChange={(event) => setClips(Number(event.target.value) || 1)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Seconds per clip
              <input
                type="number"
                min="1"
                max="60"
                value={secondsPerClip}
                onChange={(event) =>
                  setSecondsPerClip(Number(event.target.value) || 1)
                }
                className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </label>
            <div className="grid gap-2 text-sm font-medium">
              Quality target
              <div className="grid grid-cols-3 gap-2">
                {qualityOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setQualityMultiplier(option.value)}
                    className={`h-10 rounded-md border px-2 text-xs transition ${
                      qualityMultiplier === option.value
                        ? 'border-violet-600 bg-violet-600 text-white'
                        : 'border-border bg-background hover:bg-accent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <article className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-5">
            <p className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
              <Sparkles className="size-4" /> Suggested starting point
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              {bestFit.provider} {bestFit.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Highest fit score for this batch size based on quality, control,
              speed, and planning cost weights.
            </p>
          </article>

          <div className="grid gap-3">
            {estimates
              .sort((a, b) => b.fitScore - a.fitScore)
              .map((estimate) => (
                <article
                  key={estimate.slug}
                  className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {estimate.provider} {estimate.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Planning credits: {estimate.estimatedCredits.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Film className="size-4" /> {clips} clips
                    <Gauge className="size-4" /> {secondsPerClip}s
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
