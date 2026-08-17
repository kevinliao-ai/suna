import type { AnimeDirectorShot } from './anime-director.ts';
import {
  getContinuityAssetsForShot,
  type DirectorContinuityAsset,
  type DirectorContinuityBindings,
  type DirectorContinuityReview,
  type DirectorContinuityReviews,
} from './director-continuity.ts';
import {
  generationVersions,
  resolveGenerationSelection,
  type DirectorGenerationSelections,
  type GenerationTask,
} from './generation/task-history.ts';

export type ProductionReadiness =
  'ready' | 'missing_output' | 'needs_revision' | 'awaiting_review';
export type ProductionBoardFilter =
  'all' | 'ready' | 'action_required' | 'missing_output';

export interface DirectorProductionRow {
  shot: AnimeDirectorShot;
  position: number;
  finalReference: GenerationTask | null;
  finalVideo: GenerationTask | null;
  continuityAssets: DirectorContinuityAsset[];
  review: DirectorContinuityReview | null;
  readiness: ProductionReadiness;
}

export function buildDirectorProductionRows(
  shots: AnimeDirectorShot[],
  tasks: GenerationTask[],
  selections: DirectorGenerationSelections,
  assets: DirectorContinuityAsset[],
  bindings: DirectorContinuityBindings,
  reviews: DirectorContinuityReviews,
): DirectorProductionRow[] {
  return shots.map((shot, index) => {
    const selectedReferenceTaskId = selections[shot.id]?.reference;
    const selectedVideoTaskId = selections[shot.id]?.video;
    const resolvedReference = selectedReferenceTaskId
      ? resolveGenerationSelection(
          generationVersions(tasks, shot.id, 'reference'),
          selectedReferenceTaskId,
        )
      : null;
    const resolvedVideo = selectedVideoTaskId
      ? resolveGenerationSelection(
          generationVersions(tasks, shot.id, 'video'),
          selectedVideoTaskId,
        )
      : null;
    const finalReference =
      resolvedReference?.id === selectedReferenceTaskId
        ? resolvedReference
        : null;
    const finalVideo =
      resolvedVideo?.id === selectedVideoTaskId ? resolvedVideo : null;
    const review = reviews[shot.id] || null;
    const readiness: ProductionReadiness =
      !finalReference || !finalVideo
        ? 'missing_output'
        : review?.status === 'needs_revision'
          ? 'needs_revision'
          : review?.status === 'approved'
            ? 'ready'
            : 'awaiting_review';

    return {
      shot,
      position: index + 1,
      finalReference,
      finalVideo,
      continuityAssets: getContinuityAssetsForShot(assets, bindings, shot.id),
      review,
      readiness,
    };
  });
}

export function productionReadinessSummary(rows: DirectorProductionRow[]) {
  return {
    total: rows.length,
    ready: rows.filter((row) => row.readiness === 'ready').length,
    missingOutput: rows.filter((row) => row.readiness === 'missing_output')
      .length,
    needsRevision: rows.filter((row) => row.readiness === 'needs_revision')
      .length,
    awaitingReview: rows.filter((row) => row.readiness === 'awaiting_review')
      .length,
  };
}

export function filterProductionRows(
  rows: DirectorProductionRow[],
  filter: ProductionBoardFilter,
) {
  if (filter === 'all') return rows;
  if (filter === 'action_required') {
    return rows.filter((row) => row.readiness !== 'ready');
  }
  return rows.filter((row) => row.readiness === filter);
}

export function serializeProductionManifest({
  projectId,
  projectTitle,
  rows,
  exportedAt = new Date().toISOString(),
}: {
  projectId: string;
  projectTitle: string;
  rows: DirectorProductionRow[];
  exportedAt?: string;
}) {
  return JSON.stringify(
    {
      product: 'anisora-director-production-manifest',
      version: 1,
      exportedAt,
      project: { id: projectId, title: projectTitle },
      readiness: productionReadinessSummary(rows),
      shots: rows.map((row) => ({
        id: row.shot.id,
        position: row.position,
        title: row.shot.title,
        durationSeconds: row.shot.durationSeconds,
        camera: row.shot.camera,
        beat: row.shot.beat,
        visualPrompt: row.shot.visualPrompt,
        voicePrompt: row.shot.voicePrompt,
        finalReference: row.finalReference
          ? {
              taskId: row.finalReference.id,
              url: row.finalReference.mediaUrl,
            }
          : null,
        finalVideo: row.finalVideo
          ? { taskId: row.finalVideo.id, url: row.finalVideo.mediaUrl }
          : null,
        continuityAssets: row.continuityAssets.map((asset) => ({
          id: asset.id,
          kind: asset.kind,
          name: asset.name,
          description: asset.description,
          visualAnchors: asset.visualAnchors,
          negativeConstraints: asset.negativeConstraints,
          referenceTaskId: asset.referenceTaskId || null,
        })),
        continuityReview: row.review,
        readiness: row.readiness,
      })),
    },
    null,
    2,
  );
}
