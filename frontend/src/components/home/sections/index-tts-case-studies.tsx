import { SectionHeader } from '@/components/home/section-header';

export function IndexTTSCaseStudies() {
  const studies = [
    { id: '1', title: 'Voice assistants', desc: 'Natural multi-turn responses for assistants.' },
    { id: '2', title: 'Audiobook production', desc: 'Expressive narration with multiple voices.' },
  ];

  return (
    <section id="cases" className="w-full px-6 mb-12">
      <div className="max-w-6xl mx-auto p-8 border-l border-r border-border">
        <SectionHeader>
          <h2 className="text-3xl font-medium text-center">Case Studies & Videos</h2>
          <p className="text-muted-foreground text-center">Real-world use cases and walkthroughs.</p>
        </SectionHeader>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {studies.map((s) => (
            <div key={s.id} className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold">{s.title}</h4>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
