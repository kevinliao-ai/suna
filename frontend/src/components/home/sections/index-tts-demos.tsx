import { SectionHeader } from '@/components/home/section-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function IndexTTSDemos() {
  return (
    <section id="demos" className="w-full px-6 mb-12">
      <div className="max-w-6xl mx-auto p-8">
        <SectionHeader>
          <h2 className="text-3xl font-medium text-center">Live Demos</h2>
          <p className="text-muted-foreground text-center">Interactive demos are available in the Dashboard for authenticated users.</p>
        </SectionHeader>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-border rounded-lg flex flex-col gap-3 items-start">
            <h4 className="font-semibold">Dashboard demo (recommended)</h4>
            <p className="text-sm text-muted-foreground">Try live synthesis, input text and listen to generated audio.</p>
            <Link href="/dashboard?tool=index-tts" className="mt-2">
              <Button>Open Dashboard demo</Button>
            </Link>
          </div>

          <div className="p-4 border border-border rounded-lg flex flex-col gap-3 items-start">
            <h4 className="font-semibold">Official hosted playground</h4>
            <p className="text-sm text-muted-foreground">If you prefer, use the official online playground hosted by the project.</p>
            <a href="https://index-tts.github.io/index-tts2.github.io/" target="_blank" rel="noreferrer noopener">
              <Button>Open official playground</Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
