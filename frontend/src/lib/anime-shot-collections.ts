import {
  animeShotRecipes,
  type AnimeShotRecipe,
  type RecipeGenre,
  type RecipeShotType,
} from './anime-shot-recipes.ts';

export interface AnimeShotCollection {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  eyebrow: string;
  intent: string;
  editorial: string;
  filter: { genre?: RecipeGenre; shotType?: RecipeShotType };
  planningRules: string[];
  commonMistakes: string[];
  faq: Array<{ question: string; answer: string }>;
}

export const animeShotCollections: AnimeShotCollection[] = [
  {
    slug: 'anime-action-scene-ideas',
    title: 'Anime Action Scene Ideas for Controlled AI Video',
    shortTitle: 'Action scene ideas',
    description:
      'Plan readable anime action with one decisive movement, a clear silhouette, and camera motion that supports rather than hides the beat.',
    eyebrow: 'Action recipe collection',
    intent:
      'Creators looking for anime fight, chase, launch, and standoff ideas they can turn into short AI video shots.',
    editorial:
      'The strongest short action shots do less than a full fight sequence. They isolate one anticipation, impact, or consequence beat so identity and anatomy have fewer chances to drift.',
    filter: { genre: 'Action' },
    planningRules: [
      'Choose one primary action and one visual accent.',
      'Keep the direction of travel consistent across the frame.',
      'Use environment parallax to add speed without adding body motion.',
    ],
    commonMistakes: [
      'Combining several attacks into a single short generation.',
      'Using camera shake before the subject silhouette is readable.',
    ],
    faq: [
      {
        question: 'How long should an AI anime action shot be?',
        answer:
          'Start with four to six seconds and one complete beat. Chain separately generated shots in editing when the scene needs several attacks or reactions.',
      },
      {
        question: 'How do I keep an action shot consistent?',
        answer:
          'Lock the character reference and starting pose, describe one motion, and keep camera direction and lighting stable.',
      },
    ],
  },
  {
    slug: 'anime-romance-scene-prompts',
    title: 'Anime Romance Scene Prompts with Clear Emotional Beats',
    shortTitle: 'Romance prompts',
    description:
      'Build restrained romance shots around eye lines, hands, reflections, pauses, and environmental transitions instead of exaggerated motion.',
    eyebrow: 'Romance recipe collection',
    intent:
      'Creators searching for anime confession, first-meeting, festival, and goodbye prompts.',
    editorial:
      'Romance reads through timing and withheld action. A glance that arrives late or hands that almost meet often survives AI generation better than complex dialogue acting.',
    filter: { genre: 'Romance' },
    planningRules: [
      'Give the shot one emotional change.',
      'Use a prop or environment cue to carry subtext.',
      'Prefer small eye, hand, and fabric movement.',
    ],
    commonMistakes: [
      'Overloading the prompt with facial expressions and gestures.',
      'Changing the lighting direction during an intimate close-up.',
    ],
    faq: [
      {
        question: 'What makes an anime romance prompt feel cinematic?',
        answer:
          'Connect a small character reaction to a controlled camera move or environmental cue such as a train reflection, rain edge, or firework reveal.',
      },
      {
        question: 'Should both faces stay visible?',
        answer:
          'Not always. Reflections, profiles, hands, and over-shoulder framing can reduce identity drift while increasing emotional tension.',
      },
    ],
  },
  {
    slug: 'fantasy-anime-video-prompts',
    title: 'Fantasy Anime Video Prompts for Magic and World Reveals',
    shortTitle: 'Fantasy prompts',
    description:
      'Design fantasy shots around ordered effects, stable portal geometry, layered depth, and a single scale reveal.',
    eyebrow: 'Fantasy recipe collection',
    intent:
      'Creators planning magic systems, dragons, spirits, flying cities, and portal scenes.',
    editorial:
      'Fantasy shots become believable when the impossible element follows a visual rule. Sequential runes, consistent glow, and scale references give the model a clearer job than broad requests for epic magic.',
    filter: { genre: 'Fantasy' },
    planningRules: [
      'Define how the magical effect starts, spreads, and stops.',
      'Use one foreground object to establish scale.',
      'Keep portal, glyph, or creature silhouette stable before motion.',
    ],
    commonMistakes: [
      'Requesting several unrelated magical effects at once.',
      'Letting glow erase faces, hands, or environment edges.',
    ],
    faq: [
      {
        question: 'How do I prompt consistent anime magic?',
        answer:
          'Describe a fixed shape, a limited color family, and an ordered activation sequence instead of asking for random energy.',
      },
      {
        question: 'How can a fantasy reveal look larger?',
        answer:
          'Include a familiar foreground reference, hide part of the reveal behind cloud or architecture, and move the camera slowly.',
      },
    ],
  },
  {
    slug: 'slice-of-life-anime-scene-ideas',
    title: 'Slice-of-Life Anime Scene Ideas for Everyday Motion',
    shortTitle: 'Slice-of-life ideas',
    description:
      'Turn kitchens, classrooms, riverbanks, stores, and clubrooms into quiet shots driven by one natural gesture.',
    eyebrow: 'Everyday recipe collection',
    intent:
      'Creators looking for cozy, school, daily routine, and nostalgic anime scene ideas.',
    editorial:
      'Everyday anime works when the environment does part of the acting. Steam, paper, grass, fluorescent light, and an empty chair can carry mood while characters make only small repeatable movements.',
    filter: { genre: 'Slice of life' },
    planningRules: [
      'Pick one environmental motion and one human gesture.',
      'Use locked or smoothly tracking cameras.',
      'Let lighting and sound design imply time of day.',
    ],
    commonMistakes: [
      'Adding action that conflicts with the quiet emotional goal.',
      'Filling the frame with background characters that need continuity.',
    ],
    faq: [
      {
        question: 'Why are slice-of-life scenes useful for AI video?',
        answer:
          'They can create strong atmosphere with controlled movement, making them practical for testing character consistency and environment style.',
      },
      {
        question: 'What camera move works best?',
        answer:
          'Start with a locked frame, a gentle push, or a parallel tracking move. Let the everyday action remain the focal point.',
      },
    ],
  },
  {
    slug: 'sci-fi-anime-video-prompts',
    title: 'Sci-Fi Anime Video Prompts for Mecha, Space, and Cyberpunk',
    shortTitle: 'Sci-fi prompts',
    description:
      'Plan science-fiction shots with readable interfaces, deliberate signal effects, stable scale, and one technological story beat.',
    eyebrow: 'Sci-fi recipe collection',
    intent:
      'Creators searching for mecha, spaceship, android, hologram, and cyberpunk anime prompts.',
    editorial:
      'Sci-fi detail is most useful when it explains the scene. Sequential launch lights, a broken message, or a tether line gives technology a narrative function and limits visual noise.',
    filter: { genre: 'Sci-fi' },
    planningRules: [
      'Give each interface or effect a story purpose.',
      'Separate subject silhouette from screen and neon light.',
      'Use slow camera motion when the environment is visually dense.',
    ],
    commonMistakes: [
      'Treating random UI animation as meaningful action.',
      'Using too many neon colors and losing the focal point.',
    ],
    faq: [
      {
        question: 'How can I make a mecha shot feel large?',
        answer:
          'Use rails, people, steam, or architecture as scale references and reveal motion in stages rather than moving every mechanical part.',
      },
      {
        question: 'How do I keep cyberpunk prompts readable?',
        answer:
          'Limit the palette to two main light families and give the subject a clean silhouette against the environment.',
      },
    ],
  },
  {
    slug: 'anime-establishing-shot-examples',
    title: 'Anime Establishing Shot Examples for AI Storyboards',
    shortTitle: 'Establishing shots',
    description:
      'Use wide shots to explain place, scale, time, and threat before asking the audience to follow character action.',
    eyebrow: 'Camera-language collection',
    intent:
      'Storyboarders and AI video creators looking for anime establishing shot examples.',
    editorial:
      'An establishing shot should answer where the viewer is and what matters here. One focal structure and a foreground scale cue are usually more valuable than maximum environmental detail.',
    filter: { shotType: 'Establishing' },
    planningRules: [
      'Choose one landmark or threat as the visual destination.',
      'Build foreground, middle ground, and background layers.',
      'Keep the horizon and main architecture stable.',
    ],
    commonMistakes: [
      'Using a wide frame without a clear focal hierarchy.',
      'Moving the camera too quickly for the location to register.',
    ],
    faq: [
      {
        question: 'How long should an anime establishing shot last?',
        answer:
          'Five to eight seconds is a useful starting range for a generated shot, depending on how much location information the viewer must read.',
      },
      {
        question: 'Does every scene need one?',
        answer:
          'No. Use one when location, scale, time, or spatial relationships would otherwise be unclear.',
      },
    ],
  },
  {
    slug: 'anime-close-up-shot-ideas',
    title: 'Anime Close-Up Shot Ideas for Emotion and Detail',
    shortTitle: 'Close-up ideas',
    description:
      'Use close-ups to isolate one emotional signal, object, hand movement, eye line, or magical detail.',
    eyebrow: 'Camera-language collection',
    intent:
      'Creators looking for anime close-up compositions and prompt ideas.',
    editorial:
      'Close-ups are reliable when the frame has one job. An eye, reflection, hand, or glyph can communicate a story change without requiring full-body continuity.',
    filter: { shotType: 'Close-up' },
    planningRules: [
      'Select one detail that changes during the shot.',
      'Keep depth of field and focus behavior explicit.',
      'Reduce simultaneous facial and hand movement.',
    ],
    commonMistakes: [
      'Cropping without deciding what story information the detail carries.',
      'Requesting rapid focus, camera, expression, and object changes together.',
    ],
    faq: [
      {
        question: 'What should an anime close-up prompt include?',
        answer:
          'Name the exact detail, framing angle, focus behavior, lighting cue, and one small action.',
      },
      {
        question: 'Are close-ups easier for character consistency?',
        answer:
          'They can be, provided the crop is supported by a reference and the motion remains limited and anatomically clear.',
      },
    ],
  },
  {
    slug: 'anime-dialogue-scene-composition',
    title: 'Anime Dialogue Scene Composition for Short AI Shots',
    shortTitle: 'Dialogue scenes',
    description:
      'Compose conversations around eye lines, balanced two-shots, environmental subtext, and small reaction beats.',
    eyebrow: 'Camera-language collection',
    intent:
      'Creators planning anime conversations, confessions, warnings, and standoffs.',
    editorial:
      'A dialogue shot does not need constant lip and body motion. Composition, distance, and one reaction can communicate the relationship while keeping generation stable.',
    filter: { shotType: 'Dialogue' },
    planningRules: [
      'Decide whose emotional change the shot belongs to.',
      'Preserve eye-line direction and screen position.',
      'Use props or empty space to show relationship distance.',
    ],
    commonMistakes: [
      'Animating both speakers continuously.',
      'Crossing screen direction between generated coverage shots.',
    ],
    faq: [
      {
        question: 'Can AI video handle anime dialogue?',
        answer:
          'Use short reaction-oriented shots and add final dialogue timing in editing or a separate voice workflow rather than relying on long continuous lip sync.',
      },
      {
        question: 'Should I use a two-shot or close-up?',
        answer:
          'Use a two-shot to establish the relationship and a close-up when one character experiences the key emotional change.',
      },
    ],
  },
  {
    slug: 'anime-action-shot-camera-moves',
    title: 'Anime Action Shot Camera Moves That Stay Readable',
    shortTitle: 'Action camera moves',
    description:
      'Choose tracking, whip, roll, and impact moves that clarify a single action rather than compete with it.',
    eyebrow: 'Camera-language collection',
    intent:
      'Creators searching for camera movements for anime action and fight shots.',
    editorial:
      'Camera movement should reveal direction, speed, or impact. When both camera and character change direction repeatedly, short generated action becomes difficult to read and harder to edit.',
    filter: { shotType: 'Action' },
    planningRules: [
      'Assign the camera one movement axis.',
      'Hold a readable pose before or after the fastest motion.',
      'Use foreground streaks and parallax instead of random shake.',
    ],
    commonMistakes: [
      'Using orbit, zoom, shake, and character spin in one shot.',
      'Hiding the impact frame behind motion blur.',
    ],
    faq: [
      {
        question: 'Which camera move works for a chase?',
        answer:
          'A parallel side track with layered parallax keeps direction readable and can create speed without complex camera rotation.',
      },
      {
        question: 'When should I use a whip pan?',
        answer:
          'Use it to bridge one clear anticipation and impact, then return to a readable composition.',
      },
    ],
  },
  {
    slug: 'anime-character-reveal-shot-ideas',
    title: 'Anime Character Reveal Shot Ideas with Strong Silhouettes',
    shortTitle: 'Character reveals',
    description:
      'Reveal a character through silhouette, reflection, occlusion, camera tilt, or an environment reaction.',
    eyebrow: 'Camera-language collection',
    intent:
      'Creators looking for hero, villain, rival, and mysterious character introduction ideas.',
    editorial:
      'A reveal works because information is delayed. Start with a readable fragment or reaction, then uncover one defining character feature instead of exposing everything immediately.',
    filter: { shotType: 'Reveal' },
    planningRules: [
      'Choose what stays hidden at the beginning.',
      'Use a silhouette or reflection that matches the final pose.',
      'End on one defining costume, face, or scale cue.',
    ],
    commonMistakes: [
      'Showing the character clearly before the reveal begins.',
      'Changing identity details during an orbit or tilt.',
    ],
    faq: [
      {
        question: 'What makes a strong anime character reveal?',
        answer:
          'Clear delayed information, a stable silhouette, and one final visual detail that communicates role or personality.',
      },
      {
        question: 'How can I reduce identity drift during a reveal?',
        answer:
          'Start and end from reference-aligned keyframes and use occlusion, reflection, or a simple one-axis camera move.',
      },
    ],
  },
];

export function getAnimeShotCollection(slug: string) {
  return animeShotCollections.find((collection) => collection.slug === slug);
}

export function getCollectionRecipes(
  collection: AnimeShotCollection,
): AnimeShotRecipe[] {
  return animeShotRecipes.filter((recipe) => {
    if (collection.filter.genre && recipe.genre !== collection.filter.genre)
      return false;
    if (
      collection.filter.shotType &&
      recipe.shotType !== collection.filter.shotType
    )
      return false;
    return true;
  });
}

export function getRelatedCollections(collection: AnimeShotCollection) {
  return animeShotCollections
    .filter((candidate) => candidate.slug !== collection.slug)
    .slice(0, 3);
}
