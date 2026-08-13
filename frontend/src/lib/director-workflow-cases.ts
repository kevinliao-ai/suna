import {
  createAnimeDirectorPlan,
  type AnimeDirectorPlan,
  type DirectorShotSeed,
  type ShotPriority,
} from './anime-director.ts';
import {
  getAnimeShotRecipe,
  type AnimeShotRecipe,
} from './anime-shot-recipes.ts';

export interface DirectorWorkflowCase {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  audience: string;
  searchIntent: string;
  script: string;
  style: string;
  priority: ShotPriority;
  recipeSlugs: string[];
  modelSlugs: string[];
  comparisonSlug?: string;
  constraints: string[];
  decisions: Array<{ title: string; explanation: string }>;
  verification: string[];
  faq: Array<{ question: string; answer: string }>;
}

function defineCase(item: DirectorWorkflowCase) {
  return item;
}

export const directorWorkflowCases = [
  defineCase({
    slug: 'anime-fight-scene-shot-plan',
    title: 'Anime Fight Scene Shot Plan',
    eyebrow: 'Action workflow case',
    description:
      'A four-shot action sequence that keeps direction, silhouettes, and escalation readable without asking one generation to animate an entire fight.',
    audience: 'Anime short creators planning a compact confrontation or trailer beat.',
    searchIntent: 'How to plan an AI anime fight scene shot by shot.',
    script:
      'The rivals face each other in the rain.\nThe hero draws a blade and reflected light cuts across frame.\nThey race through a school corridor as alarms flash.\nThe hero reaches the rooftop edge and turns toward the city.',
    style:
      'cinematic anime action, rain continuity, clean silhouettes, blue-hour contrast',
    priority: 'control',
    recipeSlugs: [
      'rival-standoff',
      'sword-draw-impact',
      'corridor-chase',
      'rooftop-hero-reveal',
    ],
    modelSlugs: ['runway-gen-4', 'luma-ray'],
    comparisonSlug: 'runway-gen-4-vs-luma-ray',
    constraints: [
      'One decisive movement per shot.',
      'Preserve left-to-right travel until the rooftop turn.',
      'Use the same rain direction and blue rim light across all four shots.',
    ],
    decisions: [
      {
        title: 'Separate anticipation from impact',
        explanation:
          'The standoff establishes geography before the sword draw introduces speed, so camera motion does not hide the characters.',
      },
      {
        title: 'Use architecture as motion evidence',
        explanation:
          'Repeating corridor windows create parallax and perceived speed without requiring complex full-body animation.',
      },
      {
        title: 'End on a readable silhouette',
        explanation:
          'The rooftop reveal releases the sequence from close action and gives the editor a stable endpoint.',
      },
    ],
    verification: [
      'Check screen direction at every cut.',
      'Reject drafts where the blade hand or hero silhouette becomes ambiguous.',
      'Compare reference frames before paying for final video attempts.',
    ],
    faq: [
      {
        question: 'Why not generate the complete anime fight in one prompt?',
        answer:
          'Several attacks, camera changes, and locations in one short request create competing motion instructions. Separate shots make failures cheaper to isolate and edit.',
      },
      {
        question: 'Does this case prove one video model is best for anime action?',
        answer:
          'No. It is a reproducible planning study. Use the same references and shot specifications for a small provider test before drawing a performance conclusion.',
      },
    ],
  }),
  defineCase({
    slug: 'consistent-anime-character-short-scene',
    title: 'Consistent Anime Character Short Scene',
    eyebrow: 'Character continuity case',
    description:
      'A three-shot character sequence designed around stable costume landmarks, restrained gestures, and reference-first generation.',
    audience: 'Creators who need the same protagonist to survive several connected shots.',
    searchIntent: 'How to keep an anime character consistent across AI video shots.',
    script:
      'The heroine notices a cat at the classroom window.\nShe pauses beside a vending machine after school and looks away.\nAt the station, she raises one hand as the train begins to leave.',
    style:
      'clean contemporary anime, consistent navy uniform, amber eyes, soft late-afternoon light',
    priority: 'control',
    recipeSlugs: ['cat-at-window', 'after-school-vending-machine', 'goodbye-platform'],
    modelSlugs: ['runway-gen-4', 'luma-ray'],
    comparisonSlug: 'runway-gen-4-vs-luma-ray',
    constraints: [
      'Repeat the same hair shape, eye color, uniform collar, and bag in every reference.',
      'Use one small gesture per shot instead of full-body action.',
      'Approve reference frames as a set before generating motion.',
    ],
    decisions: [
      {
        title: 'Choose identity-friendly framing',
        explanation:
          'Medium and close compositions keep the face and costume landmarks large enough to compare between shots.',
      },
      {
        title: 'Keep lighting changes motivated',
        explanation:
          'Classroom daylight, vending-machine glow, and platform dusk change gradually while the character design remains fixed.',
      },
      {
        title: 'Treat references as a batch gate',
        explanation:
          'A mismatched still is rejected before video spend, which protects both continuity and credits.',
      },
    ],
    verification: [
      'Place the three approved references side by side.',
      'Compare face shape, bangs, collar, bag, and dominant palette.',
      'Record which landmark drifted when a draft fails.',
    ],
    faq: [
      {
        question: 'What should a character reference lock first?',
        answer:
          'Prioritize silhouette, hair shape, face landmarks, costume geometry, and two or three color anchors before adding fine accessories.',
      },
      {
        question: 'Is character consistency guaranteed?',
        answer:
          'No. This workflow reduces avoidable variation and makes review repeatable, but provider behavior still needs to be tested with your references.',
      },
    ],
  }),
  defineCase({
    slug: 'anime-romance-dialogue-scene',
    title: 'Anime Romance Dialogue Scene',
    eyebrow: 'Restrained emotion case',
    description:
      'A quiet romance sequence built from eye lines, hands, pauses, and an environmental transition instead of exaggerated character motion.',
    audience: 'Romance, visual-novel, and webtoon creators adapting a short emotional beat.',
    searchIntent: 'How to compose a subtle anime romance scene with AI video.',
    script:
      'Two students notice each other across a quiet train carriage.\nUnder one umbrella, their hands slowly move closer.\nFireworks bloom, but both characters keep watching each other.',
    style:
      'soft cinematic romance anime, restrained expressions, rain reflections, warm festival color',
    priority: 'quality',
    recipeSlugs: ['first-glance-train', 'umbrella-confession', 'festival-fireworks'],
    modelSlugs: ['google-veo', 'luma-ray'],
    comparisonSlug: 'google-veo-vs-luma-ray',
    constraints: [
      'Keep eye lines consistent across the implied conversation axis.',
      'Use hands and reflections as emotional signals.',
      'Let background motion carry energy while faces remain restrained.',
    ],
    decisions: [
      {
        title: 'Establish attention before intimacy',
        explanation:
          'The train glance gives the later hand movement context without requiring dialogue or lip synchronization.',
      },
      {
        title: 'Move the camera toward the hands',
        explanation:
          'The umbrella shot narrows the visual question to one safe, readable gesture.',
      },
      {
        title: 'Use fireworks as contrast',
        explanation:
          'The largest environmental event happens behind the characters, so the emotional payoff stays quiet.',
      },
    ],
    verification: [
      'Check that gaze direction matches between cuts.',
      'Reject hand poses that become the accidental focal point through anatomy errors.',
      'Review the sequence without audio to confirm the emotion remains readable.',
    ],
    faq: [
      {
        question: 'How can an AI anime romance shot feel less exaggerated?',
        answer:
          'Ask for one small gesture, stable expressions, and environmental movement such as rain or fireworks rather than broad body animation.',
      },
      {
        question: 'Does this workflow include generated dialogue?',
        answer:
          'The plan includes voice direction, but this public case focuses on shot construction. Dialogue recording and lip sync should be tested separately.',
      },
    ],
  }),
  defineCase({
    slug: 'fantasy-anime-reveal-sequence',
    title: 'Fantasy Anime Reveal Sequence',
    eyebrow: 'Scale and effects case',
    description:
      'A four-shot fantasy progression that orders magical effects, environmental scale, and character reaction into separate controllable beats.',
    audience: 'Fantasy anime creators planning a discovery, portal, or world-reveal sequence.',
    searchIntent: 'How to storyboard a fantasy anime reveal with AI video.',
    script:
      'A hidden door opens inside the library wall.\nA spell circle ignites beneath the traveler.\nA forest spirit appears between the trees.\nThe clouds part to reveal a city floating above the valley.',
    style:
      'luminous fantasy anime, ordered magical geometry, layered mist, teal and gold palette',
    priority: 'quality',
    recipeSlugs: [
      'magic-door-discovery',
      'spell-circle-closeup',
      'forest-spirit-encounter',
      'flying-city-arrival',
    ],
    modelSlugs: ['google-veo', 'luma-ray'],
    comparisonSlug: 'google-veo-vs-luma-ray',
    constraints: [
      'Introduce only one new magical system per shot.',
      'Keep portal and spell geometry stable before adding particles.',
      'Reserve the widest scale reveal for the final shot.',
    ],
    decisions: [
      {
        title: 'Order effects from small to large',
        explanation:
          'Door light and spell geometry teach the visual language before the spirit and city demand more scale.',
      },
      {
        title: 'Separate reaction from spectacle',
        explanation:
          'The forest encounter gives the traveler a readable relationship before the environment becomes enormous.',
      },
      {
        title: 'Finish with atmospheric depth',
        explanation:
          'Cloud layers and valley foreground create scale without requiring complex crowd animation.',
      },
    ],
    verification: [
      'Check that magical symbols do not change shape within a shot.',
      'Review particle density at thumbnail size.',
      'Confirm each shot still communicates one clear reveal with effects removed.',
    ],
    faq: [
      {
        question: 'Why split magical effects into multiple shots?',
        answer:
          'Stable geometry, character reaction, particles, and scale compete for generation attention. Separating them improves diagnosis and editorial control.',
      },
      {
        question: 'What is the safest first fantasy reference?',
        answer:
          'Start with a stable environment and one readable magical shape. Add glow and secondary particles only after composition is approved.',
      },
    ],
  }),
  defineCase({
    slug: 'slice-of-life-anime-short',
    title: 'Slice-of-Life Anime Short',
    eyebrow: 'Low-motion production case',
    description:
      'A four-shot everyday sequence that creates rhythm through light, objects, and small gestures while keeping generation complexity low.',
    audience: 'Solo creators making a calm anime loop, social short, or mood piece.',
    searchIntent: 'How to make a slice-of-life anime short with simple AI shots.',
    script:
      'Morning light reaches a quiet kitchen as breakfast is prepared.\nA cat pauses at the classroom window.\nA bicycle follows the riverbank in late afternoon.\nThe last student switches off the clubroom light.',
    style:
      'gentle slice-of-life anime, natural light progression, lived-in objects, restrained motion',
    priority: 'cost',
    recipeSlugs: [
      'morning-kitchen-routine',
      'cat-at-window',
      'bicycle-riverbank',
      'empty-clubroom',
    ],
    modelSlugs: ['kling-ai', 'wan-video'],
    comparisonSlug: 'kling-ai-vs-wan-video',
    constraints: [
      'Use one natural gesture or environmental movement per shot.',
      'Let the lighting progress from morning to evening.',
      'Keep backgrounds detailed but camera paths simple.',
    ],
    decisions: [
      {
        title: 'Build rhythm with time of day',
        explanation:
          'Lighting connects four unrelated locations into one day without requiring the same character in every frame.',
      },
      {
        title: 'Spend motion on familiar actions',
        explanation:
          'Steam, a turning head, bicycle parallax, and a light switch are easy for viewers to recognize and review.',
      },
      {
        title: 'Use a quiet visual full stop',
        explanation:
          'The empty clubroom closes the short with an unambiguous change from light to dark.',
      },
    ],
    verification: [
      'Check object continuity inside each shot rather than forcing a shared protagonist.',
      'Reject unnecessary camera motion that competes with the daily action.',
      'Test the edit with simple room tone before adding music.',
    ],
    faq: [
      {
        question: 'Why is slice-of-life useful for a first AI anime project?',
        answer:
          'Small actions and environmental motion create a complete mood without the body mechanics and effects required by action scenes.',
      },
      {
        question: 'How can this workflow control cost?',
        answer:
          'Use short drafts, simple camera paths, and reference approval before final renders. The plan estimates drafts but does not claim provider pricing.',
      },
    ],
  }),
  defineCase({
    slug: 'sci-fi-anime-trailer-shot-list',
    title: 'Sci-Fi Anime Trailer Shot List',
    eyebrow: 'Trailer structure case',
    description:
      'A five-shot science-fiction trailer spine built around one signal, one location reveal, one memory interruption, one rescue beat, and one quiet ending.',
    audience: 'Indie anime and game teams previsualizing a compact science-fiction teaser.',
    searchIntent: 'How to plan a sci-fi anime trailer shot list for AI video.',
    script:
      'A hologram message breaks apart before the warning completes.\nThe pilot enters a rain-soaked cyberpunk alley.\nAn android remembers a face for a fraction of a second.\nA crew member reaches for a drifting astronaut.\nThe survivors watch a distant planet through the observation window.',
    style:
      'cinematic sci-fi anime, readable interface light, cool neon, restrained signal distortion',
    priority: 'control',
    recipeSlugs: [
      'hologram-message',
      'cyberpunk-alley-arrival',
      'android-memory-flash',
      'zero-gravity-rescue',
      'spaceship-window-silence',
    ],
    modelSlugs: ['runway-gen-4', 'google-veo'],
    comparisonSlug: 'runway-gen-4-vs-google-veo',
    constraints: [
      'Give every shot one technological story beat.',
      'Keep interface text abstract and readable as shape rather than relying on generated copy.',
      'Use signal distortion only at motivated transition points.',
    ],
    decisions: [
      {
        title: 'Open with incomplete information',
        explanation:
          'The broken hologram creates a question before the trailer starts explaining the world.',
      },
      {
        title: 'Alternate scale and intimacy',
        explanation:
          'An alley, a memory close-up, a rescue, and an observation window prevent consecutive shots from competing at the same visual scale.',
      },
      {
        title: 'End with silence rather than another effect',
        explanation:
          'The window shot gives titles, music, and narration room after the rescue peak.',
      },
    ],
    verification: [
      'Check that glitches remain localized to the hologram and memory transitions.',
      'Review zero-gravity body orientation before adding debris.',
      'Confirm the final wide shot has enough negative space for editorial text.',
    ],
    faq: [
      {
        question: 'How many shots does a short sci-fi anime teaser need?',
        answer:
          'This plan uses five distinct beats. The right number depends on duration, but each shot should introduce one readable story function.',
      },
      {
        question: 'Are the interfaces expected to contain readable generated text?',
        answer:
          'No. Treat interface elements as graphic shapes during generation and add exact typography during editing.',
      },
    ],
  }),
] as const satisfies readonly DirectorWorkflowCase[];

