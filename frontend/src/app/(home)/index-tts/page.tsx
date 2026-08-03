import { IndexTTSHero } from '@/components/home/sections/index-tts-hero';
import { IndexTTSOpenSource } from '@/components/home/sections/index-tts-open-source';
import { FooterSection } from '@/components/home/sections/footer-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IndexTTS Voice Studio',
  description:
    'Explore expressive speech synthesis through the embedded IndexTTS demo in AniSora Studio.',
  alternates: {
    canonical: 'https://www.anisora.ai/index-tts',
  },
};

export default function IndexTTSPage() {
  return (
    <main className="flex w-full flex-col items-center">
      <IndexTTSHero />
      <IndexTTSOpenSource />
      <FooterSection />
    </main>
  );
}
