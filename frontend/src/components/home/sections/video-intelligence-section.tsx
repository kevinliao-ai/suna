import Link from 'next/link';
import { ArrowRight, BarChart3, Calculator, Clapperboard } from 'lucide-react';

const cards = [
  {
    icon: BarChart3,
    title: 'Model market map',
    description: 'Track which video models fit anime scenes, ad variants, reference workflows, and API experiments.',
  },
  {
    icon: Calculator,
    title: 'Batch budget planning',
    description: 'Estimate relative credit effort before committing a short-form video batch to a provider.',
  },
  {
    icon: Clapperboard,
    title: 'Studio-ready workflow',
    description: 'Move from research to organized prompts, references, tasks, and paid workspace recovery.',
  },
];

export function VideoIntelligenceSection() {
  return (
    <section className="bg-background px-6 py-16" id="video-intelligence">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Video Intelligence
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            A sharper way to choose AI video tools.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            AniSora is becoming more than an embedded tool launcher. The next
            layer helps creators compare models, plan batches, and turn experiments
            into repeatable anime production workflows.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/models"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-85"
            >
              Compare models <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/video-cost-calculator"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-accent"
            >
              Estimate batch cost
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-lg border border-border bg-muted/30 p-5">
                <Icon className="size-5 text-violet-600" />
                <h3 className="mt-4 text-base font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
