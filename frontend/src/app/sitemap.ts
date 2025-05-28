import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

// 确保基础 URL 以 / 结尾
const baseUrl = siteConfig.url.endsWith('/') 
  ? siteConfig.url.slice(0, -1) 
  : siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  
  // 定义网站的主要路由
  const routes = [
    '',
    'about',
    'features',
    'pricing',
    'blog',
    'docs',
    'contact',
  ];

  // 生成 sitemap 条目
  const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => {
    // 移除路径中可能存在的重复斜杠
    const path = route.startsWith('/') ? route.slice(1) : route;
    const url = path ? `${baseUrl}/${path}` : baseUrl;
    
    return {
      url,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1.0 : 0.8,
    };
  });

  return sitemapEntries;
}

// 确保这是一个动态路由
// 这行注释告诉 Next.js 不要静态生成此路由
export const dynamic = 'force-dynamic';
