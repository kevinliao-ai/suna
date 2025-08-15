'use client';

import { useEffect, useState } from 'react';

export function BilibiliEmbed({ url }: { url: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="animate-pulse">Loading Bilibili content...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={url}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}
