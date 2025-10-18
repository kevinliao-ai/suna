import { SectionHeader } from '@/components/home/section-header';
import { siteConfig } from '@/lib/home';

export function IndexTTSFeatures() {
  // Placeholder items; replace with Index-TTS specific points
  const items = [
    { id: '1', title: 'Multi-speaker modeling', desc: 'Train and synthesize many voices with speaker embeddings.' },
    { id: '2', title: 'High-fidelity vocoders', desc: 'Support for HiFi-GAN-like vocoders for natural audio.' },
    { id: '3', title: 'Low-latency inference', desc: 'Optimized pipelines for real-time and batch use-cases.' },
  ];

  return (
    <section id="features" className="flex flex-col items-center justify-center gap-5 w-full relative px-6">
      <SectionHeader>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance">Features</h2>
        <p className="text-muted-foreground text-center text-balance font-medium">Core capabilities that make Index‑TTS suitable for research and production.</p>
      </SectionHeader>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {items.map((it) => (
          <div key={it.id} className="p-6 border border-border rounded-lg">
            <h4 className="font-semibold text-lg">{it.title}</h4>
            <p className="text-sm text-muted-foreground mt-2">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
