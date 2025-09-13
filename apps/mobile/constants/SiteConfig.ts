export const siteConfig = {
  name: "Anisora AI",
  url: "https://anisora.ai",
  description: "Anisora AI is a fully open source AI assistant that helps you accomplish real-world tasks with ease. Through natural conversation, Anisora AI becomes your digital companion for research, data analysis, and everyday challenges.",
  keywords: [
    'AI',
    'artificial intelligence',
    'browser automation',
    'web scraping',
    'file management',
    'AI assistant',
    'open source',
    'research',
    'data analysis',
  ],
  authors: [{ name: 'Anisora Team', url: 'www.anisora.ai' }],
  creator: 'Anisora Team - Adam Cohen Hillel, Marko Kraemer, Domenico Gagliardi, and Quoc Dat Le',
  publisher: 'Anisora Team - Adam Cohen Hillel, Marko Kraemer, Domenico Gagliardi, and Quoc Dat Le',
  category: 'Technology',
  applicationName: 'Anisora AI',
  twitterHandle: '@anisoraai',
  githubUrl: 'https://github.com/bilibili/Index-anisora',
  
  // Mobile-specific configurations
  bundleId: {
    // ios: 'com.kortix.suna',
    // android: 'com.kortix.suna'
  },
  
  // Theme colors
  colors: {
    primary: '#000000',
    background: '#ffffff',
    theme: '#000000'
  }
};

// React Native metadata structure (for web builds)
export const mobileMetadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  category: siteConfig.category,
  applicationName: siteConfig.applicationName,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    title: 'Anisora AI - Open Source Generalist AI Agent',
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'Anisora AI - Open Source Generalist AI Agent',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anisora AI - Open Source Generalist AI Agent',
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
    site: siteConfig.twitterHandle,
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'Anisora AI - Open Source Generalist AI Agent',
      },
    ],
  },
  icons: {
    icon: [{ url: '/favicon.png', sizes: 'any' }],
    shortcut: '/favicon.png',
  },
  alternates: {
    canonical: siteConfig.url,
  },
}; 