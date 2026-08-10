import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';
import { videoModelComparisons, videoModels } from '@/lib/video-intelligence';

const lastModified = new Date('2026-08-10T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/models', priority: 0.85, changeFrequency: 'weekly' as const },
    ...videoModels.map((model) => ({
      path: `/models/${model.slug}`,
      priority: model.status === 'active' ? 0.78 : 0.55,
      changeFrequency: 'weekly' as const,
    })),
    ...videoModelComparisons.map((comparison) => ({
      path: `/compare/${comparison.slug}`,
      priority: 0.76,
      changeFrequency: 'weekly' as const,
    })),
    {
      path: '/video-cost-calculator',
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    },
    { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/index-tts', priority: 0.7, changeFrequency: 'monthly' as const },
    {
      path: '/sora-watermark-remove',
      priority: 0.5,
      changeFrequency: 'monthly' as const,
    },
    { path: '/legal', priority: 0.2, changeFrequency: 'yearly' as const },
  ];

  return routes.map((route) => ({
    url: new URL(route.path, siteConfig.url).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

