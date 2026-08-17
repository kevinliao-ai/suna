'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  Film,
  Play,
  Square,
} from 'lucide-react';
import posthog from 'posthog-js';

import type { DirectorProductionRow } from '@/lib/director-production';
import {
  buildDirectorRoughCutTimeline,
  formatEditTimecode,
  roughCutSummary,
  serializeRoughCutEdl,
} from '@/lib/director-rough-cut';

export function DirectorRoughCutPlayer({
  projectId,
  projectTitle,
  rows,
}: {
  projectId: string;
  projectTitle: string;
  rows: DirectorProductionRow[];
}) {
  const clips = useMemo(() => buildDirectorRoughCutTimeline(rows), [rows]);
  const summary = roughCutSummary(clips);
  const playableIndices = useMemo(
    () => clips.flatMap((clip, index) => (clip.videoUrl ? [index] : [])),
    [clips],
  );
  const [activeIndex, setActiveIndex] = useState(playableIndices[0] || 0);
  const [sequencing, setSequencing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeClip = clips[activeIndex];

  useEffect(() => {
    if (activeClip?.videoUrl || playableIndices.length === 0) return;
    setActiveIndex(playableIndices[0]);
  }, [activeClip?.videoUrl, playableIndices]);

  useEffect(() => {
    if (!sequencing || !videoRef.current || !activeClip?.videoUrl) return;
    videoRef.current.currentTime = 0;
    void videoRef.current.play().catch(() => setSequencing(false));
  }, [activeClip?.videoUrl, activeIndex, sequencing]);

  const moveToPlayable = (direction: -1 | 1) => {
    if (!playableIndices.length) return false;
    const currentPosition = playableIndices.indexOf(activeIndex);
    const base = currentPosition >= 0 ? currentPosition : 0;
    const next = playableIndices[base + direction];
    if (next === undefined) return false;
    setActiveIndex(next);
    return true;
  };

  const advanceSequence = () => {
    if (!moveToPlayable(1)) {
      videoRef.current?.pause();
      setSequencing(false);
    }
  };

  const stopSequence = () => {
    videoRef.current?.pause();
    setSequencing(false);
  };

  const startSequence = () => {
    if (!playableIndices.length) return;
    const first = playableIndices[0];
    if (!activeClip?.videoUrl || activeIndex === playableIndices.at(-1)) {
      setActiveIndex(first);
    }
    setSequencing(true);
    posthog.capture('director_rough_cut_played', {
      playable_count: summary.playableCount,
      missing_count: summary.missingCount,
      extension_required_count: summary.extensionRequiredCount,
      timeline_seconds: summary.timelineDurationSeconds,
    });
  };

  const exportEdl = () => {
    const csv = serializeRoughCutEdl({ projectId, projectTitle, clips });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const slug =
      projectTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'anisora-project';
    anchor.href = href;
    anchor.download = `${slug}-rough-cut-edl.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 0);
    posthog.capture('director_rough_cut_edl_exported', {
      shot_count: summary.shotCount,
      playable_count: summary.playableCount,
      missing_count: summary.missingCount,
      extension_required_count: summary.extensionRequiredCount,
    });
  };

  return (
    <section className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
            Rough-cut timeline
          </p>
          <h3 className="mt-2 text-base font-semibold">
            Play selected final videos as a sequence
          </h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Playback trims each generated video to the planned shot duration, up
            to the current 5-second source limit. Missing shots remain visible
            as timeline gaps.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={sequencing ? stopSequence : startSequence}
            disabled={!playableIndices.length}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sequencing ? (
              <Square className="size-3.5 fill-current" />
            ) : (
              <Play className="size-3.5 fill-current" />
            )}
            {sequencing ? 'Stop sequence' : 'Play rough cut'}
          </button>
          <button
            type="button"
            onClick={exportEdl}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-white px-3 py-2 text-xs font-semibold dark:bg-white/5"
          >
            <Download className="size-3.5" /> Export EDL CSV
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Planned', `${summary.plannedDurationSeconds}s`],
          ['Timeline', `${summary.timelineDurationSeconds}s`],
          ['Playable', `${summary.playableCount}/${summary.shotCount}`],
          ['Missing', summary.missingCount],
          ['Need extension', summary.extensionRequiredCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-sky-500/15 bg-white/70 px-3 py-2 dark:bg-black/10"
          >
            <p className="text-sm font-semibold">{value}</p>
            <p className="mt-0.5 text-[11px] text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {summary.extensionRequiredCount > 0 ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" />{' '}
          {summary.extensionRequiredCount} shot
          {summary.extensionRequiredCount === 1 ? '' : 's'} exceed the current
          5-second generated source. Generate an extension or split the shot
          before final assembly.
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-1">
          {clips.map((clip, index) => (
            <button
              key={clip.shotId}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setSequencing(false);
                posthog.capture('director_rough_cut_clip_selected', {
                  shot_position: clip.position,
                  clip_status: clip.status,
                  has_video: Boolean(clip.videoUrl),
                  planned_seconds: clip.plannedDurationSeconds,
                });
              }}
              title={`${clip.title} · ${formatEditTimecode(clip.timelineStartSeconds)}–${formatEditTimecode(clip.timelineEndSeconds)}`}
              style={{ flexGrow: clip.editDurationSeconds }}
              className={`min-w-24 rounded-md border px-3 py-2 text-left transition ${
                activeIndex === index
                  ? 'border-sky-600 bg-sky-600 text-white'
                  : clip.status === 'missing_video'
                    ? 'border-dashed border-zinc-400 bg-zinc-500/5 text-zinc-500'
                    : clip.status === 'duration_extension_required'
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : 'border-sky-500/20 bg-white dark:bg-white/5'
              }`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] opacity-70">
                Shot {clip.position}
              </span>
              <span className="mt-1 block max-w-40 truncate text-xs font-semibold">
                {clip.title}
              </span>
              <span className="mt-1 block text-[10px] opacity-70">
                {clip.editDurationSeconds}s · {clip.videoUrl ? 'video' : 'gap'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-black/10 bg-black dark:border-white/10">
        {activeClip?.videoUrl ? (
          <video
            key={activeClip.videoTaskId}
            ref={videoRef}
            controls
            preload="metadata"
            src={activeClip.videoUrl}
            aria-label={`Rough cut shot ${activeClip.position}`}
            onEnded={advanceSequence}
            onTimeUpdate={(event) => {
              if (
                sequencing &&
                event.currentTarget.currentTime >=
                  activeClip.editDurationSeconds - 0.05
              ) {
                advanceSequence();
              }
            }}
            className="mx-auto aspect-video w-full max-w-4xl bg-black object-contain"
          />
        ) : (
          <div className="flex aspect-video max-h-[520px] items-center justify-center bg-zinc-950 p-6 text-center text-sm text-zinc-400">
            <div>
              <Film className="mx-auto size-7" />
              <p className="mt-3 font-medium">
                This timeline slot is missing a final video.
              </p>
              {activeClip ? (
                <a
                  href={`#generation-shot-${activeClip.shotId}`}
                  className="mt-2 inline-flex text-xs font-semibold text-sky-400 hover:underline"
                >
                  Open shot {activeClip.position} versions
                </a>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-semibold">
            {activeClip
              ? `Shot ${activeClip.position}: ${activeClip.title}`
              : 'No timeline clips'}
          </p>
          {activeClip ? (
            <p className="mt-1 text-zinc-500">
              {formatEditTimecode(activeClip.timelineStartSeconds)} –{' '}
              {formatEditTimecode(activeClip.timelineEndSeconds)} · planned{' '}
              {activeClip.plannedDurationSeconds}s
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSequencing(false);
              moveToPlayable(-1);
            }}
            disabled={playableIndices.indexOf(activeIndex) <= 0}
            aria-label="Previous playable shot"
            className="rounded-md border border-black/10 p-2 disabled:opacity-30 dark:border-white/10"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSequencing(false);
              moveToPlayable(1);
            }}
            disabled={
              playableIndices.indexOf(activeIndex) < 0 ||
              playableIndices.indexOf(activeIndex) ===
                playableIndices.length - 1
            }
            aria-label="Next playable shot"
            className="rounded-md border border-black/10 p-2 disabled:opacity-30 dark:border-white/10"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
