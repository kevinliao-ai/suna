export const siteConfig = {
  // Basic Information
  name: 'AniSora',
  title: 'AniSora - AI-Powered Video Generation Platform',
  description: 'AniSora is an advanced AI platform for creating high-quality animated videos with cutting-edge AI technology.',
  keywords: [
    'AI video generation',
    'animated video creator',
    'AI video maker',
    'text to video AI',
    'automated video creation',
    'AI animation tool',
    'video generation platform'
  ],
  url: 'https://anisora.ai/',
  siteName: 'AniSora AI',
  locale: 'zh_CN',
  themeColor: '#ffffff',
  backgroundColor: '#ffffff',
  
  // Social Media
  // social: {
  //   twitter: {
  //     card: 'summary_large_image',
  //     site: '@anisoraai',
  //     creator: '@anisoraai',
  //     image: '/banner.png',
  //   },
  //   openGraph: {
  //     type: 'website',
  //     locale: 'en_US',
  //     url: 'https://anisora.ai/',
  //     title: 'AniSora - AI-Powered Video Generation',
  //     description: 'Create stunning animated videos with AI in minutes',
  //     siteName: 'AniSora AI',
  //     images: [
  //       {
  //         url: '/banner.png',
  //         width: 1200,
  //         height: 630,
  //         alt: 'AniSora AI Video Generation',
  //       },
  //     ],
  //   },
  // },

  // Links
  links: {
    // twitter: 'https://x.com/anisoraai',
    // github: 'https://github.com/anisora-ai/',
    // linkedin: 'https://www.linkedin.com/company/anisora/',
  },

  // SEO Metadata
  metadata: {
    robots: 'index, follow',
    googlebot: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1',
    canonical: 'https://anisora.ai',
    author: 'AniSora Team',
    publisher: 'AniSora',
    copyright: `© ${new Date().getFullYear()} AniSora. All rights reserved.`,
    rating: 'general',
    revisitAfter: '7 days',
  },

};

export type SiteConfig = typeof siteConfig;
