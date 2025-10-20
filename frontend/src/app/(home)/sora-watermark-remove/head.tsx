import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://anisora.ai'),
  title: {
    default: 'Sora Video Watermark Remover - Download HD Videos Without Watermarks Free | AniSora',
    template: '%s | AniSora - Sora Video Tools',
  },
  description: 'The #1 Free Sora Video Watermark Remover - Download OpenAI Sora AI-generated HD videos without watermarks in seconds. No registration, no limits, 100% free. Fast, secure & easy to use. Works on all devices.',
  keywords: [
    // Primary keywords - high search volume
    'sora video downloader',
    'sora watermark remover',
    'remove watermark from sora video',
    'download sora videos free',
    'sora video download without watermark',
    
    // Brand keywords
    'openai sora downloader',
    'sora ai video download',
    'anisora video downloader',
    
    // Long-tail keywords
    'how to download sora videos',
    'sora video downloader online free',
    'remove openai watermark from sora',
    'sora video download tool',
    'sora hd video downloader',
    'free sora video saver',
    'download sora ai videos',
    
    // Related keywords
    'ai video downloader',
    'video watermark remover online',
    'free video downloader no watermark',
    'sora video to mp4',
    'save sora videos',
    
    // Intent-based keywords
    'best sora video downloader',
    'fastest sora downloader',
    'safe sora video download',
    'private sora video downloader',
  ],
  authors: [
    { name: 'AniSora Team', url: 'https://anisora.ai' }
  ],
  creator: 'AniSora',
  publisher: 'AniSora',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://anisora.ai/sora-watermark-remove',
    siteName: 'AniSora',
    title: 'Free Sora Video Watermark Remover - Download HD Videos Without Watermarks',
    description: '🎬 The fastest way to download Sora AI videos without watermarks! Free, no registration, HD quality. Trusted by 100,000+ users worldwide. Try now!',
    images: [
      {
        url: '/og-sora-watermark-remover.jpg',
        width: 1200,
        height: 630,
        alt: 'Sora Video Watermark Remover - Free HD Download Tool',
        type: 'image/jpeg',
      },
      {
        url: '/og-sora-watermark-remover-square.jpg',
        width: 800,
        height: 800,
        alt: 'AniSora - Sora Video Tools',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AniSora_AI',
    creator: '@AniSora_AI',
    title: 'Free Sora Video Watermark Remover | Download HD Videos',
    description: '🚀 Download Sora AI videos without watermarks in seconds! Free, fast, secure. No registration required. Try it now!',
    images: ['/twitter-sora-watermark-remover.jpg'],
  },
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
  alternates: {
    canonical: 'https://anisora.ai/sora-watermark-remove',
    languages: {
      'en-US': 'https://anisora.ai/sora-watermark-remove',
      'zh-CN': 'https://anisora.ai/zh/sora-watermark-remove',
      'ja-JP': 'https://anisora.ai/ja/sora-watermark-remove',
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
  classification: 'Video Tools',
  other: {
    'google-site-verification': 'your-verification-code',
    'msvalidate.01': 'your-bing-code',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};
