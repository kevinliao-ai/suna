"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/home/ui/accordion';
import { SectionHeader } from '@/components/home/section-header';

const faqs = [
  {
    question: 'What is the Sora Video Downloader?',
    answer: 'The Sora Video Downloader is a specialized web-based tool that helps users easily download Sora AI-generated videos from share links. Its main function is to provide video files in the highest available quality for direct saving to your device.',
  },
  {
    question: 'Is the Sora Video Downloader service really free? Do I need to register?',
    answer: 'Yes, our service is completely free with no hidden fees and no registration or login required. You can simply paste the video link to download immediately, without any trial restrictions or paywalls.',
  },
  {
    question: 'Can I download any video shared on the Sora platform?',
    answer: 'Yes, as long as you have a share link for a Sora video, our tool can parse and provide it for download. All links generated through the official sharing feature are supported.',
  },
  {
    question: 'Will the downloaded video have a Sora watermark?',
    answer: 'No. Our tool automatically removes watermarks from Sora videos, providing you with pure, high-definition original video files for easy secondary creation or sharing.',
  },
  {
    question: 'Does this tool support my device (iPhone, Android, PC, Mac)?',
    answer: 'Absolutely! Our tool is a web-based online service compatible with all major devices and operating systems, including iOS, Android, Windows, Mac, Linux, and more. No need to install any apps or extensions.',
  },
  {
    question: 'What about copyright issues when downloading Sora videos?',
    answer: 'Please be mindful of copyright issues. Downloaded videos are for personal learning and enjoyment only and should not be used for commercial purposes or unauthorized distribution. When using this tool to download videos, please ensure compliance with relevant laws and regulations and the Sora platform\'s terms of service.',
  },
  {
    question: 'How fast is the video download?',
    answer: 'Download speed depends on your network connection and video file size. Typically, the parsing process takes only a few seconds, and download speeds can reach your network bandwidth limit.',
  },
  {
    question: 'Do you collect my personal information?',
    answer: 'No. We respect your privacy and do not collect any personal data or track your download history. Your video links are only used for temporary parsing and are not stored or shared.',
  },
];

export function SoraWatermarkFAQ() {
  return (
    <section
      id="faq"
      className="flex flex-col items-center justify-center gap-8 md:gap-10 py-12 md:py-20 w-full relative"
    >
      <div className="w-full px-4 sm:px-6">
        <SectionHeader>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance px-4">
            Frequently Asked Questions – FAQ
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center text-balance font-medium max-w-2xl mx-auto px-4">
            Common questions about the Sora Video Watermark Remover
          </p>
        </SectionHeader>

        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 md:px-10">
          <Accordion
            type="single"
            collapsible
            className="w-full border-b-0 grid gap-2"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={index.toString()}
                className="border-0 grid gap-2"
              >
                <AccordionTrigger className="border bg-accent border-border rounded-lg px-3 sm:px-4 py-3 sm:py-3.5 cursor-pointer no-underline hover:no-underline data-[state=open]:ring data-[state=open]:ring-primary/20 text-left text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="p-3 sm:p-4 border text-primary rounded-lg bg-accent">
                  <p className="text-primary font-medium leading-relaxed text-sm sm:text-base">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
