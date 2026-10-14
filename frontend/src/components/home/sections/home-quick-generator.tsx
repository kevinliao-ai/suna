'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Video } from 'lucide-react';
import posthog from 'posthog-js';

import { pricingHref } from '@/lib/conversion-source';
import { createClient } from '@/lib/supabase/client';

const draftKey = 'anisora:quick-generation-draft';
const maxImageSide = 1280;
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

type Phase = 'idle' | 'submitting' | 'running' | 'done' | 'failed';

interface Draft {
  prompt: string;
  image: string;
}

function readDraft(): Draft | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
    return value &&
      typeof value.prompt === 'string' &&
      typeof value.image === 'string' &&
      value.image.startsWith('data:image/jpeg;base64,')
      ? value
      : null;
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft | null) {
  try {
    if (draft) sessionStorage.setItem(draftKey, JSON.stringify(draft));
    else sessionStorage.removeItem(draftKey);
  } catch {
    // Storage can be full or disabled; the in-memory draft still works.
  }
}

async function resizeImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = document.createElement('img');
    image.src = url;
    await image.decode();
    const scale = Math.min(
      1,
      maxImageSide / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function HomeQuickGenerator() {
  const supabase = useMemo(() => createClient(), []);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [needsPro, setNeedsPro] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState<number | null>(null);
  const [taskId, setTaskId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      setPrompt(draft.prompt);
      setImage(draft.image);
      setMessage('Your draft is restored. Press Generate to continue.');
    }

    let active = true;
    void fetch('/api/generation/fal')
      .then((response) => response.json())
      .then((payload: { quotes?: { video?: { requiredCredits?: unknown } } }) => {
        const credits = payload.quotes?.video?.requiredCredits;
        if (active && typeof credits === 'number') setRequiredCredits(credits);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const pollTask = useCallback(async () => {
    if (!taskId) return;
    const { data } = await supabase
      .from('anisora_tasks')
      .select('status,output,error_message')
      .eq('id', taskId)
      .maybeSingle();
    if (!data) return;

    const mediaUrl =
      data.output && typeof data.output === 'object'
        ? (data.output as { mediaUrl?: unknown }).mediaUrl
        : null;
    if (data.status === 'done' && typeof mediaUrl === 'string') {
      setVideoUrl(mediaUrl);
      setPhase('done');
      setMessage('');
      posthog.capture('home_generator_completed');
    } else if (data.status === 'failed') {
      setPhase('failed');
      setMessage(
        data.error_message ||
          'The provider did not return a video. Reserved credits were returned.',
      );
      posthog.capture('home_generator_failed', { reason: 'provider_failed' });
    }
  }, [supabase, taskId]);

  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setInterval(() => void pollTask(), 5000);
    return () => window.clearInterval(timer);
  }, [phase, pollTask]);

  const chooseImage = async (file: File | undefined) => {
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      setMessage('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    try {
      const resized = await resizeImage(file);
      setImage(resized);
      setMessage('');
      writeDraft({ prompt, image: resized });
      posthog.capture('home_generator_image_selected', { type: file.type });
    } catch {
      setMessage('This image could not be read. Try another file.');
    }
  };

  const updatePrompt = (value: string) => {
    setPrompt(value);
    if (image) writeDraft({ prompt: value, image });
  };

  const generate = async () => {
    if (!image || prompt.trim().length < 10) {
      setMessage('Add a reference image and describe the motion (10+ characters).');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    posthog.capture('home_generator_submit_clicked', { signed_in: Boolean(user) });
    writeDraft({ prompt, image });
    if (!user) {
      posthog.capture('home_generator_auth_required');
      window.location.assign(
        `/auth?mode=signup&returnUrl=${encodeURIComponent('/#quick-generator')}`,
      );
      return;
    }

    setPhase('submitting');
    setMessage('');
    setNeedsPro(false);
    try {
      const body = new FormData();
      body.append('prompt', prompt.trim());
      body.append('image', await (await fetch(image)).blob(), 'reference.jpg');
      const response = await fetch('/api/generation/quick', {
        method: 'POST',
        body,
      });
      const payload = (await response.json().catch(() => ({}))) as {
        taskId?: string;
        projectId?: string;
        quote?: { requiredCredits?: number };
        error?: { code?: string; message?: string };
      };

      if (!response.ok || !payload.taskId) {
        const code = payload.error?.code || 'request_failed';
        setPhase('failed');
        setNeedsPro(code === 'subscription_required');
        setMessage(payload.error?.message || 'Generation request failed.');
        posthog.capture(
          code === 'subscription_required'
            ? 'home_generator_paywall_viewed'
            : 'home_generator_failed',
          { reason: code },
        );
        return;
      }

      writeDraft(null);
      setTaskId(payload.taskId);
      setProjectId(payload.projectId || '');
      setPhase('running');
      setMessage('Generating your 5-second video. This usually takes a few minutes.');
      posthog.capture('home_generator_submitted', {
        required_credits: payload.quote?.requiredCredits ?? null,
      });
    } catch {
      setPhase('failed');
      setMessage('Generation request failed. Please try again.');
      posthog.capture('home_generator_failed', { reason: 'network' });
    }
  };

  const busy = phase === 'submitting' || phase === 'running';

  return (
    <div
      id="quick-generator"
      className="w-full scroll-mt-24 rounded-2xl border border-border bg-background/90 p-4 text-left shadow-sm backdrop-blur md:p-5"
    >
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-accent/40 text-sm text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed md:aspect-square"
        >
          {image ? (
            <Image
              src={image}
              alt="Uploaded reference"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 px-4 text-center">
              <ImagePlus className="size-6" />
              Upload anime reference image
            </span>
          )}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept={acceptedTypes.join(',')}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            void chooseImage(event.target.files?.[0]);
            event.target.value = '';
          }}
        />

        <div className="flex flex-col gap-3">
          <label htmlFor="quick-generator-prompt" className="text-sm font-medium">
            Describe the motion
          </label>
          <textarea
            id="quick-generator-prompt"
            value={prompt}
            onChange={(event) => updatePrompt(event.target.value)}
            maxLength={2000}
            rows={3}
            disabled={busy}
            placeholder="She turns toward the camera as cherry blossoms drift past, hair moving in the wind, soft cinematic anime lighting."
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/40"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Upload only images you have rights to. No real-person likeness or
              adult content.
            </p>
            <button
              type="button"
              onClick={() => void generate()}
              disabled={busy}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-secondary px-5 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/90 disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Video className="size-4" />
              )}
              {requiredCredits
                ? `Generate 5s video · ${requiredCredits} credits`
                : 'Generate 5s video'}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-3 text-sm ${phase === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}
        >
          {message}
          {needsPro && (
            <>
              {' '}
              <Link
                href={pricingHref('home-generator')}
                className="font-medium text-secondary underline underline-offset-4"
              >
                Unlock Studio Pro
              </Link>
            </>
          )}
        </p>
      )}

      {phase === 'done' && videoUrl && (
        <div className="mt-4 grid gap-3">
          <video
            controls
            autoPlay
            muted
            playsInline
            src={videoUrl}
            aria-label="Generated anime video"
            className="aspect-video w-full rounded-xl bg-black"
          />
          {projectId && (
            <Link
              href={`/dashboard/director?directorProject=${encodeURIComponent(projectId)}`}
              className="text-sm font-medium text-secondary underline underline-offset-4"
            >
              Continue in Director to make more shots
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
