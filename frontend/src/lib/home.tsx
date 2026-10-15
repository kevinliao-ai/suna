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
      'Turn a script or reference image into anime shots, generate short AI video clips, and keep characters consistent in one independent studio.',
  },
  faqSection: {
    title: 'Frequently Asked Questions',
    description:
      'How AniSora Studio works, which models it uses, and what to expect from generation credits.',
    faQitems: [
      {
        id: 1,
        question: 'What is AniSora Studio?',
        answer:
          'AniSora Studio is an independent web interface that brings together anime video generation and speech tools. It is not the official website of Bilibili or the maintainers of the embedded services.',
      },
      {
        id: 2,
        question: 'Is AniSora Studio the official AniSora V3 model?',
        answer:
          'No. AniSora, including the AniSora V3, V3.1 and V3.2 weights (sometimes searched as Anizora or Ani Sora), is an open-source anime video model released by Bilibili in the Index-anisora repository. AniSora Studio is a separate, independent workspace.',
      },
      {
        id: 3,
        question: 'Which models does AniSora Studio use to generate video?',
        answer:
          'Anime Director currently creates a reference frame with FLUX.1 [schnell] and animates it into a 5-second clip with Kling 2.1 image-to-video through fal. The credit cost of each request is shown before you confirm it.',
      },
      {
        id: 4,
        question: 'How do generation credits work?',
        answer:
          'Studio Pro includes 200 generation credits for each billing month, including monthly refills on annual plans. Credits are reserved when a request starts, and requests rejected by the provider return their reserved credits.',
      },
      {
        id: 5,
        question: 'Why do the tools run inside AniSora Studio?',
        answer:
          'Anime Director is a native AniSora workflow for shot planning, generation, continuity, and rough cuts. Selected voice tools remain embedded so projects, tasks, and asset references stay in one focused workspace.',
      },
      {
        id: 6,
        question: 'Is a generated result guaranteed to be available?',
        answer:
          'No. Video generation still depends on configured model providers, capacity, credits, and safety checks. Embedded voice demos are operated by their respective providers and may also change without notice.',
      },
      {
        id: 7,
        question: 'Can I use generated content commercially?',
        answer:
          'Commercial rights depend on the model, provider, source material and applicable law. Review the relevant model and provider terms before commercial use.',
      },
      {
        id: 8,
        question: 'Does AniSora Studio store my prompts or media?',
        answer:
          'Authentication and AniSora project records are handled through Supabase. Native Anime Director requests use AniSora server APIs and configured generation/storage providers. Information entered in an embedded voice tool is processed by that external provider under its own terms.',
      },
      {
        id: 9,
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
      title: 'AniSora',
      links: [
        { id: 1, title: 'Index-AniSora', url: '/index-anisora' },
        { id: 2, title: 'AniSora V3 & V3.1', url: '/anisora-v3' },
        { id: 3, title: 'AniSora V3.2', url: '/anisora-v3-2' },
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
