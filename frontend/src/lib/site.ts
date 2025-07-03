// 语言包
const messages = {
  en: {
    // 基础信息
    name: 'AniSora',
    title: 'AniSora: Open Source Anime Video Generation Model | High-quality AI Animation Tool',
    description: 'AniSora is a powerful open-source AI model for creating high-quality anime-style videos. Generate stunning animations, character movements, and dynamic scenes using cutting-edge AI technology. Free, open-source, and self-hostable.',
    
    // 关键词
    keywords: [
      // 主关键词
      'AniSora',  'free video ai generator', 'text to video', 'Anime Video Generation', 'image to video', 'AI Animation Tool', 'Open Source AI Video',
      // 长尾关键词
      'ai video generator for free', 'image to video ai free', 'AI Anime Creation', 'best ai video generator', 'Text to Animation', 'Character Animation AI', 'Anime Style Transfer',
      'Free AI Video Tool', 'Self-hosted AI Video', 'Bilibili AI Tool', 'Anime AI Generation','ai kissing generator free', 'ai baby videos'
    ],
    
    // 网站基础信息
    siteName: 'AniSora AI - Open Source Anime Video Generation Tool',
    
    // 社交媒体
    social: {
      openGraph: {
        title: 'AniSora: Open Source Anime Video Generation Model',
        description: 'Free and open-source AI anime video generation tool supporting text-to-animation, character motion generation, and more',
        alt: 'AniSora - Open Source AI Anime Video Generation Tool',
      },
    },
    
    // 版权信息
    copyright: `© ${new Date().getFullYear()} Bilibili Inc. All rights reserved.`,
    
    // 结构化数据
    structuredData: {
      description: 'Open Source AI Anime Video Generation Tool',
    },
  },
  zh: {
    // 基础信息
    name: 'AniSora',
    title: 'AniSora: 开源的动漫视频生成模型 | 高质量AI动画生成工具',
    description: 'AniSora 是一个强大的开源AI模型，用于创建高质量的动漫风格视频。利用最先进的AI技术生成惊艳的动画、角色动作和动态场景。免费、开源、可自托管。',
    
    // 关键词
    keywords: [
      // 主关键词
      'AniSora', '动漫视频生成', 'AI动画生成', '开源AI视频', '免费视频ai生成器', '文生视频', '图转视频', 'AI动画工具', '开源AI视频', 'B站AI工具', '二次元AI生成', 'AI动漫制作', '文本生成动画', '角色动画AI', '动漫风格转换',
      // 长尾关键词
      '开源视频模型', '免费视频ai生成器', 'AI动漫制作', '文本生成动画', '角色动画AI', '动漫风格转换',
      '免费AI视频工具', '自托管AI视频', 'B站AI工具', '二次元AI生成'
    ],
    
    // 网站基础信息
    siteName: 'AniSora AI - 开源动漫视频生成工具',
    
    // 社交媒体
    social: {
      openGraph: {
        title: 'AniSora: 开源的动漫视频生成模型',
        description: '免费开源的AI动漫视频生成工具，支持文本生成动画、角色动作生成等功能',
        alt: 'AniSora - 开源AI动漫视频生成工具',
      },
    },
    
    // 版权信息
    copyright: `© ${new Date().getFullYear()} 哔哩哔哩 版权所有`,
    
    // 结构化数据
    structuredData: {
      description: '开源的AI动漫视频生成工具',
    },
  },
} as const;

// 获取当前语言配置
export const getSiteConfig = (locale: 'en' | 'zh' = 'en') => {
  const t = messages[locale] || messages.en;
  
  return {
    // 基础信息
    name: t.name,
    title: t.title,
    description: t.description,
    
    // 多语言支持
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    
    // 关键词
    keywords: t.keywords,
    
    // 网站基础信息
    url: 'https://www.anisora.ai',
    siteName: t.siteName,
    locale,
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
        locale,
        url: 'https://www.anisora.ai/',
        title: t.social.openGraph.title,
        description: t.social.openGraph.description,
        siteName: t.siteName,
        images: [
          {
            url: '/images/og-image.jpg',
            width: 1200,
            height: 630,
            alt: t.social.openGraph.alt,
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
          'en': 'https://www.anisora.ai/en',
          'zh': 'https://www.anisora.ai/zh',
        },
      },
      
      // 版权信息
      authors: [
        { name: 'AniSora Team' },
        { name: 'Bilibili', url: 'https://www.bilibili.com' },
      ],
      publisher: 'Bilibili',
      copyright: t.copyright,
      
      // 内容分级
      rating: 'general',
      
      // 其他元数据
      applicationName: t.siteName,
      generator: 'Next.js',
      referrer: 'origin-when-cross-origin',
      keywords: t.keywords,
      
      // 社交媒体卡片
      twitter: {
        card: 'summary_large_image',
        title: t.social.openGraph.title,
        description: t.social.openGraph.description,
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
      name: t.name,
      applicationCategory: 'Multimedia',
      operatingSystem: 'Web, Windows, macOS, Linux',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: t.structuredData.description,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1024',
      },
    },
  };
};

export type SiteConfig = ReturnType<typeof getSiteConfig>;

// 默认导出英文配置以保持向后兼容
export const siteConfig = getSiteConfig('en');
