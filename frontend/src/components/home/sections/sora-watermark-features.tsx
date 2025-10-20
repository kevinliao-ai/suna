"use client";

import { SectionHeader } from '@/components/home/section-header';
import { Sparkles, Zap, Shield, Gift } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: Sparkles,
    title: 'Pure, Direct HD File Downloads',
    description: 'Ensure you get the highest available quality version of your content. We provide original high-definition (HD) MP4 video files from share links, guaranteeing every frame maintains its original visual quality for easy storage, playback, or reuse.',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop&q=80',
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Download Experience',
    description: 'Powered by advanced video acquisition technology, our tool offers blazing-fast download speeds. Just paste the link, and within seconds your Sora video will be saved to your device, greatly reducing wait times and getting your files instantly.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  },
  {
    icon: Shield,
    title: 'Universal Compatibility, Simple Operation',
    description: 'No need to install any software, apps, or browser extensions. Our online Sora downloader is extremely easy to use and fully compatible with all major devices and operating systems—including iOS, Android, PC, and Mac. Download easily anytime, anywhere.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
  },
  {
    icon: Gift,
    title: '100% Free and Privacy-Focused',
    description: 'The Sora video downloader service is completely free, with no hidden fees, trial limits, or registration required. We respect your privacy: we don\'t collect any personal data or track your download history. Feel free to use it with confidence.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&q=80',
  },
];

export function SoraWatermarkFeatures() {
  return (
    <section
      id="features"
      className="flex flex-col items-center justify-center gap-12 md:gap-16 py-12 md:py-20 w-full relative"
    >
      <div className="w-full px-4 sm:px-6 max-w-7xl mx-auto">
        <SectionHeader>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance px-4">
            Why Choose Our Sora Watermark Removal Tool?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center text-balance font-medium max-w-2xl mx-auto px-4">
            Professional, secure, and efficient Sora video download solution
          </p>
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mt-8 md:mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-5 md:p-6 rounded-2xl border bg-accent/30 hover:bg-accent/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted shadow-sm border border-border/50">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
