'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Check, CircleAlert, Download, Film, ImageIcon } from 'lucide-react';
import posthog from 'posthog-js';

import type { AnimeDirectorShot } from '@/lib/anime-director';
import type {
  DirectorContinuityAsset,
  DirectorContinuityBindings,
  DirectorContinuityReviews,
} from '@/lib/director-continuity';
import {
  buildDirectorProductionRows,
  filterProductionRows,
  productionReadinessSummary,
  serializeProductionManifest,
  type ProductionBoardFilter,
  type ProductionReadiness,
} from '@/lib/director-production';
import type {
  DirectorGenerationSelections,
  GenerationTask,
} from '@/lib/generation/task-history';

const filters: Array<{ id: ProductionBoardFilter; label: string }> = [
  { id: 'all', label: 'All shots' },
  { id: 'ready', label: 'Ready' },
  { id: 'action_required', label: 'Action required' },
  { id: 'missing_output', label: 'Missing output' },
];

const readinessLabels: Record<ProductionReadiness, string> = {
  ready: 'Ready for edit',
  missing_output: 'Missing final output',
  needs_revision: 'Needs revision',
  awaiting_review: 'Awaiting QA',
};

const readinessStyles: Record<ProductionReadiness, string> = {
  ready: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  missing_output: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300',
  needs_revision: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  awaiting_review: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
};

export function DirectorContinuityBoard({
  projectId,
  projectTitle,
  shots,
  tasks,
  selections,
  assets,
  bindings,
  reviews,
}: {
  projectId: string;
  projectTitle: string;
  shots: AnimeDirectorShot[];
  tasks: GenerationTask[];
  selections: DirectorGenerationSelections;
  assets: DirectorContinuityAsset[];
  bindings: DirectorContinuityBindings;
  reviews: DirectorContinuityReviews;
}) {
  const [filter, setFilter] = useState<ProductionBoardFilter>('all');
  const rows = useMemo(
    () =>
      buildDirectorProductionRows(
        shots,
        tasks,
        selections,
        assets,
        bindings,
        reviews,
      ),
    [assets, bindings, reviews, selections, shots, tasks],
  );
  const summary = productionReadinessSummary(rows);
  const visibleRows = filterProductionRows(rows, filter);

  const exportManifest = () => {
    const manifest = serializeProductionManifest({
      projectId,
      projectTitle,
      rows,
    });
    const blob = new Blob([manifest], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const slug =
      projectTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'anisora-project';
    anchor.href = href;
    anchor.download = `${slug}-production-manifest.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 0);
    posthog.capture('director_production_manifest_exported', {
      shot_count: rows.length,
      ready_count: summary.ready,
      missing_output_count: summary.missingOutput,
      needs_revision_count: summary.needsRevision,
      awaiting_review_count: summary.awaitingReview,
    });
  };

  return (
    <section
      id="continuity-board"
      className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700 dark:text-fuchsia-300">
            Cross-shot continuity board
          </p>
          <h2 className="mt-2 text-lg font-semibold">
            Compare final takes before editing
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
            Review every final reference, video, continuity asset, and QA result
            in one place. Export the production manifest when the sequence is
            ready for assembly.
          </p>
        </div>
        <button
          type="button"
          onClick={exportManifest}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          <Download className="size-4" /> Export production manifest
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Total shots', summary.total],
          ['Ready', summary.ready],
          ['Missing output', summary.missingOutput],
          ['Needs revision', summary.needsRevision],
          ['Awaiting QA', summary.awaitingReview],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-black/10 bg-zinc-50 px-3 py-3 dark:border-white/10 dark:bg-white/5"
          >
            <p className="text-xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setFilter(item.id);
              posthog.capture('director_continuity_board_filtered', {
                filter: item.id,
                visible_count: filterProductionRows(rows, item.id).length,
                shot_count: rows.length,
              });
            }}
            aria-pressed={filter === item.id}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              filter === item.id
                ? 'border-fuchsia-600 bg-fuchsia-600 text-white'
                : 'border-black/10 hover:border-fuchsia-500 dark:border-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visibleRows.length ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {visibleRows.map((row) => (
            <article
              key={row.shot.id}
              className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    Shot {row.position}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold">
                    {row.shot.title}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${readinessStyles[row.readiness]}`}
                >
                  {readinessLabels[row.readiness]}
                </span>
              </div>

              <div className="grid border-y border-black/10 sm:grid-cols-2 dark:border-white/10">
                <div className="border-b border-black/10 sm:border-b-0 sm:border-r dark:border-white/10">
                  <p className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    <ImageIcon className="size-3.5" /> Final reference
                  </p>
                  {row.finalReference?.mediaUrl ? (
                    <Image
                      src={row.finalReference.mediaUrl}
                      alt={`Final reference for shot ${row.position}`}
                      width={640}
                      height={360}
                      unoptimized
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-zinc-100 text-xs text-zinc-500 dark:bg-white/5">
                      No final reference
                    </div>
                  )}
                </div>
                <div>
                  <p className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    <Film className="size-3.5" /> Final video
                  </p>
                  {row.finalVideo?.mediaUrl ? (
                    <video
                      controls
                      preload="metadata"
                      src={row.finalVideo.mediaUrl}
                      aria-label={`Final video for shot ${row.position}`}
                      className="aspect-video w-full bg-black object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-zinc-100 text-xs text-zinc-500 dark:bg-white/5">
                      No final video
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 p-4 text-xs">
                <div>
                  <p className="font-semibold">Continuity assets</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.continuityAssets.length ? (
                      row.continuityAssets.map((asset) => (
                        <span
                          key={asset.id}
                          className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5 px-2.5 py-1"
                        >
                          {asset.kind === 'character' ? 'Character' : 'Scene'}:{' '}
                          {asset.name || 'Unnamed'}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-500">No assets bound</span>
                    )}
                  </div>
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    row.review?.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : row.review?.status === 'needs_revision'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <p className="flex items-center gap-1.5 font-semibold">
                    {row.review?.status === 'approved' ? (
                      <Check className="size-3.5" />
                    ) : (
                      <CircleAlert className="size-3.5" />
                    )}
                    {row.review?.status === 'approved'
                      ? 'Continuity passed'
                      : row.review?.status === 'needs_revision'
                        ? 'Revision requested'
                        : 'Continuity review pending'}
                  </p>
                  {row.review?.note ? (
                    <p className="mt-1 leading-5">{row.review.note}</p>
                  ) : null}
                </div>
                <a
                  href={`#generation-shot-${row.shot.id}`}
                  className="font-semibold text-violet-600 hover:underline"
                >
                  Open shot versions and QA
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-dashed border-black/10 p-5 text-sm text-zinc-500 dark:border-white/10">
          No shots match this filter.
        </p>
      )}
    </section>
  );
}
