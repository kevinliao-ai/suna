'use client';

import { useState } from 'react';

interface ToolEmbedProps {
  title: string;
  url: string;
}

export function ToolEmbed({ title, url }: ToolEmbedProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted/40">
      {loading ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background/80">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            Loading external tool…
          </div>
        </div>
      ) : null}
      <iframe
        src={url}
        title={title}
        className="h-full w-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
