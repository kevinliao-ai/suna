const defaultSiteUrl = 'https://www.anisora.ai';

export const siteConfig = {
  name: 'AniSora Studio',
  title: 'AniSora AI Studio – Anime Video Generator & Shot Planner',
  description:
    'Generate AI anime video clips from scripts and reference images, plan every shot and keep characters consistent. Independent studio, not affiliated with Bilibili.',
  keywords: [
    'AniSora',
    'AniSora AI',
    'AniSora V3',
    'AniSora Studio',
    'AI anime video generator',
    'anime image to video',
    'anime shot planner',
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
  siteName: 'AniSora Studio',
  locale: 'en_US',
} as const;

export type SiteConfig = typeof siteConfig;