export function getDirectorWorkflowCase(slug: string) {
  return directorWorkflowCases.find((item) => item.slug === slug);
}

export function getCaseRecipes(item: DirectorWorkflowCase): AnimeShotRecipe[] {
  return item.recipeSlugs
    .map((slug) => getAnimeShotRecipe(slug))
    .filter((recipe): recipe is AnimeShotRecipe => Boolean(recipe));
}

export function getCaseSeedShots(item: DirectorWorkflowCase): DirectorShotSeed[] {
  return getCaseRecipes(item).map((recipe) => ({
    camera: recipe.camera,
    durationSeconds: recipe.duration,
    visualPrompt: recipe.prompt,
    checklist: recipe.tips,
  }));
}

export function getCasePlan(item: DirectorWorkflowCase): AnimeDirectorPlan {
  return createAnimeDirectorPlan({
    script: item.script,
    projectTitle: item.title,
    style: item.style,
    priority: item.priority,
    seedShots: getCaseSeedShots(item),
  });
}

export function getCasesForRecipe(recipeSlug: string) {
  return directorWorkflowCases.filter((item) =>
    item.recipeSlugs.includes(recipeSlug),
  );
}

export function getCasesForModels(modelSlugs: string[]) {
  return directorWorkflowCases.filter((item) =>
    item.modelSlugs.some((slug) => modelSlugs.includes(slug)),
  );
}
