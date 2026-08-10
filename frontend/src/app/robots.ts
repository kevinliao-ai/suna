import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Auth and Studio pages are intentionally crawlable: their own metadata
      // returns noindex, which lets search engines remove already-discovered
      // URLs. API and operational endpoints never need crawling.
      disallow: ['/api/', '/monitoring/'],
    },
    sitemap: new URL('/sitemap.xml', siteConfig.url).toString(),
    host: siteConfig.url,
  };
}

