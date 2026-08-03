import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/home/ui/accordion';

const faqs = [
  {
    question: 'What does this tool do?',
    answer:
      'It sends a public Sora share URL to an external resolver and displays the HTTPS MP4 URL returned by that service.',
  },
  {
    question: 'Why can a link fail?',
    answer:
      'The share may be private or expired, or the external resolver may be unavailable, changed, or rate-limited.',
  },
  {
    question: 'What data leaves AniSora?',
    answer:
      'The Sora share URL is sent to the external resolver. Do not use the tool with confidential or private links.',
  },
  {
    question: 'Does downloading grant usage rights?',
    answer:
      'No. You remain responsible for copyright, consent, platform rules, model terms, and any commercial-use restrictions.',
  },
];

export function SoraWatermarkFAQ() {
  return (
    <section id="faq" className="w-full px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">
          Before you use it
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-8 space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={String(index)}
              className="rounded-xl border border-border px-4"
            >
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
