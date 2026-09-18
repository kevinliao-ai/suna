import type { SavedDirectorProject } from './anime-director-projects.ts';

const handoffIdPattern = /^[a-z0-9][a-z0-9_-]{0,127}$/i;

export interface DirectorProjectProgress {
  projectId: string;
  title: string;
  shotCount: number;
  estimatedSeconds: number;
  finalTakeCount: number;
  reviewedShotCount: number;
  needsRevisionCount: number;
  roughCutReady: boolean;
  updatedAt: string;
}

export function readStudioHandoffId(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const candidate = value.trim();
  return handoffIdPattern.test(candidate) ? candidate : undefined;
}

export function getLinkedDirectorProjects(
  projects: SavedDirectorProject[],
  studioProjectId: string,
) {
  return projects.filter(
    (project) => project.studioProjectId === studioProjectId,
  );
}

export function summarizeDirectorProject(
  project: SavedDirectorProject,
): DirectorProjectProgress {
  const shotIds = new Set(project.plan.shots.map((shot) => shot.id));
  const finalTakeCount = project.plan.shots.filter(
    (shot) => project.selectedGenerationTaskIds?.[shot.id]?.video,
  ).length;
  const reviews = Object.entries(project.continuityReviews || {}).filter(
    ([shotId]) => shotIds.has(shotId),
  );

  return {
    projectId: project.id,
    title: project.title,
    shotCount: project.plan.shots.length,
    estimatedSeconds: project.plan.estimatedSeconds,
    finalTakeCount,
    reviewedShotCount: reviews.length,
    needsRevisionCount: reviews.filter(
      ([, review]) => review.status === 'needs_revision',
    ).length,
    roughCutReady:
      project.plan.shots.length > 0 &&
      finalTakeCount === project.plan.shots.length,
    updatedAt: project.updatedAt,
  };
}

export function buildDirectorHandoffHref(
  studioProjectId: string,
  directorProjectId?: string,
) {
  const params = new URLSearchParams({
    source: 'studio',
    studioProject: studioProjectId,
  });
  if (directorProjectId) params.set('directorProject', directorProjectId);
  return `/dashboard/director?${params.toString()}`;
}
