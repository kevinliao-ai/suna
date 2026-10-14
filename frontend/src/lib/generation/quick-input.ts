import { getDirectorRoute } from '../anime-director.ts';

// Vercel functions reject request bodies above 4.5 MB.
export const quickGenerationImageLimit = 3 * 1024 * 1024;
export const quickGenerationPromptLimit = 2000;
export const quickGenerationShotId = 'shot-1';
export const quickGenerationInputBucket = 'anisora-generation-inputs';

const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function normalizeQuickGenerationPrompt(value: unknown) {
  if (typeof value !== 'string') return null;
  const prompt = value.trim();
  return prompt.length >= 10 && prompt.length <= quickGenerationPromptLimit
    ? prompt
    : null;
}

export function createQuickGenerationProjectSettings(prompt: string) {
  const title = `Quick video: ${prompt.replace(/\s+/g, ' ').slice(0, 60)}`;
  const shot = {
    id: quickGenerationShotId,
    title: 'Shot 1: Uploaded reference',
    beat: prompt,
    durationSeconds: 5,
    camera: 'image-to-video from the uploaded reference',
    visualPrompt: prompt,
    voicePrompt: '',
    route: getDirectorRoute('control'),
    checklist: [
      'Compare the result with the uploaded reference.',
      'Generate a Director reference frame to create more versions.',
    ],
  };

  return {
    name: title,
    settings: {
      product: 'anisora-anime-director-plan',
      version: 1,
      director: {
        title,
        style: '',
        script: prompt,
        priority: 'control',
        plan: {
          title,
          priority: 'control',
          estimatedSeconds: shot.durationSeconds,
          estimatedTestRenders: 1,
          shots: [shot],
        },
      },
    },
  };
}

export function readQuickGenerationImageType(
  contentType: string,
  bytes: Uint8Array,
) {
  if (bytes.byteLength === 0 || bytes.byteLength > quickGenerationImageLimit) {
    return null;
  }

  if (
    contentType === 'image/jpeg' &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return imageExtensions[contentType];
  }

  if (
    contentType === 'image/png' &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return imageExtensions[contentType];
  }

  if (
    contentType === 'image/webp' &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return imageExtensions[contentType];
  }

  return null;
}