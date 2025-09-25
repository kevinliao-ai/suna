import { ChangelogData } from '../sections/changelog';

export const changeLogData: ChangelogData[] = [
  {
    version: 'Anisora V3',
    date: '27th August 2025',
    title: '🔥 Anisora V3 Released Under Apache 2.0',
    description:
      'Anisora V3 is now available under the permissive Apache 2.0 license, bringing powerful new capabilities to video generation.',
    items: [
      'Supports arbitrary-frame inference for flexible video generation',
      'Enables character 3D video generation with natural motion',
      'Video style transfer capabilities for artistic transformations',
      'Multimodal guidance for enhanced control',
      'Ultra-Low-Resolution Video Super-Resolution',
      'Generates 5-second 360p video clips in under 8 seconds',
    ],
    image: 'https://cdn.anisora.ai/anisora-logo.png',
  },
  {
    version: 'AniMe Research',
    date: '27th August 2025',
    title: '🔥 AniMe Research Paper Submitted',
    description:
      'We have submitted our work on agent-related research AniMe to arXiv. Stay tuned for further updates!',
    items: [],
    button: {
      url: 'https://arxiv.org/',
      text: 'View on arXiv',
    },
  },
  {
    version: 'Anisora V2',
    date: '11th July 2025',
    title: 'Anisora V2 Released',
    description:
      'Anisora V2 weights are now licensed under Apache 2.0 and publicly available for download on ModelScope and Hugging Face.',
    items: [],
    button: {
      url: 'https://github.com/bilibili/Index-anisora',
      text: 'Download V2',
    },
  },
  {
    version: 'Bug Fix',
    date: '10th July 2025',
    title: 'Anisora V1 Bug Fix',
    description:
      'Fixed Anisora V1 inference bug that was causing video artifacts.',
    items: [],
  },
  {
    version: 'Anisora V3 Preview',
    date: '2nd July 2025',
    title: '🔥 Anisora V3 Preview Update',
    description:
      'Anisora V3 Preview is updated, with new progress to be shared at Siggraph on July 11th.',
    items: [],
  },
  {
    version: 'Open Source',
    date: '12th May 2025',
    title: '🔥 Fully Open Source',
    description: 'All our work is now open source. Check it out!',
    button: {
      url: 'https://github.com/bilibili/Index-anisora',
      text: 'View on GitHub',
    },
  },
  {
    version: 'IJCAI25',
    date: '10th May 2025',
    title: 'Paper Accepted by IJCAI25',
    description:
      'Our paper has been accepted by IJCAI25. Camera ready version has been updated.',
    items: [],
  },
  {
    version: 'Initial Release',
    date: '19th December 2024',
    title: 'Project Launch',
    description:
      'Submitted our paper to arXiv and released the project with evaluation benchmark.',
    items: [],
  },
];
