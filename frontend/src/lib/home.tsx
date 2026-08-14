export const siteConfig = {
  name: 'AniSora Studio',
  description:
    'An independent creative workspace for exploring anime video generation and speech tools.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.anisora.ai',
  nav: {
    links: [
      { id: 1, name: 'Home', href: '#hero' },
      { id: 2, name: 'Use Cases', href: '#showcase' },
      { id: 3, name: 'Models', href: '/models' },
      { id: 4, name: 'Recipes', href: '/recipes' },
      { id: 5, name: 'Cases', href: '/cases' },
      { id: 6, name: 'Calculator', href: '/video-cost-calculator' },
      { id: 7, name: 'Index-TTS', href: '/index-tts' },
      { id: 8, name: 'Pricing', href: '/pricing?source=navigation-link' },
    ],
  },
  hero: {
    githubUrl: 'https://github.com/bilibili/Index-anisora',
    description:
      'Explore open-source anime video generation and speech synthesis through one focused creative workspace.',
  },
  faqSection: {
    title: 'Frequently Asked Questions',
    description:
      'How the current AniSora Studio works and what to expect from the embedded tools.',
    faQitems: [
      {
        id: 1,
        question: 'What is AniSora Studio?',
        answer:
          'AniSora Studio is an independent web interface that brings together anime video generation and speech tools. It is not the official website of Bilibili or the maintainers of the embedded services.',
      },
      {
        id: 2,
        question: 'Why do the tools run inside AniSora Studio?',
        answer:
          'AniSora keeps selected third-party generation tools embedded inside the Studio so projects, tasks and asset references remain in one focused workspace.',
      },
      {
        id: 3,
        question: 'Is a generated result guaranteed to be available?',
        answer:
          'No. Embedded demos are operated by their respective providers and may be rate-limited, unavailable or changed without notice.',
      },
      {
        id: 4,
        question: 'Can I use generated content commercially?',
        answer:
          'Commercial rights depend on the model, provider, source material and applicable law. Review the relevant model and provider terms before commercial use.',
      },
      {
        id: 5,
        question: 'Does AniSora Studio store my prompts or media?',
        answer:
          'Authentication is handled through Supabase. When an embedded tool is used, prompts and media may also be processed by that external provider under its own terms.',
      },
      {
        id: 6,
        question: 'Where can I inspect the underlying open-source model?',
        answer:
          'The model repository is linked from the homepage and Studio. Ownership, licensing and technical claims belong to the respective repository maintainers.',
      },
    ],
  },
  ctaSection: {
    title: 'Create your next animated scene',
    button: {
      text: 'Enter AniSora Studio',
      href: '/auth?returnUrl=/dashboard',
    },
    subtext: 'Sign in to access the available creative tools',
  },
  footerLinks: [
    {
      title: 'AniSora Studio',
      links: [
        { id: 1, title: 'Open Studio', url: '/auth?returnUrl=/dashboard' },
        {
          id: 2,
          title: 'Model repository',
          url: 'https://github.com/bilibili/Index-anisora',
        },
        { id: 3, title: 'Pricing', url: '/pricing?source=footer' },
      ],
    },
    {
      title: 'Research',
      links: [
        { id: 1, title: 'Model directory', url: '/models' },
        { id: 2, title: 'Anime Shot Recipes', url: '/recipes' },
        { id: 3, title: 'Workflow cases', url: '/cases' },
        { id: 4, title: 'Cost calculator', url: '/video-cost-calculator' },
        { id: 5, title: 'Index-TTS', url: '/index-tts' },
        {
          id: 6,
          title: 'Watermark Tool',
          url: '/sora-watermark-remove',
        },
      ],
    },
    {
      title: 'Legal',
      links: [
        { id: 1, title: 'Privacy Policy', url: '/legal?tab=privacy' },
        { id: 2, title: 'Terms of Service', url: '/legal?tab=terms' },
      ],
    },
  ],
} as const;
