"use client";

import { HeroVideoDialog } from '@/components/home/ui/hero-video-dialog';
import { FlickeringGrid } from '@/components/home/ui/flickering-grid';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState, useEffect, useRef } from 'react';
import { useScroll } from 'motion/react';
import Link from 'next/link';

const IndexTTSVideo = `https://cdn.anisora.ai/index-tts2.mp4`;

export function IndexTTSHero() {
  const tablet = useMediaQuery('(max-width: 1024px)');
  const [mounted, setMounted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const { scrollY } = useScroll();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', () => {
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 300);
    });
    return unsubscribe;
  }, [scrollY]);

  return (
    <section id="hero" className="w-full relative overflow-hidden">
      <div className="relative flex flex-col items-center w-full px-6">
        <div className="absolute left-0 top-0 h-[600px] md:h-[800px] w-1/3 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background z-10" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
          <FlickeringGrid
            className="h-full w-full"
            squareSize={mounted && tablet ? 2 : 2.5}
            gridGap={mounted && tablet ? 2 : 2.5}
            color="var(--secondary)"
            maxOpacity={0.4}
            flickerChance={isScrolling ? 0.01 : 0.03}
          />
        </div>

        <div className="absolute right-0 top-0 h-[600px] md:h-[800px] w-1/3 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background z-10" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
          <FlickeringGrid
            className="h-full w-full"
            squareSize={mounted && tablet ? 2 : 2.5}
            gridGap={mounted && tablet ? 2 : 2.5}
            color="var(--secondary)"
            maxOpacity={0.4}
            flickerChance={isScrolling ? 0.01 : 0.03}
          />
        </div>

        <div className="absolute inset-x-1/4 top-0 h-[600px] md:h-[800px] -z-20 bg-background rounded-b-xl"></div>

        <div className="relative z-10 pt-22 max-w-3xl mx-auto h-full w-full flex flex-col gap-6 items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-balance text-center">
              <span className="text-secondary">High-fidelity, Open-source TTS: scalable multi-speaker synthesis with production-ready vocoders</span>
            </h1>
            <p className="text-base md:text-lg text-center text-muted-foreground font-medium text-balance leading-relaxed tracking-tight max-w-3xl">
              Try live synthesis in the Dashboard demo.
            </p>
          </div>

          <div className="mb-10 max-w-4xl mx-auto w-full">
            <div className="relative w-full mx-auto shadow-xl rounded-2xl overflow-hidden">
              <HeroVideoDialog
                className="block dark:hidden"
                animationStyle="from-center"
                videoSrc={IndexTTSVideo}
                thumbnailSrc="https://cdn.anisora.ai/index-tts2/hero-img.webp"
                thumbnailAlt="Index‑TTS Demo"
              />
              <HeroVideoDialog
                className="hidden dark:block"
                animationStyle="from-center"
                videoSrc={IndexTTSVideo}
                thumbnailSrc="https://cdn.anisora.ai/index-tts2/hero-img.webp"
                thumbnailAlt="Index‑TTS Demo"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
