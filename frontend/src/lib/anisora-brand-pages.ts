export interface BrandPageFaq {
  question: string;
  answer: string;
}

export interface BrandPageSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  code?: string;
}

export interface BrandPage {
  slug: string;
  keyword: string;
  metaTitle: string;
  description: string;
  heading: string;
  intro: string;
  updatedAt: string;
  facts: Array<{ label: string; value: string }>;
  sections: BrandPageSection[];
  faq: BrandPageFaq[];
  sources: Array<{ label: string; url: string }>;
}

export const officialRepositoryUrl = 'https://github.com/bilibili/Index-anisora';

const hostedModelNote =
  'The hosted generator on AniSora Studio currently animates your image with Kling 2.1 image-to-video through fal. It does not run the open-source AniSora weights, and the model used is always disclosed before you spend credits.';

const independenceNote =
  'AniSora Studio is an independent product. The official Index-anisora GitHub repository states that it is the only official homepage of the AniSora project.';

export const brandPages: BrandPage[] = [
  {
    slug: 'anisora-v3',
    keyword: 'AniSora V3',
    metaTitle: 'AniSora V3 & V3.1: Open-Source Anime Video Model Guide',
    description:
      'What AniSora V3 and V3.1 can do, how to run the Apache-2.0 weights locally, the official prompt format, and how to try anime image-to-video online.',
    heading: 'AniSora V3 and V3.1: features, setup, and prompts',
    intro:
      'AniSora V3 is the third generation of Bilibili\u2019s open-source anime video model. Its weights were opened under Apache-2.0 on 27 August 2025, and V3.1 followed on 4 September 2025 with a wider motion range. This guide summarizes what the official repository documents and how to start.',
    updatedAt: '2026-10-15',
    facts: [
      { label: 'Developer', value: 'Bilibili Index team' },
      { label: 'License', value: 'Apache-2.0' },
      { label: 'V3 weights', value: '27 Aug 2025' },
      { label: 'V3.1 weights', value: '4 Sep 2025' },
      { label: 'Base model', value: 'Wan2.1 image-to-video 14B' },
      { label: 'Default clip', value: '81 frames at 16 fps (about 5 s)' },
    ],
    sections: [
      {
        heading: 'What AniSora V3 adds',
        bullets: [
          'Arbitrary-frame inference: guide a clip with an image placed at the first, middle, or last frame.',
          'Character 3D video generation: turn a front-facing character illustration into a 360-degree rotation.',
          'Video style transfer using first and last frames combined with line-art guided generation.',
          'Multimodal guidance with pose, depth, line art, and audio.',
          'Ultra-low-resolution video super-resolution, from 90p up to 720p or 1080p.',
        ],
        paragraphs: [
          'The official README says V3 can generate a 5-second 360p shot within 8 seconds. Real speed depends on your GPU and settings.',
        ],
      },
      {
        heading: 'What changed in V3.1',
        paragraphs: [
          'V3.1 improves motion range. The maintainers recommend a motion score between 2.0 and 4.0 for the best results. A version of V3.1 that fits in 12 GB of VRAM was published on ModelScope on 25 September 2025.',
        ],
      },
      {
        heading: 'Run AniSora V3.1 locally',
        paragraphs: [
          'Create a Python 3.10 environment, install the dependencies from the anisoraV3 folder, and download the V3.1 checkpoints from Hugging Face or ModelScope. Then run single-GPU inference:',
        ],
        code: `cd anisoraV3
conda create -n wan_gpu python=3.10
conda activate wan_gpu
pip install -r req-fastvideo.txt
pip install -r requirements.txt
pip install -e .

python generate-pi-i2v-any.py \\
  --task i2v-14B --size 1280*720 \\
  --ckpt_dir Wan2.1-I2V-14B-480P \\
  --image output_videos_any \\
  --prompt data/inference_any.txt \\
  --base_seed 4096 --frame_num 81`,
      },
      {
        heading: 'Multi-GPU and frame count',
        bullets: [
          'Use torchrun with --dit_fsdp, --t5_fsdp, and --ulysses_size; set --nproc_per_node and --ulysses_size to your GPU count.',
          'Frame count must follow 8x+1. 81 frames at 16 fps is about 5 seconds, which is also the recommended length for a full 360-degree character rotation.',
          'Each prompt-file line uses image_path@@prompt&&image_position, where the position is 0 (first frame), 0.5 (middle), or 1 (last frame).',
        ],
      },
      {
        heading: 'Official prompt format',
        paragraphs: [
          'Write a detailed English description, then append an aesthetic score (5.0\u20137.0), a motion score (2.0\u20134.0), and the mandatory no-text clause:',
        ],
        code: 'A drone chase sequence through neon-lit city streets at night. aesthetic score: 5.5. motion score: 4.0. There is no text in the video.',
      },
      {
        heading: 'Try anime image-to-video without a GPU',
        paragraphs: [hostedModelNote, independenceNote],
      },
    ],
    faq: [
      {
        question: 'Is AniSora V3 free to use?',
        answer:
          'The AniSora V3 weights are released under the Apache-2.0 license, so you can download and run them on your own hardware. Hosted services that run generation for you may charge for compute.',
      },
      {
        question: 'What is the difference between AniSora V3 and V3.1?',
        answer:
          'V3.1 is an update of V3 with a larger motion range. The maintainers recommend a motion score of 2.0 to 4.0 with V3.1, and a 12 GB VRAM build of V3.1 is available on ModelScope.',
      },
      {
        question: 'How long are AniSora V3 videos?',
        answer:
          'The default setting is 81 frames at 16 fps, about 5 seconds. Frame counts must follow the 8x+1 rule.',
      },
      {
        question: 'Is AniSora Studio the official AniSora V3 website?',
        answer:
          'No. AniSora Studio is an independent product. The official homepage of the AniSora project is the bilibili/Index-anisora GitHub repository.',
      },
    ],
    sources: [
      { label: 'Index-anisora repository', url: officialRepositoryUrl },
      {
        label: 'anisoraV3 README',
        url: `${officialRepositoryUrl}/tree/main/anisoraV3`,
      },
      {
        label: 'V3.1 weights on Hugging Face',
        url: 'https://huggingface.co/IndexTeam/Index-anisora/tree/main/V3.1',
      },
    ],
  },
  {
    slug: 'anisora-v3-2',
    keyword: 'AniSora V3.2',
    metaTitle: 'AniSora V3.2: Wan2.2-Based Anime Video Model, Setup & Prompts',
    description:
      'AniSora V3.2 runs on Wan2.2 with 8-step inference. See what changed from V3.1, how to run it locally, the prompt format, and an online alternative.',
    heading: 'AniSora V3.2: the Wan2.2-based release explained',
    intro:
      'AniSora V3.2 was released on 23 September 2025. It is trained on the stronger Wan2.2 base model and can cut inference down to 8 sampling steps, while keeping the arbitrary-frame inference and character 3D generation introduced in V3.1.',
    updatedAt: '2026-10-15',
    facts: [
      { label: 'Released', value: '23 Sep 2025' },
      { label: 'Base model', value: 'Wan2.2 image-to-video A14B' },
      { label: 'Sampling steps', value: '8' },
      { label: 'Checkpoints', value: 'High-noise and low-noise models' },
      { label: 'Default clip', value: '81 frames at 16 fps (about 5 s)' },
      { label: 'License', value: 'Apache-2.0 repository' },
    ],
    sections: [
      {
        heading: 'AniSora V3.2 vs V3.1',
        bullets: [
          'Base model: V3.2 uses Wan2.2 (task i2v-A14B); V3.1 uses Wan2.1 image-to-video 14B.',
          'Speed: V3.2 is documented with 8 sampling steps.',
          'Checkpoints: V3.2 loads separate high-noise and low-noise models.',
          'Features: both support arbitrary-frame inference and character 3D video generation.',
          'Memory: a 12 GB VRAM build has been published for V3.1, not for V3.2.',
        ],
      },
      {
        heading: 'Run AniSora V3.2 locally',
        paragraphs: [
          'Set up the environment from the anisoraV3.2 folder and download the V3.2 checkpoints from Hugging Face. Single-GPU inference:',
        ],
        code: `cd anisoraV3.2
conda create -n wan_gpu python=3.10
conda activate wan_gpu
pip install -r req-fastvideo.txt
pip install -r requirements.txt
pip install -e .

python generate_txt_new.py \\
  --task i2v-A14B --size 1280*720 \\
  --ckpt_dir Index-anisora-V3.2 \\
  --prompt_list data/inference_any.txt \\
  --save_dir test_any_outputs \\
  --sample_steps 8 --sample_shift 5 --sample_guide_scale 1 \\
  --ckpt_dir_lowname low_noise_model \\
  --ckpt_dir_highname high_noise_model \\
  --base_seed 4096`,
      },
      {
        heading: 'Character 360-degree rotation',
        paragraphs: [
          'Use data/inference_360.txt as the prompt list and keep --frame_num 81. The maintainers recommend about 5 seconds so the character completes a full turn. For multiple GPUs, launch with torchrun and set --ulysses_size to the GPU count.',
        ],
      },
      {
        heading: 'Prompt tips for V3.2',
        paragraphs: [
          'V3.2 was trained on long, detailed prompts. The maintainers suggest expanding short ideas with an LLM first, then appending the aesthetic score, motion score, and no-text clause:',
        ],
        code: '[Detailed video description]. aesthetic score: 5.5. motion score: 4.0. There is no text in the video.',
      },
      {
        heading: 'Try anime image-to-video without a GPU',
        paragraphs: [hostedModelNote, independenceNote],
      },
    ],
    faq: [
      {
        question: 'When was AniSora V3.2 released?',
        answer:
          'The AniSora V3.2 weights were released on 23 September 2025 in the official Index-anisora repository.',
      },
      {
        question: 'Is AniSora V3.2 better than V3.1?',
        answer:
          'V3.2 is trained on the stronger Wan2.2 base model and documents 8-step inference. V3.1 remains useful when memory is tight, because a 12 GB VRAM build of V3.1 is available.',
      },
      {
        question: 'Why does AniSora V3.2 need two checkpoints?',
        answer:
          'V3.2 follows the Wan2.2 A14B layout, which loads a high-noise model and a low-noise model. The inference script takes both folder names as arguments.',
      },
      {
        question: 'Can I use AniSora V3.2 online?',
        answer:
          'The open-source weights are meant to run on your own GPUs. AniSora Studio offers an independent online image-to-video generator that currently uses Kling 2.1 through fal and states the model before you spend credits.',
      },
    ],
    sources: [
      { label: 'Index-anisora repository', url: officialRepositoryUrl },
      {
        label: 'anisoraV3.2 README',
        url: `${officialRepositoryUrl}/tree/main/anisoraV3.2`,
      },
      {
        label: 'V3.2 weights on Hugging Face',
        url: 'https://huggingface.co/IndexTeam/Index-anisora/tree/main/V3.2',
      },
    ],
  },
  {
    slug: 'index-anisora',
    keyword: 'Index-AniSora',
    metaTitle: 'Index-AniSora: Bilibili\u2019s Open-Source Anime Video Model',
    description:
      'Index-AniSora explained: every AniSora version from V1 to V3.2, the research papers, benchmark, license, where to download, and how to try it.',
    heading: 'Index-AniSora: Bilibili\u2019s open-source anime video project',
    intro:
      'Index-AniSora is Bilibili\u2019s open-source project for anime video generation. It covers series episodes, Chinese original animation, manga adaptations, VTuber content, anime PVs, and more, and its research paper was accepted at IJCAI 2025.',
    updatedAt: '2026-10-15',
    facts: [
      { label: 'Developer', value: 'Bilibili Index team' },
      { label: 'License', value: 'Apache-2.0' },
      { label: 'Paper', value: 'IJCAI 2025 (arXiv 2412.10255)' },
      { label: 'Latest weights', value: 'V3.2 (Sep 2025)' },
      { label: 'Benchmark', value: '948 labeled animation clips' },
      { label: 'Downloads', value: 'Hugging Face and ModelScope' },
    ],
    sections: [
      {
        heading: 'Version timeline',
        bullets: [
          'AniSora V1: built on CogVideoX-5B, with full training and inference code and cost-effective deployment on an RTX 4090.',
          'AniSora V2: built on Wan2.1-14B; weights released under Apache-2.0 on 11 July 2025, with native Huawei Ascend 910B NPU support.',
          'AniSora V3: weights released under Apache-2.0 on 27 August 2025, adding arbitrary-frame inference, character 3D, style transfer, and multimodal guidance.',
          'AniSora V3.1: released 4 September 2025 with a larger motion range.',
          'AniSora V3.2: released 23 September 2025, trained on Wan2.2 with 8-step inference.',
          'AniSora AnyMask: released 31 October 2025 for image-to-video with temporal and spatial masks.',
        ],
      },
      {
        heading: 'Research behind AniSora',
        bullets: [
          'AniSora: Exploring the Frontiers of Animation Video Generation in the Sora Era (arXiv 2412.10255), accepted at IJCAI 2025.',
          'Aligning Anime Video Generation with Human Feedback (arXiv 2504.10044), the first RLHF framework for anime video generation.',
          'AniMe (arXiv 2508.18781), agent research for long animation production.',
        ],
        paragraphs: [
          'The project also releases a data-cleaning pipeline and an anime benchmark of 948 clips, labeled by action with 10 to 30 clips per label.',
        ],
      },
      {
        heading: 'Which AniSora version should you use?',
        bullets: [
          'Best quality and speed on large GPUs: V3.2.',
          'Limited VRAM: the 12 GB build of V3.1.',
          'Ascend NPUs: V2.',
          'Masked or localized animation: AnyMask.',
        ],
        paragraphs: [
          'Setup guides: see the AniSora V3 and AniSora V3.2 pages on this site, which follow the official READMEs.',
        ],
      },
      {
        heading: 'Spelling variants',
        paragraphs: [
          'People also search for Index AniSora as AniSora AI, Ani Sora, or Anizora. They refer to the same Bilibili project.',
        ],
      },
      {
        heading: 'Try anime image-to-video without a GPU',
        paragraphs: [hostedModelNote, independenceNote],
      },
    ],
    faq: [
      {
        question: 'What is Index-AniSora?',
        answer:
          'Index-AniSora is Bilibili\u2019s open-source anime video generation project, including model weights, training and inference code, a data pipeline, and an anime benchmark.',
      },
      {
        question: 'Is Index-AniSora open source?',
        answer:
          'Yes. The repository is licensed under Apache-2.0, and the V2 and V3 weights were released under Apache-2.0 on Hugging Face and ModelScope.',
      },
      {
        question: 'Who made AniSora?',
        answer:
          'AniSora was developed by Bilibili\u2019s Index team. The official homepage is the bilibili/Index-anisora GitHub repository.',
      },
      {
        question: 'Is anisora.ai the official AniSora site?',
        answer:
          'No. AniSora Studio at anisora.ai is an independent product and is not affiliated with Bilibili or the AniSora project team.',
      },
    ],
    sources: [
      { label: 'Index-anisora repository', url: officialRepositoryUrl },
      { label: 'AniSora paper (arXiv 2412.10255)', url: 'https://arxiv.org/abs/2412.10255' },
      {
        label: 'Weights on Hugging Face',
        url: 'https://huggingface.co/IndexTeam/Index-anisora',
      },
    ],
  },
];

export function getBrandPage(slug: string) {
  const page = brandPages.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`Unknown brand page: ${slug}`);
  return page;
}
