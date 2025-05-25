'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function KortixLogo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mount, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-14 items-center justify-center flex-shrink-0">
      <Link href="/">
      <Image
        src="/anisora-logo.png"
        alt="AniSora"
        width={52}
        height={52}
        className={`${mounted && theme === 'dark' ? 'invert' : ''}`}
      />
      </Link>
    </div>
  );
}
