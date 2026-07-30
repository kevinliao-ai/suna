const defaultSiteUrl = 'https://www.anisora.ai';

export const siteConfig = {
  name: 'AniSora Studio',
  title: 'AniSora Studio — AI Anime Video & Voice Workspace',
  description:
    'An independent creative workspace for AI anime video, voice generation, and media utilities.',
  keywords: [
    'AniSora Studio',
    'AI anime video',
    'AI video workspace',
    'anime voice generator',
    'IndexTTS',
    'Sora watermark remover',
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
  siteName: 'AniSora Studio',
  locale: 'en_US',
} as const;

export type SiteConfig = typeof siteConfig;
