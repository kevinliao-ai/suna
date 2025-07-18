'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface KortixLogoProps {
  href?: string;
}

export function KortixLogo({ href }: KortixLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mount, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldInvert = mounted && (
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
  );

  const logo = (
    <Image
      src="/anisora-logo.png"
      alt="AniSora"
      width={52}
      height={52}
      className={`${mounted && theme === 'dark' ? 'invert' : ''}`}
    />
  );

  return (
    <div className="flex h-14 items-center justify-center flex-shrink-0">
      {href ? (
        <Link href={href}>
          {logo}
        </Link>
      ) : (
        logo
      )}
    </div>
  );
}
