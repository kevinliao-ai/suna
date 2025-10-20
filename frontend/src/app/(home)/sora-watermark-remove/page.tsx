'use client';

import { SoraWatermarkHero } from '@/components/home/sections/sora-watermark-hero';
import { SoraWatermarkSteps } from '@/components/home/sections/sora-watermark-steps';
import { SoraWatermarkFeatures } from '@/components/home/sections/sora-watermark-features';
import { SoraWatermarkFAQ } from '@/components/home/sections/sora-watermark-faq';
import { SoraWatermarkCTA } from '@/components/home/sections/sora-watermark-cta';
import { FooterSection } from '@/components/home/sections/footer-section';
import { ModalProviders } from '@/providers/modal-providers';
import { BackgroundAALChecker } from '@/components/auth/background-aal-checker';
import { StructuredData } from '@/components/seo/structured-data';

const breadcrumbs = [
  { name: 'Home', url: 'https://anisora.ai' },
  { name: 'Tools', url: 'https://anisora.ai/tools' },
  { name: 'Sora Watermark Remover', url: 'https://anisora.ai/sora-watermark-remove' },
];

const faqData = [
  {
    question: 'Is it free to download Sora videos without watermarks?',
    answer: 'Yes, our Sora video watermark remover is 100% free with no hidden charges. You can download unlimited HD videos without any watermark, no registration or subscription required.',
  },
  {
    question: 'How do I download Sora videos without watermarks?',
    answer: 'Simply copy the Sora video link, paste it into our tool, click Parse, and then click Download. The entire process takes less than 30 seconds and requires no technical knowledge.',
  },
  {
    question: 'Does this tool work on mobile devices?',
    answer: 'Absolutely! Our Sora watermark remover is fully optimized for mobile devices including iPhone, iPad, Android phones, and tablets. Download Sora videos on any device with ease.',
  },
  {
    question: 'Is the downloaded video quality the same as the original?',
    answer: 'Yes, we maintain the original HD quality of Sora videos. You can download videos in their native resolution without any quality loss or compression.',
  },
  {
    question: 'Do I need to install any software?',
    answer: 'No installation required! Our tool is completely web-based. Just visit our website and start downloading Sora videos instantly from any browser.',
  },
  {
    question: 'Is it safe to use this Sora downloader?',
    answer: 'Absolutely safe. We don\'t store any of your data or downloaded videos. Your privacy is fully protected, and we use secure HTTPS connections for all operations.',
  },
  {
    question: 'What video formats are supported?',
    answer: 'Our tool downloads Sora videos in MP4 format, which is universally compatible with all devices and video players. You can play the downloaded videos anywhere.',
  },
  {
    question: 'Are there any download limits?',
    answer: 'No limits! You can download as many Sora videos as you want, whenever you want. Enjoy unlimited free downloads with no restrictions or daily caps.',
  },
];

export default function SoraWatermarkRemovePage() {
  return (
    <>
      <ModalProviders />
      <StructuredData 
        type="tool" 
        breadcrumbs={breadcrumbs}
        faq={faqData}
      />
      <BackgroundAALChecker>
        <main 
          className="flex flex-col items-center justify-center min-h-screen w-full"
          itemScope
          itemType="https://schema.org/WebApplication"
        >
          <meta itemProp="name" content="Sora Video Watermark Remover" />
          <meta itemProp="description" content="Free online tool to download Sora AI videos without watermarks" />
          <meta itemProp="applicationCategory" content="MultimediaApplication" />
          <meta itemProp="operatingSystem" content="Any" />
          
          <div className="w-full divide-y divide-border">
            <SoraWatermarkHero />
            <SoraWatermarkSteps />
            <SoraWatermarkFeatures />
            <SoraWatermarkFAQ />
            <SoraWatermarkCTA />
            <FooterSection />
          </div>
        </main>
      </BackgroundAALChecker>
    </>
  );
}
