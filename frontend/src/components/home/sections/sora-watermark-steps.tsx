"use client";

import { SectionHeader } from '@/components/home/section-header';
import { Copy, FileInput, Download, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const steps = [
  {
    number: 1,
    icon: Copy,
    title: 'Copy Sora Video Share Link',
    description: 'Open the Sora mobile app or video sharing platform, click the "Share" button, and select "Copy Link" to save the URL to your clipboard.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
  },
  {
    number: 2,
    icon: FileInput,
    title: 'Paste the Link into Our Input Box',
    description: 'Visit our Sora video downloader page and paste the copied link into the dedicated text box at the top of the page.',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
  },
  {
    number: 3,
    icon: Download,
    title: 'Click "Download" to Get HD Video',
    description: 'Click the "Download" button, wait a moment, and the tool will generate a link to save the high-definition MP4 video file directly to your device.',
    image: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=400&h=300&fit=crop',
  },
];

export function SoraWatermarkSteps() {
  return (
    <section
      id="how-to-use"
      className="flex flex-col items-center justify-center gap-12 md:gap-16 py-12 md:py-20 w-full relative bg-accent/20"
    >
      <div className="w-full px-4 sm:px-6 max-w-7xl mx-auto">
        <SectionHeader>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance px-4">
            How to Use: Download Sora Videos in 3 Easy Steps
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center text-balance font-medium max-w-2xl mx-auto px-4">
            Simple, fast, no registration required, use immediately
          </p>
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-6 lg:gap-8 mt-8 md:mt-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div
                key={index}
                className="flex flex-col gap-4 sm:gap-5 md:gap-6 relative"
              >
                {/* Desktop: Horizontal Arrow Connection */}
                {!isLast && (
                  <div className="hidden md:flex absolute top-16 left-[calc(50%+50px)] w-[calc(100%-100px)] items-center justify-center z-0">
                    <div className="w-full h-0.5 bg-gradient-to-r from-secondary/50 via-secondary/30 to-transparent"></div>
                    <ArrowRight className="absolute right-0 h-5 w-5 text-secondary/50 -translate-x-1" />
                  </div>
                )}

                {/* Mobile: Vertical Arrow Connection */}
                {!isLast && (
                  <div className="md:hidden absolute left-7 top-[70px] h-12 flex flex-col items-center justify-center z-0">
                    <div className="w-0.5 h-full bg-gradient-to-b from-secondary/50 via-secondary/30 to-transparent"></div>
                    <ArrowRight className="absolute bottom-0 h-4 w-4 text-secondary/50 rotate-90 translate-y-1" />
                  </div>
                )}

                {/* Step Card */}
                <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-secondary/30 relative z-10">
                  
                  {/* Step Number & Icon */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg ring-4 ring-secondary/10">
                      {step.number}
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent border border-border flex items-center justify-center shadow-sm">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted shadow-sm border border-border/50">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Badge (Mobile Only) */}
                  <div className="md:hidden absolute top-4 right-4 px-2 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                    <span className="text-xs font-medium text-secondary">Step {step.number}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Summary */}
        <div className="md:hidden mt-8 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
          <p className="text-sm text-center text-muted-foreground">
            💡 <span className="font-medium text-foreground">Pro Tip:</span> Bookmark this page for easy access next time!
          </p>
        </div>
      </div>
    </section>
  );
}
