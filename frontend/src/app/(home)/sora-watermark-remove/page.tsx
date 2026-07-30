import { FooterSection } from '@/components/home/sections/footer-section';
import { SoraWatermarkFAQ } from '@/components/home/sections/sora-watermark-faq';
import { SoraWatermarkHero } from '@/components/home/sections/sora-watermark-hero';
import { StructuredData } from '@/components/seo/structured-data';
import { Link2, Scale, ServerOff } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sora Share Link Resolver (Beta)',
  description:
    'Resolve an official Sora share link through an external provider. Availability and output quality are not guaranteed.',
  alternates: {
    canonical: 'https://www.anisora.ai/sora-watermark-remove',
  },
};

const faqData = [
  {
    question: 'Which links are accepted?',
    answer:
      'Only HTTPS share links hosted on sora.com are accepted by the AniSora endpoint.',
  },
  {
    question: 'Does AniSora remove the watermark itself?',
    answer:
      'No. AniSora forwards the public share URL to an external resolver and returns the media link supplied by that provider.',
  },
  {
    question: 'Is a result guaranteed?',
    answer:
      'No. The resolver can be unavailable, rate-limited, or unable to process a particular link.',
  },
  {
    question: 'Can I republish the downloaded file?',
    answer:
      'Only if you have the necessary rights and your use complies with the model, platform, and applicable legal terms.',
  },
];

const boundaries = [
  {
    icon: Link2,
    title: 'Official share URLs only',
    text: 'The server accepts HTTPS links on sora.com and rejects unrelated hosts.',
  },
  {
    icon: ServerOff,
    title: 'External dependency',
    text: 'Resolution is performed by a third party and can stop working without notice.',
  },
  {
    icon: Scale,
    title: 'Rights remain your responsibility',
    text: 'A downloadable URL does not grant copyright or commercial usage rights.',
  },
];

export default function SoraWatermarkRemovePage() {
  return (
    <>
      <StructuredData
        type="tool"
        breadcrumbs={[
          { name: 'Home', url: 'https://www.anisora.ai' },
          {
            name: 'Sora Share Link Resolver',
            url: 'https://www.anisora.ai/sora-watermark-remove',
          },
        ]}
        faq={faqData}
      />
      <main className="flex min-h-screen w-full flex-col items-center">
        <SoraWatermarkHero />
        <section className="w-full border-y border-border bg-muted/20 px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {boundaries.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <item.icon className="size-5" />
                <h2 className="mt-5 font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>
        <SoraWatermarkFAQ />
        <FooterSection />
      </main>
    </>
  );
}
