import { SectionHeader } from '@/components/home/section-header';
import Link from 'next/link';

export function IndexTTSOpenSource() {
  return (
    <section id="open-source" className="flex flex-col items-center justify-center w-full relative">
      <div className="w-full max-w-6xl mx-auto px-6">
        <SectionHeader>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance pb-1">
            100% Open Source
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            Index‑TTS is fully open-source. Explore the code, models and demos — contribute or run locally.
          </p>
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-12">
          <div className="rounded-xl bg-[#F3F4F6] dark:bg-[#F9FAFB]/[0.02] border border-border p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 text-primary font-medium">
                <span>Index‑TTS</span>
              </div>
              <div className="relative">
                <h3 className="text-2xl font-semibold tracking-tight">Open-source TTS for research & production</h3>
                <p className="text-muted-foreground mt-2">
                  The Index‑TTS project provides modular TTS components, model implementations, and examples to reproduce high-fidelity speech synthesis.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 border-secondary/20 text-secondary">Multi-speaker</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 border-secondary/20 text-secondary">High-fidelity</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 border-secondary/20 text-secondary">Production-ready</span>
              </div>

              <Link
                href="https://github.com/index-tts/index-tts"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-10 items-center justify-center gap-2 text-sm font-medium tracking-wide rounded-full text-primary-foreground dark:text-black px-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] bg-primary dark:bg-white hover:bg-primary/90 dark:hover:bg-white/90 transition-all duration-200 w-fit"
              >
                <span>View on GitHub</span>
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-[#F3F4F6] dark:bg-[#F9FAFB]/[0.02] border border-border p-6">
            <div className="flex flex-col gap-6">
              <h3 className="text-xl md:text-2xl font-medium tracking-tight">Reproducible & extensible</h3>
              <p className="text-muted-foreground">Example training recipes, inference scripts and model weights are provided to help you reproduce results and extend the codebase.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-secondary/10 p-2 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary">
                      <path d="M12 2v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Training recipes</div>
                    <div className="text-xs text-muted-foreground">Guides and configs to reproduce model training.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-secondary/10 p-2 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary">
                      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Inference examples</div>
                    <div className="text-xs text-muted-foreground">Prebuilt scripts for synthesis and evaluation.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
