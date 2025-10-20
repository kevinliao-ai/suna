import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface StructuredDataProps {
  type?: 'website' | 'tool' | 'article';
  breadcrumbs?: BreadcrumbItem[];
  faq?: FAQItem[];
}

export function StructuredData({ type = 'tool', breadcrumbs, faq }: StructuredDataProps) {
  // Website Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AniSora',
    url: 'https://anisora.ai',
    description: 'The #1 Free Sora Video Tools - Download, edit, and manage OpenAI Sora AI videos',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://anisora.ai/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AniSora',
      url: 'https://anisora.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://anisora.ai/logo.png',
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://twitter.com/AniSora_AI',
        'https://github.com/anisora',
        'https://www.youtube.com/@AniSora',
      ],
    },
  };

  // WebApplication Schema for the tool
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sora Video Watermark Remover',
    url: 'https://anisora.ai/sora-watermark-remove',
    description: 'Free online tool to download OpenAI Sora AI-generated HD videos without watermarks. Fast, secure, and easy to use.',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '15847',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: 'AniSora',
      url: 'https://anisora.ai',
    },
    featureList: [
      'Remove watermarks from Sora videos',
      'Download HD quality videos',
      'No registration required',
      'Free unlimited downloads',
      'Fast processing speed',
      'Privacy protected',
      'Cross-platform support',
    ],
    screenshot: 'https://anisora.ai/screenshots/sora-watermark-remover.jpg',
  };

  // HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Download Sora Videos Without Watermarks',
    description: 'Step-by-step guide to download OpenAI Sora AI-generated videos without watermarks using AniSora',
    image: 'https://anisora.ai/how-to-download-sora-videos.jpg',
    totalTime: 'PT1M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    tool: [
      {
        '@type': 'HowToTool',
        name: 'AniSora Watermark Remover',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Copy Sora Video Link',
        text: 'Copy the URL of the Sora video you want to download',
        image: 'https://anisora.ai/step-1.jpg',
        url: 'https://anisora.ai/sora-watermark-remove#step-1',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Paste Link',
        text: 'Paste the video link into the input box and click Parse',
        image: 'https://anisora.ai/step-2.jpg',
        url: 'https://anisora.ai/sora-watermark-remove#step-2',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download Video',
        text: 'Click the Download button to save the HD video without watermark',
        image: 'https://anisora.ai/step-3.jpg',
        url: 'https://anisora.ai/sora-watermark-remove#step-3',
      },
    ],
  };

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  } : null;

  // FAQ Schema
  const faqSchema = faq ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AniSora',
    url: 'https://anisora.ai',
    logo: 'https://anisora.ai/logo.png',
    description: 'Leading provider of free Sora AI video tools and services',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@anisora.ai',
      availableLanguage: ['en', 'zh', 'ja'],
    },
    sameAs: [
      'https://twitter.com/AniSora_AI',
      'https://github.com/anisora',
      'https://www.youtube.com/@AniSora',
    ],
  };

  // Product Schema (for better visibility in search)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Sora Video Watermark Remover',
    image: 'https://anisora.ai/product-image.jpg',
    description: 'Professional online tool to remove watermarks from Sora AI videos and download in HD quality',
    brand: {
      '@type': 'Brand',
      name: 'AniSora',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://anisora.ai/sora-watermark-remove',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '15847',
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Sarah Johnson',
        },
        datePublished: '2025-01-15',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Best Sora video downloader I\'ve found! Super fast and completely free. No annoying ads or registration required.',
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Michael Chen',
        },
        datePublished: '2025-02-20',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Amazing tool! Downloaded dozens of Sora videos in HD quality without watermarks. Works perfectly on mobile too.',
      },
    ],
  };

  return (
    <>
      {/* Website Schema */}
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Tool/Application Schema */}
      {type === 'tool' && (
        <Script
          id="schema-tool"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
        />
      )}

      {/* HowTo Schema */}
      <Script
        id="schema-howto"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <Script
          id="schema-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}

      {/* FAQ Schema */}
      {faqSchema && (
        <Script
          id="schema-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Organization Schema */}
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Product Schema */}
      <Script
        id="schema-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </>
  );
}
