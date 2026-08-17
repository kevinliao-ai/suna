import {
  getDirectorRoute,
  type AnimeDirectorPlan,
  type AnimeDirectorShot,
  type ShotPriority,
} from './anime-director.ts';

export const MIN_SHOT_DURATION_SECONDS = 1;
export const MAX_SHOT_DURATION_SECONDS = 30;
export const MAX_DIRECTOR_SHOTS = 20;

type ShotPatch = Partial<
  Pick<
    AnimeDirectorShot,
    | 'title'
    | 'beat'
    | 'durationSeconds'
    | 'camera'
    | 'visualPrompt'
    | 'voicePrompt'
  >
>;

function clampDuration(value: number) {
  if (!Number.isFinite(value)) return MIN_SHOT_DURATION_SECONDS;
  return Math.min(
    MAX_SHOT_DURATION_SECONDS,
    Math.max(MIN_SHOT_DURATION_SECONDS, Math.round(value)),
  );
}

export function cloneDirectorShots(shots: AnimeDirectorShot[]) {
  return shots.map((shot) => ({
    ...shot,
    checklist: [...shot.checklist],
  }));
}

export function updateDirectorShot(
  shots: AnimeDirectorShot[],
  shotId: string,
  patch: ShotPatch,
) {
  return shots.map((shot) => {
    if (shot.id !== shotId) return shot;

    return {
      ...shot,
      ...patch,
      durationSeconds:
        patch.durationSeconds === undefined
          ? shot.durationSeconds
          : clampDuration(patch.durationSeconds),
    };
  });
}

export function moveDirectorShot(
  shots: AnimeDirectorShot[],
  shotId: string,
  direction: -1 | 1,
) {
  const index = shots.findIndex((shot) => shot.id === shotId);
  const destination = index + direction;
  if (index < 0 || destination < 0 || destination >= shots.length) return shots;

  const reordered = [...shots];
  [reordered[index], reordered[destination]] = [
    reordered[destination],
    reordered[index],
  ];
  return reordered;
}

export function duplicateDirectorShot(
  shots: AnimeDirectorShot[],
  shotId: string,
  createId: () => string = () => crypto.randomUUID(),
) {
  if (shots.length >= MAX_DIRECTOR_SHOTS) return shots;
  const index = shots.findIndex((shot) => shot.id === shotId);
  if (index < 0) return shots;

  const source = shots[index];
  const duplicate: AnimeDirectorShot = {
    ...source,
    id: `shot-${createId()}`,
    title: `${source.title} copy`.slice(0, 120),
    checklist: [...source.checklist],
  };

  return [...shots.slice(0, index + 1), duplicate, ...shots.slice(index + 1)];
}

export function removeDirectorShot(shots: AnimeDirectorShot[], shotId: string) {
  if (shots.length <= 1) return shots;
  return shots.filter((shot) => shot.id !== shotId);
}

export function appendDirectorShot(
  shots: AnimeDirectorShot[],
  priority: ShotPriority,
  createId: () => string = () => crypto.randomUUID(),
) {
  if (shots.length >= MAX_DIRECTOR_SHOTS) return shots;
  const shotNumber = shots.length + 1;

  return [
    ...shots,
    {
      id: `shot-${createId()}`,
      title: `Shot ${shotNumber}: New beat`,
      beat: 'Describe what changes in this shot.',
      durationSeconds: 4,
      camera: 'Choose a camera angle and movement.',
      visualPrompt:
        'Describe the subject, action, setting, lighting, composition, and continuity constraints.',
      voicePrompt: 'Describe dialogue, emotion, pacing, or ambient sound.',
      route: getDirectorRoute(priority),
      checklist: [
        'Attach character or scene reference before generation.',
        'Run a short draft before spending on final quality.',
        'Save usable output link back into AniSora Studio assets.',
      ],
    },
  ];
}

export function recalculateDirectorPlan(
  generatedPlan: AnimeDirectorPlan,
  shots: AnimeDirectorShot[],
): AnimeDirectorPlan {
  const normalizedShots = shots.map((shot) => ({
    ...shot,
    durationSeconds: clampDuration(shot.durationSeconds),
    route: getDirectorRoute(generatedPlan.priority),
  }));

  return {
    ...generatedPlan,
    shots: normalizedShots,
    estimatedSeconds: normalizedShots.reduce(
      (total, shot) => total + shot.durationSeconds,
      0,
    ),
    estimatedTestRenders:
      normalizedShots.length *
      (generatedPlan.priority === 'quality' ||
      generatedPlan.priority === 'control'
        ? 3
        : 2),
  };
}
