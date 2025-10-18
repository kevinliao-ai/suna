import { SectionHeader } from '@/components/home/section-header';

export function IndexTTSCapabilities() {
  const cards = [
    { id: 'a', title: 'Frontend & Text preprocessing', desc: 'Normalization, tokenization and optional G2P.' },
    { id: 'b', title: 'Acoustic models', desc: 'Mel-spectrogram or neural feature generators.' },
    { id: 'c', title: 'Vocoder & waveform synthesis', desc: 'HiFi-GAN compatible vocoders for quality audio.' },
  ];

  return (
    <section id="capabilities" className="w-full px-6 mb-12">
      <div className="max-w-6xl mx-auto p-8">
        <SectionHeader>
          <h2 className="text-3xl font-medium text-center">Models & Architecture</h2>
          <p className="text-muted-foreground text-center">Component-level overview of the TTS pipeline.</p>
        </SectionHeader>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div key={c.id} className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold">{c.title}</h4>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
