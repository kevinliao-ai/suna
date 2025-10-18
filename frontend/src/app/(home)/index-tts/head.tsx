export default function Head() {
  const title = 'Index‑TTS — Open-source high-fidelity text-to-speech (Index‑TTS2)';
  const description = 'Index‑TTS2: modular, open-source TTS for multi-speaker, high-fidelity synthesis. Explore demos, models, training recipes and inference examples.';
  const keywords = [
    'Index-TTS',
    'Index TTS',
    'Index-TTS2',
    'open source TTS',
    'text to speech',
    'multi-speaker TTS',
    'high-fidelity speech synthesis',
    'neural vocoder',
    'HiFi-GAN',
    'TTS models',
    'speech synthesis research',
    'TTS inference',
    'TTS training recipes',
    'real-time TTS',
    'low-latency TTS',
  ].join(', ');

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Index‑TTS" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {/* Optional: replace with a real image URL for better social previews */}
      <meta property="og:image" content="https://cdn.anisora.ai/index-tts2/index-tts-social.png" />
      <meta name="twitter:image" content="https://cdn.anisora.ai/index-tts2/index-tts-social.png" />
    </>
  );
}
