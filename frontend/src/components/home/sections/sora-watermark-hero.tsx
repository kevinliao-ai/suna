'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

interface ParseResult {
  success: boolean;
  data?: { links: { mp4: string } };
  message?: string;
}

export function SoraWatermarkHero() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleParse = async () => {
    if (!videoUrl.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/watermark/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: videoUrl.trim() }),
      });
      setResult((await response.json()) as ParseResult);
    } catch {
      setResult({
        success: false,
        message: 'The request failed. Check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="resolver" className="w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <p className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          Beta · external resolver
        </p>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          Resolve a Sora share link
        </h1>
        <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-muted-foreground">
          Paste an official sora.com share link. AniSora asks a third-party
          resolver for an available MP4 link; success and media quality are not
          guaranteed.
        </p>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://sora.com/…"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !loading) handleParse();
                }}
                disabled={loading}
                className="h-11 pl-10"
              />
            </div>
            <Button
              type="button"
              onClick={handleParse}
              disabled={loading || !videoUrl.trim()}
              className="h-11 px-6"
            >
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LinkIcon className="mr-2 size-4" />
              )}
              {loading ? 'Resolving…' : 'Resolve link'}
            </Button>
          </div>

          {result ? (
            <div
              className={`mt-4 rounded-xl border p-4 text-left text-sm ${
                result.success
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-red-500/20 bg-red-500/5'
              }`}
              role="status"
            >
              <div className="flex gap-3">
                {result.success ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="size-5 shrink-0 text-red-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {result.success
                      ? 'Media link available'
                      : 'Could not resolve link'}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {result.message ||
                      (result.success
                        ? 'Review your rights before downloading or republishing this media.'
                        : 'Check that this is a public official Sora share link.')}
                  </p>
                  {result.success && result.data?.links.mp4 ? (
                    <a
                      href={result.data.links.mp4}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 font-medium text-background"
                    >
                      <Download className="size-4" />
                      Open MP4
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <p className="mx-auto mt-5 max-w-xl text-xs leading-relaxed text-muted-foreground">
          The submitted share URL is sent to the external resolver. Do not
          submit private or confidential links.
        </p>
      </div>
    </section>
  );
}
