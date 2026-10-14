'use client';

import { CTASection } from '@/components/home/sections/cta-section';
import { FooterSection } from '@/components/home/sections/footer-section';
import { HeroSection } from '@/components/home/sections/hero-section';
import { OpenSourceSection } from '@/components/home/sections/open-source-section';
import { FAQSection } from '@/components/home/sections/faq-section';
import { UseCasesSection } from '@/components/home/sections/use-cases-section';
import { PricingPreviewSection } from '@/components/home/sections/pricing-preview-section';
import { VideoIntelligenceSection } from '@/components/home/sections/video-intelligence-section';
import { StructuredData } from '@/components/seo/structured-data';
import { siteConfig } from '@/lib/home';

const faq = siteConfig.faqSection.faQitems.map(({ question, answer }) => ({
  question,
  answer,
}));

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center">
      <StructuredData faq={faq} />
      <div className="w-full divide-y divide-border">
        <HeroSection />
        <UseCasesSection />
        <VideoIntelligenceSection />
        <PricingPreviewSection />
        <OpenSourceSection />
        <FAQSection />
        <CTASection />
        <FooterSection />
      </div>
    </main>
  );
}

