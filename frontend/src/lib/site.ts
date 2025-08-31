export const siteConfig = {
  // 基础信息
  name: 'AniSora AI',
  title:
    'AniSora: 开源的动漫视频生成模型 | 高质量AI动画生成工具 | Free AI Video Generator',
  description:
    'AniSora 是一个强大的开源AI模型，用于创建高质量的动漫风格视频。利用最先进的AI技术生成惊艳的动画、角色动作和动态场景。免费、开源、可自托管。',

  // 多语言支持
  locales: ['en'],
  defaultLocale: 'en',

  // 关键词优化
  keywords: [
    // 主关键词
    'AniSora',
    '动漫视频生成',
    'AI动画生成',
    '开源AI视频',
    // 长尾关键词
    'AI动漫制作',
    '文本生成动画',
    '角色动画AI',
    '动漫风格转换',
    '免费AI视频工具',
    '自托管AI视频',
    'B站AI工具',
    '二次元AI生成',
    // 英文关键词
    'Anime Video Generation',
    'Video Generator',
    'Text to video generator',
    'AI Animation Tool',
    'Text to Anime',
    'AI Character Animation',
  ],

  // 网站基础信息
  url: 'https://www.anisora.ai',
  siteName: 'AniSora AI - 开源动漫视频生成工具 | Free AI Video Generator',
  locale: 'en',
  themeColor: '#FF4D4F',
  backgroundColor: '#1A1A1A',

  // 社交媒体配置
  social: {
    twitter: {
      card: 'summary_large_image',
      site: '@anisora_ai',
      creator: '@bilibili',
      image: '/images/og-image.jpg',
    },
    openGraph: {
      type: 'website',
      locale: 'en',
      url: 'https://www.anisora.ai/',
      title: 'AniSora: 开源的动漫视频生成模型 | Free AI Video Generator',
      description:
        '免费开源的AI动漫视频生成工具，支持文本生成动画、角色动作生成等功能',
      siteName: 'AniSora AI',
      images: [
        {
          url: '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'AniSora - 开源AI动漫视频生成工具 | Free AI Video Generator',
          type: 'image/jpeg',
        },
      ],
    },
  },

  // 外部链接
  links: {
    github: 'https://github.com/bilibili/Index-anisora',
    twitter: 'https://twitter.com/bilibili',
    bilibili: 'https://space.bilibili.com/your-channel',
    discord: 'https://discord.gg/your-invite',
    documentation: 'https://docs.anisora.ai',
  },

  // SEO 元数据
  metadata: {
    // 爬虫指令
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // 规范链接
    canonical: 'https://www.anisora.ai',
    alternates: {
      canonical: '/',
      languages: {
        'en-US': 'https://www.anisora.ai',
        // 'zh-CN': 'https://www.anisora.ai/zh',
        // 'ja-JP': 'https://www.anisora.ai/ja',
      },
    },

    // 版权信息
    authors: [
      { name: 'AniSora Team' },
      { name: 'Bilibili', url: 'https://www.bilibili.com' },
    ],
    publisher: 'Bilibili',
    copyright: `© ${new Date().getFullYear()} Bilibili Inc. All rights reserved.`,

    // 内容分级
    rating: 'general',

    // 其他元数据
    applicationName: 'AniSora AI',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    keywords: ['AI', 'Anime', 'Video Generation', 'Open Source'],

    // 社交媒体卡片
    twitter: {
      card: 'summary_large_image',
      title: 'AniSora: 开源的动漫视频生成模型',
      description: '免费开源的AI动漫视频生成工具',
      images: ['/images/og-image.jpg'],
    },

    // 结构化数据
    other: {
      'google-site-verification': 'your-google-verification-code',
      'msvalidate.01': 'your-bing-verification-code',
      'yandex-verification': 'your-yandex-verification-code',
    },
  },

  // 结构化数据 (JSON-LD)
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AniSora',
    applicationCategory: 'Multimedia',
    operatingSystem: 'Web, Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: '开源的AI动漫视频生成工具',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1024',
    },
  },
};

export type SiteConfig = typeof siteConfig;
