'use client';

import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ToolEmbedProps {
  title: string;
  url: string;
}

type EmbedState = 'loading' | 'ready' | 'slow';

const EMBED_SLOW_TIMEOUT_MS = 12_000;

export function ToolEmbed({ title, url }: ToolEmbedProps) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<EmbedState>('loading');
  const slowTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setState('loading');
    slowTimer.current = window.setTimeout(
      () => setState('slow'),
      EMBED_SLOW_TIMEOUT_MS,
    );

    return () => window.clearTimeout(slowTimer.current);
  }, [attempt, url]);

  const retry = () => {
    setAttempt((current) => current + 1);
  };

  const markReady = () => {
    window.clearTimeout(slowTimer.current);
    setState('ready');
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted/40">
      {state !== 'ready' ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background/90 p-6 text-center backdrop-blur-sm">
          {state === 'loading' ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
              Loading external tool…
            </div>
          ) : (
            <div className="max-w-sm">
              <div className="mx-auto mb-4 grid size-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <RefreshCw className="size-5" />
              </div>
              <p className="font-medium">
                The external tool is taking longer than expected.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The provider may be busy or unavailable. Your AniSora project
                metadata is unaffected.
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={retry}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-80"
                >
                  <RefreshCw className="size-4" />
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
      <iframe
        key={`${url}:${attempt}`}
        src={url}
        title={title}
        className="h-full w-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={markReady}
      />
    </div>
  );
}
