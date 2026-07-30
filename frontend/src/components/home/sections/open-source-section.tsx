import { ExternalLink, GitFork, Layers3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const principles = [
  {
    icon: Layers3,
    title: 'Product layer first',
    description:
      'Projects and asset organization belong to AniSora, while generation providers can evolve independently.',
  },
  {
    icon: ShieldCheck,
    title: 'Explicit data boundaries',
    description:
      'The interface clearly identifies when prompts or media leave AniSora for an embedded provider.',
  },
  {
    icon: GitFork,
    title: 'Replaceable integrations',
    description:
      'Model demos are treated as adapters, not as the permanent foundation of the product.',
  },
];

export function OpenSourceSection() {
  return (
    <section id="open-source" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            Architecture direction
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Open models, independent product
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            AniSora started from open-source code. The next stage separates the
            user experience, project data, and provider integrations so the
            product can continue even when upstream projects change.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <item.icon className="size-5" />
              <h3 className="mt-5 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <Link
          href="https://github.com/bilibili/Index-anisora"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
        >
          Inspect the current upstream model
          <ExternalLink className="size-4" />
        </Link>
      </div>
    </section>
  );
}
