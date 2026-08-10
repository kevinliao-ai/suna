import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

const lastModified = new Date('2026-08-10T00:00:00.000Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
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

