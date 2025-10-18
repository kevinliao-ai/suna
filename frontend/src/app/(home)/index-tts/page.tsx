"use client";

import { IndexTTSHero } from '@/components/home/sections/index-tts-hero';
import { IndexTTSOpenSource } from '@/components/home/sections/index-tts-open-source';
import { OpenSourceSection } from '@/components/home/sections/open-source-section';
import { FooterSection } from '@/components/home/sections/footer-section';
import { SectionHeader } from '@/components/home/section-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function IndexTTSPage() {
  return (
    <main className="flex flex-col items-center w-full">
        {/* Index‑TTS specific hero (styling consistent with home) */}
        <IndexTTSHero />
        <IndexTTSOpenSource />
        <FooterSection />
    </main>
  );
}
