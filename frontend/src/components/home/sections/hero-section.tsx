'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { useScroll } from 'motion/react';
import { HeroVideoSection } from '@/components/home/sections/hero-video-section';
import { FlickeringGrid } from '@/components/home/ui/flickering-grid';
import { useMediaQuery } from '@/hooks/use-media-query';
import { siteConfig } from '@/lib/home';

export function HeroSection() {
  const { hero } = siteConfig;
  const tablet = useMediaQuery('(max-width: 1024px)');
  const [mounted, setMounted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', () => {
      setIsScrolling(true);

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    });

    return () => {
      unsubscribe();
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [scrollY]);

  return (
    <section id="hero" className="relative w-full overflow-hidden">
      <div className="relative flex w-full flex-col items-center px-6">
        <HeroGrid
          side="left"
          tablet={mounted && tablet}
          isScrolling={isScrolling}
        />
        <HeroGrid
          side="right"
          tablet={mounted && tablet}
          isScrolling={isScrolling}
        />

        <div className="absolute inset-x-1/4 top-0 -z-20 h-[600px] rounded-b-xl bg-background md:h-[800px]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-8 pt-24">
          <div className="flex flex-col items-center justify-center gap-5">
            <p className="rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
              AI animation creation workspace
            </p>
            <h1 className="text-balance text-center text-3xl font-medium tracking-tighter md:text-4xl lg:text-5xl xl:text-6xl">
              <span className="text-secondary">
                Exploring the Frontiers of Animation Video Generation
              </span>
            </h1>
            <p className="max-w-2xl text-balance text-center text-base font-medium leading-relaxed tracking-tight text-muted-foreground md:text-lg">
              {hero.description}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/auth?returnUrl=/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow-sm transition hover:bg-secondary/90"
            >
              Enter AniSora Studio
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={hero.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-6 text-sm font-medium text-foreground backdrop-blur transition hover:bg-accent"
            >
              <Github className="size-4" />
              View the model
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mb-10 mt-10 max-w-4xl">
        <HeroVideoSection />
      </div>
    </section>
  );
}

function HeroGrid({
  side,
  tablet,
  isScrolling,
}: {
  side: 'left' | 'right';
  tablet: boolean;
  isScrolling: boolean;
}) {
  return (
    <div
      className={`absolute top-0 -z-10 h-[600px] w-1/3 overflow-hidden md:h-[800px] ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      <div
        className={`absolute inset-0 z-10 ${
          side === 'left'
            ? 'bg-gradient-to-r'
            : 'bg-gradient-to-l'
        } from-transparent via-transparent to-background`}
      />
      <div className="absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-background via-background/90 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-background via-background/90 to-transparent" />
      <FlickeringGrid
        className="h-full w-full"
        squareSize={tablet ? 2 : 2.5}
        gridGap={tablet ? 2 : 2.5}
        color="var(--secondary)"
        maxOpacity={0.4}
        flickerChance={isScrolling ? 0.01 : 0.03}
      />
    </div>
  );
}
