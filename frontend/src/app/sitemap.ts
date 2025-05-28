import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

// 确保基础 URL 格式正确
const baseUrl = siteConfig.url.endsWith('/') 
  ? siteConfig.url.slice(0, -1) 
  : siteConfig.url;

// 支持的语言
const locales = siteConfig.locales || ['en'];

// 网站主要路由
const routes = [
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: 'features', priority: 0.9, changefreq: 'weekly' },
  { path: 'pricing', priority: 0.8, changefreq: 'monthly' },
  { path: 'blog', priority: 0.7, changefreq: 'daily' },
  { path: 'docs', priority: 0.9, changefreq: 'weekly' },
  { path: 'tutorials', priority: 0.8, changefreq: 'weekly' },
  { path: 'community', priority: 0.7, changefreq: 'weekly' },
  { path: 'download', priority: 0.9, changefreq: 'monthly' },
  { path: 'changelog', priority: 0.6, changefreq: 'weekly' },
  { path: 'privacy', priority: 0.3, changefreq: 'yearly' },
  { path: 'terms', priority: 0.3, changefreq: 'yearly' },
];

// 博客文章示例 (实际应从CMS或API获取)
const blogPosts = [
  { slug: 'getting-started', date: '2024-05-01' },
  { slug: 'advanced-features', date: '2024-05-15' },
  { slug: 'case-studies', date: '2024-06-01' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 为每种语言生成路由
  locales.forEach((locale) => {
    const langPrefix = locale === siteConfig.defaultLocale ? '' : `/${locale}`;
    
    // 添加主路由
    routes.forEach((route) => {
      const path = route.path ? `/${route.path}` : '';
      const url = `${baseUrl}${langPrefix}${path}`;
      
      sitemapEntries.push({
        url,
        lastModified: now,
        changeFrequency: route.changefreq as any,
        priority: route.priority,
      });
    });

    // 添加博客文章
    blogPosts.forEach((post) => {
      const url = `${baseUrl}${langPrefix}/blog/${post.slug}`;
      sitemapEntries.push({
        url,
        lastModified: post.date,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  });

  // 添加其他重要页面
  const additionalPages = [
    { path: '/sitemap.xml', priority: 0.5 },
    { path: '/robots.txt', priority: 0.5 },
  ];

  additionalPages.forEach((page) => {
    sitemapEntries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: page.priority,
    });
  });

  // 按优先级排序
  return sitemapEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

// 确保这是一个动态路由
export const dynamic = 'force-dynamic';

// 设置重新验证时间 (24小时)
export const revalidate = 86400; // 24 hours in seconds
