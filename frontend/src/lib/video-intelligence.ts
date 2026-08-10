export type VideoModelStatus = 'active' | 'legacy' | 'watchlist';
export type VideoModelAccess = 'consumer' | 'api' | 'open-source' | 'mixed';

export interface VideoModelProfile {
  slug: string;
  name: string;
  provider: string;
  status: VideoModelStatus;
  access: VideoModelAccess;
  officialUrl: string;
  summary: string;
  bestFor: string[];
  watchouts: string[];
  inputs: string[];
  outputs: string[];
  planningCost: number;
  planningSpeed: number;
  planningQuality: number;
  planningControl: number;
}

export const videoModels: VideoModelProfile[] = [
  {
    slug: 'runway-gen-4',
    name: 'Gen-4 / Gen-4 Turbo',
    provider: 'Runway',
    status: 'active',
    access: 'consumer',
    officialUrl: 'https://runwayml.com/research/introducing-runway-gen-4',
    summary:
      'A polished creator workflow for image-led video generation, iteration, and visual consistency across shots.',
    bestFor: ['Character and object consistency', 'Fast creative iteration', 'Social and ad concepts'],
    watchouts: ['Credit usage changes by model and duration', 'Some modes require an input image'],
    inputs: ['Text', 'Image reference'],
    outputs: ['5s clip', '10s clip'],
    planningCost: 3,
    planningSpeed: 4,
    planningQuality: 4,
    planningControl: 4,
  },
  {
    slug: 'google-veo',
    name: 'Veo',
    provider: 'Google DeepMind',
    status: 'active',
    access: 'mixed',
    officialUrl: 'https://deepmind.google/technologies/veo/',
    summary:
      'A high-end video model family positioned for cinematic realism, audio-aware generation, and filmmaker workflows.',
    bestFor: ['Realistic motion', 'Cinematic scenes', 'Narrative tests'],
    watchouts: ['Access and capabilities vary by Google product surface', 'Production pricing must be verified before launch'],
    inputs: ['Text', 'Image reference'],
    outputs: ['Video', 'Video with audio in supported surfaces'],
    planningCost: 4,
    planningSpeed: 3,
    planningQuality: 5,
    planningControl: 4,
  },
  {
    slug: 'luma-ray',
    name: 'Ray',
    provider: 'Luma AI',
    status: 'active',
    access: 'mixed',
    officialUrl: 'https://lumalabs.ai/ray',
    summary:
      'A production-oriented model line for keyframes, video modification, 1080p delivery, and multi-format creative workflows.',
    bestFor: ['Keyframe direction', 'Video-to-video changes', 'Marketing variants'],
    watchouts: ['Credit estimates depend on resolution, HDR, and mode', 'Higher fidelity modes can change budget quickly'],
    inputs: ['Text', 'Image', 'Video'],
    outputs: ['Video', 'HDR/EXR in supported workflows'],
    planningCost: 4,
    planningSpeed: 3,
    planningQuality: 5,
    planningControl: 5,
  },
  {
    slug: 'kling-ai',
    name: 'Kling',
    provider: 'Kuaishou',
    status: 'active',
    access: 'mixed',
    officialUrl: 'https://kling.ai/',
    summary:
      'A broad creative suite for video, image, sound, and effects with strong consumer creator positioning.',
    bestFor: ['Creator experiments', 'Image-to-video', 'All-in-one AI media work'],
    watchouts: ['Regional access and pricing can differ', 'Output rights should be checked per plan'],
    inputs: ['Text', 'Image', 'Multi-modal prompts'],
    outputs: ['Video', 'Image', 'Sound in supported tools'],
    planningCost: 3,
    planningSpeed: 4,
    planningQuality: 4,
    planningControl: 3,
  },
  {
    slug: 'wan-video',
    name: 'Wan Video',
    provider: 'Alibaba Cloud / Wan',
    status: 'active',
    access: 'api',
    officialUrl: 'https://www.alibabacloud.com/help/en/model-studio/use-video-generation',
    summary:
      'A developer-facing model family covering text-to-video, image-to-video, reference-to-video, and video editing scenarios.',
    bestFor: ['API experiments', 'Regional deployment planning', 'Workflow automation'],
    watchouts: ['Model availability varies by region', 'Service scope must match user geography and compliance needs'],
    inputs: ['Text', 'Image', 'Reference media'],
    outputs: ['Video', 'Edited video'],
    planningCost: 2,
    planningSpeed: 3,
    planningQuality: 4,
    planningControl: 4,
  },
  {
    slug: 'sora-legacy',
    name: 'Sora',
    provider: 'OpenAI',
    status: 'legacy',
    access: 'consumer',
    officialUrl: 'https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation',
    summary:
      'An important reference point for text-to-video quality and user expectations, but not a stable integration target for AniSora now.',
    bestFor: ['Historical benchmarking', 'Prompt pattern research', 'Market education'],
    watchouts: ['The Sora web and app experience has been discontinued', 'Do not build AniSora around this as an active provider'],
    inputs: ['Text', 'Image in prior surfaces'],
    outputs: ['Video in prior surfaces'],
    planningCost: 5,
    planningSpeed: 2,
    planningQuality: 4,
    planningControl: 3,
  },
];

export const videoModelUseCases = [
  {
    title: 'Anime scene previsualization',
    description: 'Compare which model should turn script beats, character references, and camera notes into short animatic clips.',
  },
  {
    title: 'Short-form ad variants',
    description: 'Estimate how many creator-ready clips a campaign can test before moving into higher-fidelity production.',
  },
  {
    title: 'Creator workflow selection',
    description: 'Help creators choose between embedded tools, API providers, and open-source experiments without guessing blindly.',
  },
];

export function getActiveVideoModels() {
  return videoModels.filter((model) => model.status === 'active');
}

export function estimateVideoBudget({
  clips,
  secondsPerClip,
  qualityMultiplier,
}: {
  clips: number;
  secondsPerClip: number;
  qualityMultiplier: number;
}) {
  const activeModels = getActiveVideoModels();
  const normalizedSeconds = Math.max(1, clips) * Math.max(1, secondsPerClip);

  return activeModels.map((model) => {
    const effortMultiplier = 1 + model.planningCost * 0.28;
    const estimatedCredits = Math.ceil(normalizedSeconds * effortMultiplier * qualityMultiplier);

    return {
      slug: model.slug,
      name: model.name,
      provider: model.provider,
      estimatedCredits,
      fitScore:
        model.planningQuality * 2 + model.planningControl + model.planningSpeed - model.planningCost,
    };
  });
}
