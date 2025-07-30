'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { FooterSection } from '@/components/home/sections/footer-section';
// Dynamically import the BilibiliEmbed component with no SSR
const BilibiliEmbed = dynamic(
  () => import('@/components/bilibili-embed').then(mod => mod.BilibiliEmbed),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          Loading Bilibili content...
        </div>
      </div>
    )
  }
);

export default function DashboardPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = !mounted
    ? '/anisora-logo.png'
    : resolvedTheme === 'dark'
      ? '/anisora-logo.png'
      : '/anisora-logo.png';

  return (
    <div className="flex flex-col h-full w-full">
      {/* Simple Header with Logo */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Link href="/" className="flex items-center -ml-1.5">
            <Image
              src={logoSrc}
              alt="AniSora Logo"
              width={120}
              height={24}
              className="h-6 w-auto"
              priority
            />
          </Link>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 w-full overflow-hidden">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="animate-pulse">Loading Bilibili content...</div>
          </div>
        }>
          <div className="h-[calc(100vh-14rem)] w-full">
            <BilibiliEmbed url="https://bilibili-index-anisora.ms.show/" />
          </div>
        </Suspense>
      </div>
      <FooterSection showMaintenanceQulckLink={false} />
    </div>
  );
}
