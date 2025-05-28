export const siteConfig = {
  // Basic Information
  name: 'AniSora',
  title: 'AniSora: The Ultimate Open-Source Anime Video Generation Model',
  description: 'AniSora is a powerful open-source AI model for creating high-quality anime-style videos. Generate stunning animations, character movements, and dynamic scenes with cutting-edge AI technology.',
  keywords: [
    'AniSora',
    'Anime Video Generation',
    'Open Source AI',
    'AI Animation',
    'Anime Creator',
    'Text to Anime Video',
    'AI Video Generation',
    'Anime AI Model',
    'Character Animation',
    'Bilibili AI',
    'Open Source Animation',
    'AI Video Creator',
    'Anime Style Transfer'
  ],
  url: 'https://www.anisora.ai',
  siteName: 'AniSora AI - Open Source Anime Video Generation',
  locale: 'en_US',
  themeColor: '#FF4D4F',
  backgroundColor: '#1A1A1A',
  
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
    canonical: 'https://www.anisora.ai/',
    author: 'AniSora Team',
    publisher: 'AniSora',
    copyright: `© ${new Date().getFullYear()} AniSora. All rights reserved.`,
    rating: 'general',
    revisitAfter: '7 days',
  },

};

export type SiteConfig = typeof siteConfig;
