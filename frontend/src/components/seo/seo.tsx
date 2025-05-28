import Head from 'next/head';
import { siteConfig } from '@/lib/site';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'book' | 'video' | 'music';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
}

export default function SEO({
  title,
  description = siteConfig.description,
  keywords = [],
  image = '/images/og-image.jpg',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  canonicalUrl,
}: SEOProps) {
  const router = useRouter();
  const currentUrl = `${siteConfig.url}${router.asPath}`;
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const pageDescription = description || siteConfig.description;
  const pageKeywords = [...new Set([...siteConfig.keywords, ...keywords])].join(', ');
  const pageImage = image.startsWith('http') ? image : `${siteConfig.url}${image}`;
  
  // 处理规范URL
  const canonical = canonicalUrl || currentUrl;
  
  // 处理 robots 指令
  const robots = [];
  if (noindex) robots.push('noindex');
  if (nofollow) robots.push('nofollow');
  const robotsContent = robots.length > 0 ? robots.join(', ') : 'index, follow';

  return (
    <Head>
      {/* 基础元标签 */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonical} />
      
      {/* 开放图谱 / Facebook */}
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={siteConfig.siteName} />
      <meta property="og:locale" content={router.locale || siteConfig.locale} />
      
      {/* Twitter 卡片 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:site" content={siteConfig.social?.twitter?.site || '@bilibili'} />
      
      {/* 文章特定元数据 */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* 其他元数据 */}
      <meta name="application-name" content={siteConfig.name} />
      <meta name="theme-color" content={siteConfig.themeColor} />
      <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteConfig.name,
            url: siteConfig.url,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteConfig.url}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </Head>
  );
}
