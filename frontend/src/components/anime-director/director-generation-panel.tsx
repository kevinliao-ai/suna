'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CircleAlert,
  Clock3,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Star,
  Video,
} from 'lucide-react';
import posthog from 'posthog-js';

import type { AnimeDirectorShot } from '@/lib/anime-director';
import {
  generationVersions,
  readGenerationTask,
  resolveGenerationSelection,
  visibleGenerationVersions,
  type DirectorGenerationSelections,
  type GenerationKind,
  type GenerationTask,
} from '@/lib/generation/task-history';
import { createClient } from '@/lib/supabase/client';

interface GenerationQuote {
  estimatedCostUsd: number;
  hardLimitUsd: number;
  requiredCredits: number;
  unit: string;
}

interface CreditBalance {
  allowance: number;
  available: number;
  reserved: number;
  spent: number;
  periodEnd: string;
}

const statusStyles: Record<GenerationTask['status'], string> = {
  todo: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  running: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  failed: 'bg-red-500/10 text-red-700 dark:text-red-300',
};

const statusLabels: Record<GenerationTask['status'], string> = {
  todo: 'Queued',
  running: 'Generating',
  done: 'Completed',
  failed: 'Failed',
};

function VersionHistory({
  kind,
  versions,
  selectedTaskId,
  onSelect,
}: {
  kind: GenerationKind;
  versions: GenerationTask[];
  selectedTaskId?: string;
  onSelect: (taskId: string, versionNumber: number) => void;
}) {
  if (versions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-black/10 px-3 py-4 text-xs text-zinc-500 dark:border-white/10">
        No {kind} versions yet.
      </p>
    );
  }

  const visibleVersions = visibleGenerationVersions(versions, selectedTaskId);

  return (
    <div className="grid gap-3">
      {visibleVersions.map((task) => {
        const originalIndex = versions.findIndex((item) => item.id === task.id);
        const versionNumber = versions.length - originalIndex;
        const selected = selectedTaskId === task.id && task.provider === 'fal';

        return (
          <div
            key={task.id}
            className={`overflow-hidden rounded-lg border ${
              selected
                ? 'border-violet-500 bg-violet-500/5'
                : 'border-black/10 dark:border-white/10'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold">
                  Version {versionNumber}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[task.status]}`}
                >
                  {statusLabels[task.status]}
                </span>
                {selected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600">
                    <Star className="size-3 fill-current" /> Final take
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-500">
                {new Date(task.createdAt).toLocaleString()}
              </span>
            </div>

            {task.status === 'done' && task.mediaUrl ? (
              kind === 'reference' ? (
                <Image
                  src={task.mediaUrl}
                  alt={`Generated reference version ${versionNumber}`}
                  width={640}
                  height={360}
                  unoptimized
                  className="aspect-video w-full border-y border-black/10 object-cover dark:border-white/10"
                />
              ) : (
                <video
                  controls
                  preload="metadata"
                  src={task.mediaUrl}
                  aria-label={`Generated video version ${versionNumber}`}
                  className="aspect-video w-full border-y border-black/10 bg-black dark:border-white/10"
                />
              )
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-[11px] text-zinc-500">
              <div className="flex flex-wrap gap-3">
                {task.requiredCredits !== null && (
                  <span>{task.requiredCredits} credits</span>
                )}
                {task.estimatedCostUsd !== null && (
                  <span>${task.estimatedCostUsd.toFixed(4)} estimated</span>
                )}
                {task.archiveStatus === 'stored' && (
                  <span className="text-emerald-600">
                    Private R2 copy stored
                  </span>
                )}
              </div>
              {task.provider === 'simulation' && (
                <span className="text-emerald-600">Simulation · no charge</span>
              )}
              {task.status === 'done' &&
                task.mediaUrl &&
                task.provider === 'fal' && (
                  <button
                    type="button"
                    onClick={() => onSelect(task.id, versionNumber)}
                    disabled={selected}
                    className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 px-2 py-1 font-semibold text-violet-600 disabled:cursor-default disabled:opacity-60"
                  >
                    {selected ? (
                      <Check className="size-3" />
                    ) : (
                      <Star className="size-3" />
                    )}
                    {selected ? 'Selected' : 'Use as final'}
                  </button>
                )}
            </div>

            {task.status === 'failed' && (
              <p className="border-t border-red-500/10 bg-red-500/5 px-3 py-2 text-xs text-red-600">
                {task.errorMessage ||
                  'The provider did not return a usable result.'}
              </p>
            )}
          </div>
        );
      })}
      {versions.length > visibleVersions.length && (
        <p className="text-[11px] text-zinc-500">
          Showing the newest {visibleVersions.length} of {versions.length}{' '}
          versions.
        </p>
      )}
    </div>
  );
}

function generationButtonLabel(
  kind: GenerationKind,
  versions: GenerationTask[],
) {
  const asset = kind === 'reference' ? 'reference' : '5s video';
  if (versions[0]?.status === 'failed') return `Retry ${asset}`;
  if (versions.some((task) => task.status === 'done')) {
    return `Generate another ${asset}`;
  }
  return `Generate ${asset}`;
}

export function DirectorGenerationPanel({
  projectId,
  shots,
  selections,
  planDirty,
  onSelectTask,
}: {
  projectId?: string;
  shots: AnimeDirectorShot[];
  selections: DirectorGenerationSelections;
  planDirty: boolean;
  onSelectTask: (shotId: string, kind: GenerationKind, taskId: string) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [generationEnabled, setGenerationEnabled] = useState(false);
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [pricingAvailable, setPricingAvailable] = useState(false);
  const [quotes, setQuotes] = useState<Record<
    GenerationKind,
    GenerationQuote
  > | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(
    null,
  );
  const [hasProSubscription, setHasProSubscription] = useState(false);
  const [rolloutEnabled, setRolloutEnabled] = useState(false);
  const [pendingKey, setPendingKey] = useState('');
  const [message, setMessage] = useState('');
  const paywallCaptured = useRef(false);

  const refreshTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('anisora_tasks')
      .select('id,provider,status,input,output,error_message,created_at')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .in('provider', ['fal', 'simulation'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      setMessage('Could not refresh generation tasks.');
      return;
    }

    setTasks(
      (data || [])
        .map(readGenerationTask)
        .filter((task): task is GenerationTask => Boolean(task)),
    );
  }, [projectId, supabase]);

  useEffect(() => {
    let active = true;
    void fetch('/api/generation/fal')
      .then((response) => response.json())
      .then(
        (payload: {
          enabled?: unknown;
          simulationEnabled?: unknown;
          pricingAvailable?: unknown;
          quotes?: unknown;
          creditBalance?: unknown;
          entitlement?: { tier?: unknown };
          rolloutEnabled?: unknown;
        }) => {
          if (!active) return;
          setGenerationEnabled(payload.enabled === true);
          setSimulationEnabled(payload.simulationEnabled === true);
          setPricingAvailable(payload.pricingAvailable === true);
          setHasProSubscription(payload.entitlement?.tier === 'pro');
          setRolloutEnabled(payload.rolloutEnabled === true);
          setCreditBalance(
            payload.creditBalance && typeof payload.creditBalance === 'object'
              ? (payload.creditBalance as CreditBalance)
              : null,
          );
          setQuotes(
            payload.quotes && typeof payload.quotes === 'object'
              ? (payload.quotes as Record<GenerationKind, GenerationQuote>)
              : null,
          );
        },
      )
      .catch(() => {
        if (active) setGenerationEnabled(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (paywallCaptured.current || !rolloutEnabled || hasProSubscription)
      return;

    paywallCaptured.current = true;
    posthog.capture('director_generation_paywall_viewed', {
      project_saved: Boolean(projectId),
      shot_count: shots.length,
    });
  }, [hasProSubscription, projectId, rolloutEnabled, shots.length]);

  const refreshCredits = useCallback(async () => {
    const response = await fetch('/api/generation/credits');
    if (!response.ok) return;
    const payload = (await response.json()) as { balance?: unknown };
    setCreditBalance(
      payload.balance && typeof payload.balance === 'object'
        ? (payload.balance as CreditBalance)
        : null,
    );
  }, []);

  useEffect(() => {
    void refreshTasks();
    if (!projectId) return;

    const timer = window.setInterval(() => {
      void refreshTasks();
    }, 6000);
    return () => window.clearInterval(timer);
  }, [projectId, refreshTasks]);

  const submit = async (
    shot: AnimeDirectorShot,
    kind: GenerationKind,
    imageUrl?: string,
    mode: 'paid' | 'simulation' = 'paid',
  ) => {
    if (!projectId || planDirty) {
      posthog.capture('director_generation_blocked', {
        kind,
        mode,
        reason: !projectId ? 'unsaved_project' : 'unsaved_changes',
      });
      setMessage(
        !projectId
          ? 'Save this Director plan before generating.'
          : 'Save your latest shot edits before generating a new version.',
      );
      return;
    }

    const label = kind === 'reference' ? 'reference frame' : '5-second video';
    const quote = quotes?.[kind];
    if (mode === 'paid' && !quote) {
      setMessage('Live provider pricing is unavailable. No request was sent.');
      return;
    }
    const confirmed =
      mode === 'simulation' ||
      window.confirm(
        `Generate a paid ${label} for ${quote?.requiredCredits} credits (estimated provider cost $${quote?.estimatedCostUsd.toFixed(4)} USD)? The server will reject it above the $${quote?.hardLimitUsd.toFixed(2)} limit.`,
      );
    if (!confirmed) {
      posthog.capture('director_generation_canceled', {
        kind,
        mode,
        required_credits: quote?.requiredCredits ?? null,
      });
      return;
    }

    const key = `${shot.id}:${kind}`;
    setPendingKey(key);
    setMessage('');
    posthog.capture('director_generation_started', {
      kind,
      mode,
      required_credits: quote?.requiredCredits ?? 0,
      shot_count: shots.length,
    });

    try {
      const response = await fetch('/api/generation/fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          shotId: shot.id,
          kind,
          imageUrl,
          mode,
        }),
      });
      const payload = (await response.json()) as {
        error?: { code?: string; message?: string };
      };

      if (!response.ok) {
        throw new Error(payload.error?.message || 'Generation request failed.');
      }

      setMessage(
        mode === 'simulation'
          ? 'Free pipeline simulation completed. No provider request or charge was created.'
          : `${kind === 'reference' ? 'Reference' : 'Video'} version queued. Results will appear automatically.`,
      );
      posthog.capture('director_generation_submitted', {
        kind,
        mode,
        result: mode === 'simulation' ? 'simulation_completed' : 'queued',
        required_credits: quote?.requiredCredits ?? 0,
      });
      await refreshTasks();
      await refreshCredits();
    } catch (error) {
      posthog.capture('director_generation_failed', {
        kind,
        mode,
        reason: 'request_failed',
      });
      setMessage(
        error instanceof Error ? error.message : 'Generation request failed.',
      );
    } finally {
      setPendingKey('');
    }
  };

  if (!projectId) {
    return (
      <section className="rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 p-5">
        <h2 className="text-lg font-semibold">
          Generate and compare shot versions
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Save this plan to Studio first. Generation stays disabled until the
          project has a secure owner and version history.
        </p>
      </section>
    );
  }

  return (
    <section
      id="real-generation"
      className="scroll-mt-6 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Shot versions and final takes
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-500">
            Generate multiple candidates, compare the full history, and choose
            the reference and video that belong in the final project.
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {planDirty
              ? 'Save your current shot edits before generating. This keeps provider requests tied to the exact saved prompt.'
              : generationEnabled
                ? pricingAvailable
                  ? 'Live server quotes and hard cost limits are active. Each paid request still requires explicit approval.'
                  : 'Paid generation is locked because the provider price could not be verified.'
                : simulationEnabled
                  ? 'Use the free pipeline simulation while live provider generation is disabled.'
                  : rolloutEnabled && !hasProSubscription
                    ? 'Subscribe to Studio Pro to unlock paid generation credits.'
                    : 'Paid generation is currently limited to the approved production tester.'}
          </p>
          {creditBalance && (
            <p className="mt-2 text-sm font-medium text-violet-700 dark:text-violet-300">
              {creditBalance.available} credits available ·{' '}
              {creditBalance.reserved} reserved · renews{' '}
              {new Date(creditBalance.periodEnd).toLocaleDateString()}
            </p>
          )}
          {rolloutEnabled && !hasProSubscription && (
            <Link
              href="/pricing?source=director-generation-gate"
              onClick={() =>
                posthog.capture('director_generation_upgrade_clicked', {
                  reason: 'subscription_required',
                  project_saved: Boolean(projectId),
                  shot_count: shots.length,
                })
              }
              className="mt-2 inline-flex text-sm font-semibold text-violet-600 hover:underline"
            >
              View Studio Pro plans
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refreshTasks()}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-medium dark:border-white/10"
        >
          <RefreshCw className="size-3.5" /> Refresh versions
        </button>
      </div>

      {planDirty && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          <CircleAlert className="size-4" /> Unsaved edits are protected from
          accidental generation. Save to Studio to continue.
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-lg bg-sky-500/10 px-3 py-2 text-sm text-sky-700 dark:text-sky-300">
          {message}
        </p>
      )}

      <div className="mt-5 grid gap-4">
        {shots.map((shot, shotIndex) => {
          const referenceVersions = generationVersions(
            tasks,
            shot.id,
            'reference',
          );
          const videoVersions = generationVersions(tasks, shot.id, 'video');
          const selectedReference = resolveGenerationSelection(
            referenceVersions,
            selections[shot.id]?.reference,
          );
          const selectedVideo = resolveGenerationSelection(
            videoVersions,
            selections[shot.id]?.video,
          );
          const referencePending = pendingKey === `${shot.id}:reference`;
          const videoPending = pendingKey === `${shot.id}:video`;
          const referenceRunning = referenceVersions.some(
            (task) => task.status === 'todo' || task.status === 'running',
          );
          const videoRunning = videoVersions.some(
            (task) => task.status === 'todo' || task.status === 'running',
          );
          const referenceQuote = quotes?.reference;
          const videoQuote = quotes?.video;

          const selectTask = (
            kind: GenerationKind,
            taskId: string,
            versionNumber: number,
          ) => {
            onSelectTask(shot.id, kind, taskId);
            posthog.capture('director_generation_version_selected', {
              kind,
              version_number: versionNumber,
              shot_position: shotIndex + 1,
              shot_count: shots.length,
            });
          };

          return (
            <article
              key={shot.id}
              className="rounded-lg border border-black/10 p-4 dark:border-white/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{shot.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {referenceVersions.length} reference version
                    {referenceVersions.length === 1 ? '' : 's'} ·{' '}
                    {videoVersions.length} video version
                    {videoVersions.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void submit(shot, 'reference')}
                    disabled={
                      planDirty ||
                      !generationEnabled ||
                      !pricingAvailable ||
                      referencePending ||
                      referenceRunning
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {referencePending || referenceRunning ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : referenceVersions[0]?.status === 'failed' ? (
                      <RotateCcw className="size-3.5" />
                    ) : (
                      <ImageIcon className="size-3.5" />
                    )}
                    {generationButtonLabel('reference', referenceVersions)}
                    {referenceQuote
                      ? ` · ${referenceQuote.requiredCredits} credits`
                      : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void submit(
                        shot,
                        'video',
                        selectedReference?.mediaUrl || undefined,
                      )
                    }
                    disabled={
                      planDirty ||
                      !generationEnabled ||
                      !pricingAvailable ||
                      !selectedReference?.mediaUrl ||
                      videoPending ||
                      videoRunning
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-medium text-white disabled:opacity-40 dark:bg-white dark:text-zinc-950"
                  >
                    {videoPending || videoRunning ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : videoVersions[0]?.status === 'failed' ? (
                      <RotateCcw className="size-3.5" />
                    ) : (
                      <Video className="size-3.5" />
                    )}
                    {generationButtonLabel('video', videoVersions)}
                    {videoQuote
                      ? ` · ${videoQuote.requiredCredits} credits`
                      : ''}
                  </button>
                  {simulationEnabled && (
                    <button
                      type="button"
                      onClick={() =>
                        void submit(shot, 'reference', undefined, 'simulation')
                      }
                      disabled={
                        planDirty || referencePending || referenceRunning
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700 disabled:opacity-50 dark:text-emerald-300"
                    >
                      <Clock3 className="size-3.5" /> Run free simulation
                    </button>
                  )}
                </div>
              </div>

              {selectedVideo && (
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <Check className="size-3.5" /> This shot has a selected final
                  video.
                </p>
              )}

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    Reference history
                  </h3>
                  <VersionHistory
                    kind="reference"
                    versions={referenceVersions}
                    selectedTaskId={selections[shot.id]?.reference}
                    onSelect={(taskId, versionNumber) =>
                      selectTask('reference', taskId, versionNumber)
                    }
                  />
                </section>
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    Video history
                  </h3>
                  <VersionHistory
                    kind="video"
                    versions={videoVersions}
                    selectedTaskId={selections[shot.id]?.video}
                    onSelect={(taskId, versionNumber) =>
                      selectTask('video', taskId, versionNumber)
                    }
                  />
                </section>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
