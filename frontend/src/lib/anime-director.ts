export type ShotPriority = 'speed' | 'cost' | 'quality' | 'control';

export interface AnimeDirectorShot {
  id: string;
  title: string;
  beat: string;
  durationSeconds: number;
  camera: string;
  visualPrompt: string;
  voicePrompt: string;
  route: string;
  checklist: string[];
}

export interface AnimeDirectorPlan {
  title: string;
  priority: ShotPriority;
  estimatedSeconds: number;
  estimatedTestRenders: number;
  shots: AnimeDirectorShot[];
}

export interface DirectorShotSeed {
  camera: string;
  durationSeconds: number;
  visualPrompt: string;
  checklist?: string[];
}

const cameraMoves = [
  'slow push-in on the character expression',
  'side tracking shot with layered background parallax',
  'static close-up with subtle hair and cloth motion',
  'wide establishing shot with atmospheric movement',
  'over-the-shoulder dialogue composition',
  'low-angle action framing with motion streaks',
];

const routeByPriority: Record<ShotPriority, string> = {
  speed: 'Fast draft route: use a creator-facing video tool for quick shot blocking.',
  cost: 'Low-cost route: generate short drafts first, then upscale only usable shots.',
  quality: 'Quality route: use reference images and rerun fewer, higher-fidelity candidates.',
  control: 'Control route: lock character references and use keyframe or image-to-video workflows.',
};

function splitScript(script: string) {
  return script
    .split(/\n+|(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function sentenceCase(value: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'Untitled shot';
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
}

function makeShotTitle(beat: string, index: number) {
  const shortBeat = beat.replace(/[.!?]+$/, '').slice(0, 48);
  return `Shot ${index + 1}: ${sentenceCase(shortBeat)}`;
}

function estimateDuration(beat: string) {
  const wordCount = beat.split(/\s+/).filter(Boolean).length;
  return Math.min(8, Math.max(3, Math.ceil(wordCount / 5)));
}

export function createAnimeDirectorPlan({
  script,
  projectTitle,
  style,
  priority,
  seedShot,
}: {
  script: string;
  projectTitle?: string;
  style?: string;
  priority: ShotPriority;
  seedShot?: DirectorShotSeed;
}): AnimeDirectorPlan {
  const beats = splitScript(script);
  const safeBeats = beats.length > 0 ? beats : ['A character enters a quiet anime scene and notices a dramatic change.'];
  const visualStyle = style?.trim() || 'cinematic anime, clean character design, expressive lighting';
  const shots = safeBeats.map((beat, index) => {
    const seeded = index === 0 ? seedShot : undefined;
    const camera = seeded?.camera || cameraMoves[index % cameraMoves.length];
    const durationSeconds = seeded?.durationSeconds || estimateDuration(beat);

    return {
      id: `shot-${index + 1}`,
      title: makeShotTitle(beat, index),
      beat,
      durationSeconds,
      camera,
      visualPrompt:
        seeded?.visualPrompt
        || `${visualStyle}. ${beat}. ${camera}. Keep character identity consistent and preserve readable composition.`,
      voicePrompt: `Voice direction for ${makeShotTitle(beat, index)}: natural anime performance, clear emotion, timing around ${durationSeconds} seconds.`,
      route: routeByPriority[priority],
      checklist: [
        ...(seeded?.checklist || []),
        'Attach character or scene reference before generation.',
        'Run a short draft before spending on final quality.',
        'Save usable output link back into AniSora Studio assets.',
      ],
    } satisfies AnimeDirectorShot;
  });

  return {
    title: projectTitle?.trim() || 'Untitled anime scene',
    priority,
    estimatedSeconds: shots.reduce((total, shot) => total + shot.durationSeconds, 0),
    estimatedTestRenders: shots.length * (priority === 'quality' || priority === 'control' ? 3 : 2),
    shots,
  };
}

export function serializeDirectorPlan(plan: AnimeDirectorPlan) {
  return JSON.stringify(
    {
      product: 'anisora-anime-director',
      version: 1,
      exportedAt: new Date().toISOString(),
      plan,
    },
    null,
    2,
  );
}
