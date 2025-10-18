import { SectionHeader } from '@/components/home/section-header';

export function IndexTTSResources() {
  return (
    <section id="resources" className="w-full px-6 mb-12">
      <div className="max-w-6xl mx-auto p-8">
        <SectionHeader>
          <h2 className="text-3xl font-medium text-center">Resources & Community</h2>
          <p className="text-muted-foreground text-center">Documentation, examples and community channels.</p>
        </SectionHeader>

        <div className="mt-6 flex flex-col items-center gap-3">
          <a href="https://github.com/index-tts/index-tts" target="_blank" rel="noreferrer noopener" className="underline">Project repository</a>
          <a href="https://index-tts.github.io/index-tts2.github.io/" target="_blank" rel="noreferrer noopener" className="underline">Interactive demos</a>
        </div>
      </div>
    </section>
  );
}
