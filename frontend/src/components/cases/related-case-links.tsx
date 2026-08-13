import Link from 'next/link';
import type { DirectorWorkflowCase } from '@/lib/director-workflow-cases';

export function RelatedCaseLinks({
  items,
  title = 'Reproducible Director cases',
}: {
  items: DirectorWorkflowCase[];
  title?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="border-t border-border px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          From research to production
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <Link
              key={item.slug}
              href={`/cases/${item.slug}`}
              className="rounded-xl border border-border p-5 transition hover:bg-muted/40"
            >
              <p className="text-xs text-violet-600">{item.eyebrow}</p>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
