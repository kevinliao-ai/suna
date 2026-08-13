import type { ShotPriority } from '@/lib/anime-director';

export const recipeGenres = [
  'Action',
  'Romance',
  'Fantasy',
  'Slice of life',
  'Sci-fi',
] as const;
export const recipeShotTypes = [
  'Establishing',
  'Close-up',
  'Dialogue',
  'Action',
  'Transition',
  'Reveal',
] as const;

export type RecipeGenre = (typeof recipeGenres)[number];
export type RecipeShotType = (typeof recipeShotTypes)[number];

export interface AnimeShotRecipe {
  slug: string;
  title: string;
  genre: RecipeGenre;
  shotType: RecipeShotType;
  mood: string;
  duration: number;
  priority: ShotPriority;
  camera: string;
  script: string;
  style: string;
  prompt: string;
  whyItWorks: string;
  tips: string[];
}

function defineRecipe(recipe: AnimeShotRecipe) {
  return recipe;
}

export const animeShotRecipes: AnimeShotRecipe[] = [
  defineRecipe({
    slug: 'rooftop-hero-reveal',
    title: 'Rooftop Hero Reveal',
    genre: 'Action',
    shotType: 'Reveal',
    mood: 'determined',
    duration: 5,
    priority: 'control',
    camera: 'low-angle crane up from boots to silhouette',
    script:
      'The hero steps onto the rooftop edge as the city alarms ignite below.',
    style:
      'cinematic anime, blue-hour skyline, sharp rim light, wind-driven coat',
    prompt:
      'A lone anime hero revealed above a neon city, low-angle crane-up, strong readable silhouette, restrained wind motion, cinematic blue-hour lighting.',
    whyItWorks:
      'The vertical camera move delays the face reveal and gives the character immediate scale.',
    tips: [
      'Lock the costume silhouette before animating.',
      'Keep the skyline slower than the coat motion.',
    ],
  }),
  defineRecipe({
    slug: 'sword-draw-impact',
    title: 'Sword Draw Impact',
    genre: 'Action',
    shotType: 'Action',
    mood: 'explosive',
    duration: 4,
    priority: 'quality',
    camera: 'tight profile close-up into fast lateral whip',
    script:
      'She draws the blade; the reflected light cuts across the frame before the strike.',
    style: 'high-detail anime action, inked speed lines, cold steel highlights',
    prompt:
      'Profile anime sword draw, flash of reflected light leads the motion, rapid lateral whip, clean hand anatomy, controlled speed lines, single decisive action.',
    whyItWorks:
      'A light cue bridges the slow anticipation and fast strike without requiring a complex fight shot.',
    tips: [
      'Generate the grip frame first.',
      'Limit the action to one draw and one light sweep.',
    ],
  }),
  defineRecipe({
    slug: 'rival-standoff',
    title: 'Rival Standoff',
    genre: 'Action',
    shotType: 'Dialogue',
    mood: 'tense',
    duration: 6,
    priority: 'control',
    camera: 'symmetrical two-shot with a slow push-in',
    script:
      'Two rivals face each other in the rain. Neither lowers their weapon.',
    style:
      'dramatic anime noir, rain, wet reflections, red and cyan practical lights',
    prompt:
      'Symmetrical anime rival standoff in rain, weapons held still, slow centered push-in, wet street reflections, opposing red and cyan edge light.',
    whyItWorks:
      'Symmetry makes the characters feel evenly matched while the push-in increases pressure.',
    tips: [
      'Use separate references for both rivals.',
      'Keep rain direction consistent across the shot.',
    ],
  }),
  defineRecipe({
    slug: 'corridor-chase',
    title: 'School Corridor Chase',
    genre: 'Action',
    shotType: 'Action',
    mood: 'urgent',
    duration: 5,
    priority: 'speed',
    camera: 'side tracking shot with repeating window parallax',
    script:
      'The student sprints down the corridor as classroom doors slam behind him.',
    style: 'energetic TV anime, bright school interior, crisp cel shading',
    prompt:
      'Anime student sprinting through a school corridor, side tracking camera, repeating windows create strong parallax, doors closing behind, readable running cycle.',
    whyItWorks:
      'Repeating architecture sells speed even when character motion is modest.',
    tips: [
      'Keep the camera parallel to the corridor.',
      'Use three background depth layers.',
    ],
  }),
  defineRecipe({
    slug: 'mecha-launch',
    title: 'Mecha Launch Bay',
    genre: 'Sci-fi',
    shotType: 'Establishing',
    mood: 'epic',
    duration: 7,
    priority: 'quality',
    camera: 'wide dolly back as the launch rails illuminate',
    script: 'The launch bay opens and the mecha rises through clouds of steam.',
    style:
      'premium mecha anime, industrial scale, volumetric steam, amber warning lights',
    prompt:
      'Massive anime mecha in an industrial launch bay, wide dolly back, sequential rail lights, controlled steam plumes, clear scale references, no camera shake.',
    whyItWorks:
      'Sequential lights create anticipation and communicate the bay depth before launch.',
    tips: [
      'Treat the mecha as mostly static.',
      'Animate lights and steam before full movement.',
    ],
  }),
  defineRecipe({
    slug: 'first-glance-train',
    title: 'First Glance on the Train',
    genre: 'Romance',
    shotType: 'Close-up',
    mood: 'tender',
    duration: 5,
    priority: 'quality',
    camera: 'reflection close-up through the train window',
    script:
      'Their eyes meet in the window reflection while the city slides past.',
    style:
      'soft anime romance, evening train, warm interior against cool city bokeh',
    prompt:
      'Tender anime train-window reflection, two characters make eye contact indirectly, warm carriage light, cool city bokeh drifting outside, subtle rack focus.',
    whyItWorks:
      'The reflection lets both faces share one intimate frame without forced blocking.',
    tips: [
      'Keep reflections simple and aligned.',
      'Use eye movement as the primary action.',
    ],
  }),
  defineRecipe({
    slug: 'umbrella-confession',
    title: 'Umbrella Confession',
    genre: 'Romance',
    shotType: 'Dialogue',
    mood: 'vulnerable',
    duration: 7,
    priority: 'control',
    camera: 'medium two-shot slowly tightening to hands',
    script:
      'Under one umbrella, she admits she waited for him every rainy evening.',
    style:
      'shoujo anime, gentle rain, pastel station lights, delicate expressions',
    prompt:
      'Anime confession beneath one umbrella, medium two-shot, gradual move toward touching hands, gentle rain beyond umbrella edge, restrained emotional expressions.',
    whyItWorks:
      'Moving attention from faces to hands gives the confession a physical payoff.',
    tips: [
      'Keep lips subtle.',
      'Let the hands complete only one small movement.',
    ],
  }),
  defineRecipe({
    slug: 'festival-fireworks',
    title: 'Festival Fireworks Pause',
    genre: 'Romance',
    shotType: 'Reveal',
    mood: 'wonder',
    duration: 6,
    priority: 'quality',
    camera: 'over-shoulder turn into a wide fireworks reveal',
    script:
      'He turns toward her just as the first firework fills the summer sky.',
    style: 'summer festival anime, yukata, lantern warmth, saturated fireworks',
    prompt:
      'Anime summer festival, over-shoulder character turn revealing fireworks and a loved one, lantern-lit foreground, saturated sky, gentle hair motion.',
    whyItWorks:
      'The turn connects a personal reaction to a large visual spectacle in one beat.',
    tips: [
      'Reveal one main firework, not a barrage.',
      'Preserve face exposure against the bright sky.',
    ],
  }),
  defineRecipe({
    slug: 'missed-hand-touch',
    title: 'Almost Touching Hands',
    genre: 'Romance',
    shotType: 'Close-up',
    mood: 'bittersweet',
    duration: 4,
    priority: 'control',
    camera: 'macro close-up tracking parallel to two hands',
    script:
      'Their hands drift together on the bench, then the train announcement interrupts them.',
    style: 'quiet anime drama, shallow depth of field, natural afternoon light',
    prompt:
      'Macro anime close-up of two hands nearly touching on a bench, parallel micro tracking, shallow depth of field, interruption before contact, natural light.',
    whyItWorks:
      'A withheld action creates stronger emotional tension than a completed gesture.',
    tips: [
      'Avoid showing faces.',
      'Keep finger anatomy stable with minimal motion.',
    ],
  }),
  defineRecipe({
    slug: 'goodbye-platform',
    title: 'Platform Goodbye',
    genre: 'Romance',
    shotType: 'Transition',
    mood: 'melancholic',
    duration: 6,
    priority: 'quality',
    camera: 'locked wide shot as a train wipes the frame',
    script:
      'The departing train passes between them; when it clears, only one remains.',
    style:
      'cinematic anime drama, dawn haze, subdued colors, long platform perspective',
    prompt:
      'Locked wide anime train platform goodbye, passing train creates a natural frame wipe, dawn haze, one character absent after the train clears.',
    whyItWorks:
      'The physical wipe performs the emotional transition without dialogue.',
    tips: [
      'Match composition before and after the wipe.',
      'Keep the camera fully locked.',
    ],
  }),
  defineRecipe({
    slug: 'magic-door-discovery',
    title: 'Hidden Magic Door',
    genre: 'Fantasy',
    shotType: 'Reveal',
    mood: 'mysterious',
    duration: 6,
    priority: 'control',
    camera: 'slow orbit from character to glowing doorway',
    script:
      'Runes awaken behind the library shelves and reveal a doorway into another sky.',
    style:
      'fantasy anime, ancient library, teal runes, golden dust, painterly depth',
    prompt:
      'Anime library discovery, slow controlled orbit revealing a rune-lit doorway behind shelves, floating dust, portal shows a different sky, strong depth layers.',
    whyItWorks:
      'The orbit lets the audience discover the portal at the same moment as the character.',
    tips: [
      'Design the portal as a stable keyframe.',
      'Animate rune activation in a clear sequence.',
    ],
  }),
  defineRecipe({
    slug: 'dragon-shadow',
    title: 'Dragon Shadow Over Village',
    genre: 'Fantasy',
    shotType: 'Establishing',
    mood: 'ominous',
    duration: 6,
    priority: 'quality',
    camera: 'high wide shot with shadow crossing foreground to background',
    script:
      'Market noise stops as a vast winged shadow passes over the village.',
    style:
      'epic fantasy anime, mountain village, midday sun, detailed rooftops',
    prompt:
      'High wide anime fantasy village, enormous dragon shadow sweeps across rooftops, villagers pause, clear midday light, shadow motion communicates unseen scale.',
    whyItWorks:
      'Showing only the shadow creates scale cheaply and preserves the creature reveal.',
    tips: [
      'Keep villagers as simple silhouettes.',
      'Move one readable shadow shape across the set.',
    ],
  }),
  defineRecipe({
    slug: 'spell-circle-closeup',
    title: 'Spell Circle Ignition',
    genre: 'Fantasy',
    shotType: 'Close-up',
    mood: 'focused',
    duration: 4,
    priority: 'control',
    camera: 'top-down close-up with a precise radial pullback',
    script: 'Her fingertip touches the seal and concentric spell rings ignite.',
    style:
      'clean magic-system anime, geometric glyphs, violet energy, dark stone floor',
    prompt:
      'Top-down anime hand activating a geometric spell circle, concentric rings illuminate in order, precise radial pullback, stable glyph geometry, violet light.',
    whyItWorks:
      'Ordered concentric motion makes the magic system feel intentional rather than random.',
    tips: ['Use a still design for the glyph.', 'Animate rings one at a time.'],
  }),
  defineRecipe({
    slug: 'forest-spirit-encounter',
    title: 'Forest Spirit Encounter',
    genre: 'Fantasy',
    shotType: 'Dialogue',
    mood: 'serene',
    duration: 7,
    priority: 'quality',
    camera: 'eye-level two-shot with foreground leaves drifting',
    script:
      'The traveler kneels as the ancient forest spirit asks why humans have returned.',
    style: 'lyrical anime fantasy, moss, soft god rays, watercolor foliage',
    prompt:
      'Serene anime traveler meeting an ancient forest spirit, eye-level two-shot, drifting foreground leaves, soft god rays, minimal respectful gestures.',
    whyItWorks:
      'An equal eye line turns a supernatural encounter into an intimate conversation.',
    tips: [
      'Separate spirit glow from sun rays.',
      'Use foreground leaves for depth, not distraction.',
    ],
  }),
  defineRecipe({
    slug: 'flying-city-arrival',
    title: 'Arrival at the Flying City',
    genre: 'Fantasy',
    shotType: 'Establishing',
    mood: 'awe',
    duration: 8,
    priority: 'quality',
    camera: 'aerial reveal rising above a cloud bank',
    script:
      'The airship clears the clouds and an impossible city floats in the sunrise.',
    style:
      'grand adventure anime, floating architecture, sunrise clouds, airships',
    prompt:
      'Anime aerial reveal above clouds, vast floating city at sunrise, airship foreground for scale, slow rise, layered atmospheric depth, stable horizon.',
    whyItWorks:
      'Cloud occlusion hides complexity until the composition is ready for the reveal.',
    tips: [
      'Use one hero structure as the focal point.',
      'Keep the horizon stable.',
    ],
  }),
  defineRecipe({
    slug: 'morning-kitchen-routine',
    title: 'Morning Kitchen Routine',
    genre: 'Slice of life',
    shotType: 'Transition',
    mood: 'cozy',
    duration: 6,
    priority: 'speed',
    camera: 'three quick locked inserts matched by hand motion',
    script: 'Tea pours, toast pops, and a lunchbox clicks shut before school.',
    style:
      'cozy slice-of-life anime, sunlit kitchen, warm wood, gentle cel shading',
    prompt:
      'Anime morning routine montage: tea pouring, toast popping, lunchbox closing, three clean locked inserts, matched hand movement, warm sunlight.',
    whyItWorks:
      'Three simple inserts compress time while making the world feel lived in.',
    tips: [
      'Keep each insert to one action.',
      'Match hand direction between cuts.',
    ],
  }),
  defineRecipe({
    slug: 'convenience-store-night',
    title: 'Convenience Store at Night',
    genre: 'Slice of life',
    shotType: 'Establishing',
    mood: 'quiet',
    duration: 6,
    priority: 'cost',
    camera: 'static exterior wide with small interior gestures',
    script:
      'After the last train, two friends share instant noodles outside the only open store.',
    style:
      'late-night anime realism, fluorescent store, humid street, restrained palette',
    prompt:
      'Static wide anime convenience store at night, two friends eating outside, fluorescent interior glow, humid empty street, subtle steam and small gestures.',
    whyItWorks:
      'A static composition makes tiny character actions feel authentic and inexpensive to animate.',
    tips: [
      'Animate steam and one gesture.',
      'Preserve strong interior-exterior exposure contrast.',
    ],
  }),
  defineRecipe({
    slug: 'cat-at-window',
    title: 'Cat at the Classroom Window',
    genre: 'Slice of life',
    shotType: 'Close-up',
    mood: 'playful',
    duration: 4,
    priority: 'speed',
    camera: 'desk-level push toward the cat entering frame',
    script:
      'A stray cat appears at the open window and interrupts the silent exam.',
    style:
      'bright school anime, spring breeze, soft colors, expressive reaction timing',
    prompt:
      'Playful anime classroom, desk-level slow push as a cat pops into the open window, papers flutter, students react subtly, clean comedic timing.',
    whyItWorks:
      'The calm push sets up a small surprise that reads without dialogue.',
    tips: [
      'Keep the cat entrance short.',
      'Use paper motion to sell the breeze.',
    ],
  }),
  defineRecipe({
    slug: 'bicycle-riverbank',
    title: 'Bicycle Riverbank Ride',
    genre: 'Slice of life',
    shotType: 'Transition',
    mood: 'free',
    duration: 6,
    priority: 'speed',
    camera: 'side tracking with grass foreground and city background parallax',
    script:
      'She pedals along the riverbank, finally free after the last school bell.',
    style: 'youth anime, golden afternoon, river sparkle, airy summer color',
    prompt:
      'Anime bicycle ride along a riverbank, smooth side tracking, foreground grass and distant city parallax, golden afternoon light, relaxed cycling loop.',
    whyItWorks:
      'Layered lateral parallax creates movement while the character cycle stays simple.',
    tips: [
      'Loop the pedal motion cleanly.',
      'Use three distinct parallax speeds.',
    ],
  }),
  defineRecipe({
    slug: 'empty-clubroom',
    title: 'Last Light in the Clubroom',
    genre: 'Slice of life',
    shotType: 'Dialogue',
    mood: 'nostalgic',
    duration: 7,
    priority: 'control',
    camera: 'wide two-shot slowly drifting toward an empty chair',
    script:
      'The graduating members pack their final box and notice the empty president chair.',
    style:
      'nostalgic anime, dusty sunset beams, school clubroom, muted warm tones',
    prompt:
      'Nostalgic anime clubroom at sunset, two students pack a box, slow drift toward an empty chair, dusty light beams, restrained expressions.',
    whyItWorks:
      'The camera makes an object carry the absent character’s emotional weight.',
    tips: [
      'Establish the empty chair early.',
      'Keep dialogue gestures understated.',
    ],
  }),
  defineRecipe({
    slug: 'hologram-message',
    title: 'Interrupted Hologram Message',
    genre: 'Sci-fi',
    shotType: 'Dialogue',
    mood: 'urgent',
    duration: 6,
    priority: 'control',
    camera: 'tight over-shoulder with signal distortion pushes',
    script:
      'The commander warns them to abort, but the transmission breaks before the reason.',
    style:
      'military sci-fi anime, blue hologram, dark cockpit, practical interface glow',
    prompt:
      'Anime cockpit hologram warning, tight over-shoulder, commander image distorts in controlled pulses, interface glow, transmission cuts at the key sentence.',
    whyItWorks:
      'Signal failures create edits and suspense while hiding difficult facial continuity.',
    tips: [
      'Use distortion only at story beats.',
      'Keep cockpit UI static and legible.',
    ],
  }),
  defineRecipe({
    slug: 'cyberpunk-alley-arrival',
    title: 'Cyberpunk Alley Arrival',
    genre: 'Sci-fi',
    shotType: 'Reveal',
    mood: 'dangerous',
    duration: 5,
    priority: 'quality',
    camera: 'ground-level puddle reflection tilt to subject',
    script:
      'A courier lands in the alley; her reflection appears before we see her face.',
    style:
      'cyberpunk anime, rain, magenta signage, wet asphalt, dense atmosphere',
    prompt:
      'Cyberpunk anime alley, begin on puddle reflection of a courier landing, tilt up to reveal face, magenta neon, rain ripples, controlled landing pose.',
    whyItWorks:
      'The reflection gives the entrance a distinctive reveal and doubles environmental context.',
    tips: [
      'Match reflection timing to the subject.',
      'Limit neon colors to two families.',
    ],
  }),
  defineRecipe({
    slug: 'spaceship-window-silence',
    title: 'Silence at the Observation Window',
    genre: 'Sci-fi',
    shotType: 'Establishing',
    mood: 'lonely',
    duration: 7,
    priority: 'quality',
    camera: 'very slow pullback from face to vast window',
    script: 'The pilot watches Earth shrink and deletes an unsent message.',
    style:
      'meditative space anime, dark observation deck, Earth glow, sparse design',
    prompt:
      'Meditative anime pilot at an observation window, very slow pullback revealing tiny Earth, screen message fades, sparse dark interior, soft rim light.',
    whyItWorks:
      'The pullback converts a private decision into a visual statement about distance.',
    tips: [
      'Keep Earth motion almost imperceptible.',
      'Use one screen fade as the action.',
    ],
  }),
  defineRecipe({
    slug: 'android-memory-flash',
    title: 'Android Memory Flash',
    genre: 'Sci-fi',
    shotType: 'Transition',
    mood: 'fragmented',
    duration: 5,
    priority: 'control',
    camera: 'match cuts between eye, flower, and damaged circuit',
    script:
      'The android sees a flower and remembers a garden that never existed.',
    style: 'poetic sci-fi anime, high-key memory fragments, chromatic glitches',
    prompt:
      'Anime android memory flash: eye close-up match-cuts to white flower and damaged circuit, precise composition matching, brief chromatic glitches, dreamlike exposure.',
    whyItWorks:
      'Graphic match cuts imply memory association without explaining it literally.',
    tips: [
      'Align the circular shapes.',
      'Keep glitches shorter than memory images.',
    ],
  }),
  defineRecipe({
    slug: 'zero-gravity-rescue',
    title: 'Zero-Gravity Rescue',
    genre: 'Sci-fi',
    shotType: 'Action',
    mood: 'suspenseful',
    duration: 6,
    priority: 'control',
    camera: 'slow roll around two tethered characters',
    script:
      'Her tether snaps; the mechanic launches a tool cable and catches her glove.',
    style:
      'realistic space anime, hard sunlight, detailed suits, deep star field',
    prompt:
      'Anime zero-gravity rescue, slow camera roll, two astronauts connected by a launched tool cable, clear silhouettes, hard sunlight, one readable catch action.',
    whyItWorks:
      'A slow roll conveys zero gravity while keeping the rescue action understandable.',
    tips: [
      'Storyboard the tether line clearly.',
      'Avoid fast multi-axis tumbling.',
    ],
  }),
  defineRecipe({
    slug: 'villain-eye-reveal',
    title: 'Villain Eye Reveal',
    genre: 'Action',
    shotType: 'Close-up',
    mood: 'menacing',
    duration: 4,
    priority: 'control',
    camera: 'extreme close-up emerging from shadow',
    script:
      'A single eye opens in the smoke as the villain recognizes the hero.',
    style: 'dark battle anime, ember smoke, high contrast, precise eye detail',
    prompt:
      'Extreme anime eye close-up emerging from smoky shadow, ember reflections, minimal eyelid movement, slow focus lock, high contrast villain reveal.',
    whyItWorks:
      'One controlled facial feature communicates recognition without risking a full character shot.',
    tips: ['Use a face reference crop.', 'Keep smoke behind the eye contour.'],
  }),
  defineRecipe({
    slug: 'after-school-vending-machine',
    title: 'After-School Vending Machine',
    genre: 'Slice of life',
    shotType: 'Dialogue',
    mood: 'awkward',
    duration: 6,
    priority: 'cost',
    camera: 'locked medium two-shot divided by vending machine light',
    script: 'He offers her the wrong drink, and both pretend not to notice.',
    style: 'subtle school anime, dusk, vending machine glow, quiet street',
    prompt:
      'Awkward anime two-shot beside a vending machine at dusk, locked camera, wrong drink held between characters, small eye movements, cool machine glow.',
    whyItWorks:
      'A locked frame lets timing and tiny reactions carry the comedy.',
    tips: [
      'Use the can as the visual focal point.',
      'Do not overanimate expressions.',
    ],
  }),
  defineRecipe({
    slug: 'battlefield-calm-before-storm',
    title: 'Calm Before the Battle',
    genre: 'Action',
    shotType: 'Establishing',
    mood: 'foreboding',
    duration: 7,
    priority: 'quality',
    camera: 'wide lateral drift across abandoned weapons',
    script:
      'Wind moves through the empty field while two armies wait beyond the fog.',
    style: 'epic war anime, desaturated field, low fog, torn banners',
    prompt:
      'Wide anime battlefield before combat, lateral drift past abandoned weapons and torn banners, armies as distant silhouettes beyond fog, wind-driven grass.',
    whyItWorks:
      'Environmental evidence promises scale without animating the battle itself.',
    tips: [
      'Use foreground weapons for parallax.',
      'Keep armies abstract in fog.',
    ],
  }),
  defineRecipe({
    slug: 'time-loop-clock',
    title: 'Time Loop Reset',
    genre: 'Sci-fi',
    shotType: 'Transition',
    mood: 'unsettling',
    duration: 5,
    priority: 'control',
    camera: 'identical push-in repeated with one changed detail',
    script:
      'The station clock reaches midnight, flickers, and the same commuter walks past again.',
    style:
      'psychological sci-fi anime, sterile station, green clock glow, subtle distortion',
    prompt:
      'Anime station time loop, repeat identical slow push toward midnight clock, same commuter crosses twice, one bag detail changes, brief light flicker reset.',
    whyItWorks:
      'Near-identical repetition lets the viewer detect the loop through one deliberate anomaly.',
    tips: ['Lock the camera path exactly.', 'Change only one readable prop.'],
  }),
  defineRecipe({
    slug: 'moonlit-balcony-promise',
    title: 'Moonlit Balcony Promise',
    genre: 'Romance',
    shotType: 'Dialogue',
    mood: 'hopeful',
    duration: 7,
    priority: 'quality',
    camera: 'profile two-shot with a slow moonward tilt',
    script: 'They promise to meet again when the twin moons align.',
    style:
      'fantasy romance anime, moonlit palace, silver-blue palette, soft fabric motion',
    prompt:
      'Anime fantasy romance on a moonlit balcony, profile two-shot, slow tilt toward twin moons after the promise, silver-blue rim light, gentle fabric motion.',
    whyItWorks:
      'The upward tilt turns spoken commitment into a memorable shared symbol.',
    tips: [
      'Hold faces before tilting.',
      'Keep moon positions fixed and clear.',
    ],
  }),
];

export function getAnimeShotRecipe(slug: string) {
  return animeShotRecipes.find((recipe) => recipe.slug === slug);
}

export function getRelatedRecipes(recipe: AnimeShotRecipe) {
  return animeShotRecipes
    .filter(
      (candidate) =>
        candidate.slug !== recipe.slug &&
        (candidate.genre === recipe.genre ||
          candidate.shotType === recipe.shotType),
    )
    .slice(0, 3);
}
