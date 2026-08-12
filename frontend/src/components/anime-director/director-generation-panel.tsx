'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImageIcon, LoaderCircle, RefreshCw, Video } from 'lucide-react';

import type { AnimeDirectorShot } from '@/lib/anime-director';
import { createClient } from '@/lib/supabase/client';

interface GenerationTask {
  id: string;
  shotId: string;
  kind: 'reference' | 'video';
  status: 'running' | 'done' | 'failed';
  mediaUrl: string | null;
  archiveStatus: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface GenerationQuote {
  estimatedCostUsd: number;
  hardLimitUsd: number;
  unit: string;
}

function readTask(row: {
  id: string;
  status: string;
  input: unknown;
  output: unknown;
  error_message: string | null;
  created_at: string;
}): GenerationTask | null {
  const input =
    row.input && typeof row.input === 'object'
      ? (row.input as { shotId?: unknown; kind?: unknown })
      : {};
  const output =
    row.output && typeof row.output === 'object'
      ? (row.output as { mediaUrl?: unknown; archiveStatus?: unknown })
      : {};

  if (
    typeof input.shotId !== 'string'
    || (input.kind !== 'reference' && input.kind !== 'video')
    || !['running', 'done', 'failed'].includes(row.status)
  ) {
    return null;
  }

  return {
    id: row.id,
    shotId: input.shotId,
    kind: input.kind,
    status: row.status as GenerationTask['status'],
    mediaUrl: typeof output.mediaUrl === 'string' ? output.mediaUrl : null,
    archiveStatus:
      typeof output.archiveStatus === 'string' ? output.archiveStatus : null,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  };
}

export function DirectorGenerationPanel({
  projectId,
  shots,
}: {
  projectId?: string;
  shots: AnimeDirectorShot[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [generationEnabled, setGenerationEnabled] = useState(false);
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [pricingAvailable, setPricingAvailable] = useState(false);
  const [quotes, setQuotes] = useState<Record<'reference' | 'video', GenerationQuote> | null>(null);
  const [pendingKey, setPendingKey] = useState('');
  const [message, setMessage] = useState('');

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
      .select('id,status,input,output,error_message,created_at')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .in('provider', ['fal', 'simulation'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      setMessage('Could not refresh generation tasks.');
      return;
    }

    setTasks(
      (data || [])
        .map(readTask)
        .filter((task): task is GenerationTask => Boolean(task)),
    );
  }, [projectId, supabase]);

  useEffect(() => {
    let active = true;
    void fetch('/api/generation/fal')
      .then((response) => response.json())
      .then((payload: {
        enabled?: unknown;
        simulationEnabled?: unknown;
        pricingAvailable?: unknown;
        quotes?: unknown;
      }) => {
        if (!active) return;
        setGenerationEnabled(payload.enabled === true);
        setSimulationEnabled(payload.simulationEnabled === true);
        setPricingAvailable(payload.pricingAvailable === true);
        setQuotes(payload.quotes && typeof payload.quotes === 'object'
          ? payload.quotes as Record<'reference' | 'video', GenerationQuote>
          : null);
      })
      .catch(() => {
        if (active) setGenerationEnabled(false);
      });

    return () => {
      active = false;
    };
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
    kind: 'reference' | 'video',
    imageUrl?: string,
    mode: 'paid' | 'simulation' = 'paid',
  ) => {
    if (!projectId) {
      setMessage('Save this Director plan before generating.');
      return;
    }

    const label = kind === 'reference' ? 'reference frame' : '5-second video';
    const quote = quotes?.[kind];
    const confirmed = mode === 'simulation' || window.confirm(
      `Generate a paid ${label} with fal.ai for an estimated $${quote?.estimatedCostUsd.toFixed(4)} USD? The server will reject it above the $${quote?.hardLimitUsd.toFixed(2)} limit.`,
    );
    if (!confirmed) return;

    const key = `${shot.id}:${kind}`;
    setPendingKey(key);
    setMessage('');

    try {
      const response = await fetch('/api/generation/fal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          shotId: shot.id,
          kind,
          prompt: shot.visualPrompt,
          imageUrl,
          mode,
        }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(payload.error?.message || 'Generation request failed.');
      }

      setMessage(
        mode === 'simulation'
          ? 'Free pipeline simulation completed. No provider request or charge was created.'
          : `${kind === 'reference' ? 'Reference' : 'Video'} queued. Results will appear automatically.`,
      );
      await refreshTasks();
    } catch (error) {
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
        <h2 className="text-lg font-semibold">Generate real shot assets</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Save this plan to Studio first. Paid generation stays disabled until the project has a secure owner and task history.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Real generation</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {generationEnabled
              ? pricingAvailable
                ? 'Live server quotes and hard cost limits are active. Each paid request still requires explicit approval.'
                : 'Paid generation is locked because the provider price could not be verified.'
              : simulationEnabled
                ? 'Use the free pipeline simulation while live provider generation is disabled.'
                : 'Paid generation is currently limited to the approved production tester.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshTasks()}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-medium dark:border-white/10"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-lg bg-sky-500/10 px-3 py-2 text-sm text-sky-700 dark:text-sky-300">
          {message}
        </p>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {shots.map((shot) => {
          const shotTasks = tasks.filter((task) => task.shotId === shot.id);
          const reference = shotTasks.find(
            (task) => task.kind === 'reference' && task.status === 'done' && task.mediaUrl,
          );
          const videoTask = shotTasks.find((task) => task.kind === 'video');
          const referenceTask = shotTasks.find((task) => task.kind === 'reference');
          const referencePending = pendingKey === `${shot.id}:reference`;
          const videoPending = pendingKey === `${shot.id}:video`;
          const referenceQuote = quotes?.reference;
          const videoQuote = quotes?.video;

          return (
            <article key={shot.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
              <p className="text-sm font-semibold">{shot.title}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void submit(shot, 'reference')}
                  disabled={
                    !generationEnabled
                    || !pricingAvailable
                    || referencePending
                    || referenceTask?.status === 'running'
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {referencePending || referenceTask?.status === 'running' ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="size-3.5" />
                  )}
                  Generate reference{referenceQuote ? ` · est. $${referenceQuote.estimatedCostUsd.toFixed(4)}` : ''}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void submit(shot, 'video', reference?.mediaUrl || undefined)
                  }
                  disabled={
                    !generationEnabled
                    || !pricingAvailable
                    || !reference?.mediaUrl
                    || videoPending
                    || videoTask?.status === 'running'
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-medium text-white disabled:opacity-40 dark:bg-white dark:text-zinc-950"
                >
                  {videoPending || videoTask?.status === 'running' ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <Video className="size-3.5" />
                  )}
                  Generate 5s video{videoQuote ? ` · est. $${videoQuote.estimatedCostUsd.toFixed(4)}` : ''}
                </button>
                {simulationEnabled && (
                  <button
                    type="button"
                    onClick={() => void submit(shot, 'reference', undefined, 'simulation')}
                    disabled={referencePending}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700 disabled:opacity-60 dark:text-emerald-300"
                  >
                    <ImageIcon className="size-3.5" /> Run free pipeline simulation
                  </button>
                )}
              </div>

              {referenceTask?.status === 'failed' && (
                <p className="mt-3 text-xs text-red-600">
                  Reference failed: {referenceTask.errorMessage || 'Provider error'}
                </p>
              )}
              {videoTask?.status === 'failed' && (
                <p className="mt-3 text-xs text-red-600">
                  Video failed: {videoTask.errorMessage || 'Provider error'}
                </p>
              )}

              {reference?.mediaUrl && (
                <div className="mt-4 overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
                  <Image
                    src={reference.mediaUrl}
                    alt={`Generated reference for ${shot.title}`}
                    width={640}
                    height={360}
                    unoptimized
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}
              {videoTask?.status === 'done' && videoTask.mediaUrl && (
                <video
                  controls
                  preload="metadata"
                  src={videoTask.mediaUrl}
                  className="mt-4 aspect-video w-full rounded-lg bg-black"
                />
              )}
              {(reference?.archiveStatus === 'stored'
                || videoTask?.archiveStatus === 'stored') && (
                <p className="mt-2 text-xs text-emerald-600">Private R2 archive stored.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
