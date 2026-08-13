import Script from 'next/script';
import { siteConfig } from '@/lib/site';

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
  data?: Record<string, unknown>;
}

export function StructuredData({
  type = 'website',
  breadcrumbs,
  faq,
  data,
}: StructuredDataProps) {
  if (data) {
    return (
      <Script
        id="structured-data-custom"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  }

  const schemas: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': type === 'tool' ? 'WebApplication' : 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      ...(type === 'tool'
        ? {
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Any',
          }
        : {}),
    },
  ];

  if (breadcrumbs?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  if (faq?.length) {
    schemas.push({
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
    });
  }

  const graph = schemas.map((schema) =>
    Object.fromEntries(
      Object.entries(schema).filter(([key]) => key !== '@context'),
    ),
  );

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          schemas.length === 1
            ? schemas[0]
            : { '@context': 'https://schema.org', '@graph': graph },
        ),
      }}
    />
  );
}
