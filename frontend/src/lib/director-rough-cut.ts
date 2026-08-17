import type { DirectorProductionRow } from './director-production.ts';

export const GENERATED_VIDEO_SECONDS = 5;
export const EDIT_TIMELINE_FPS = 30;

export interface DirectorRoughCutClip {
  shotId: string;
  position: number;
  title: string;
  plannedDurationSeconds: number;
  editDurationSeconds: number;
  timelineStartSeconds: number;
  timelineEndSeconds: number;
  videoTaskId: string | null;
  videoUrl: string | null;
  status: 'playable' | 'missing_video' | 'duration_extension_required';
}

function safeDuration(value: number) {
  return Number.isFinite(value) ? Math.max(1, Math.min(30, value)) : 1;
}

export function buildDirectorRoughCutTimeline(
  rows: DirectorProductionRow[],
): DirectorRoughCutClip[] {
  let cursor = 0;
  return rows.map((row) => {
    const plannedDurationSeconds = safeDuration(row.shot.durationSeconds);
    const hasVideo = Boolean(row.finalVideo?.mediaUrl);
    const editDurationSeconds = hasVideo
      ? Math.min(plannedDurationSeconds, GENERATED_VIDEO_SECONDS)
      : plannedDurationSeconds;
    const status = !hasVideo
      ? 'missing_video'
      : plannedDurationSeconds > GENERATED_VIDEO_SECONDS
        ? 'duration_extension_required'
        : 'playable';
    const clip: DirectorRoughCutClip = {
      shotId: row.shot.id,
      position: row.position,
      title: row.shot.title,
      plannedDurationSeconds,
      editDurationSeconds,
      timelineStartSeconds: cursor,
      timelineEndSeconds: cursor + editDurationSeconds,
      videoTaskId: row.finalVideo?.id || null,
      videoUrl: row.finalVideo?.mediaUrl || null,
      status,
    };
    cursor = clip.timelineEndSeconds;
    return clip;
  });
}

export function roughCutSummary(clips: DirectorRoughCutClip[]) {
  return {
    shotCount: clips.length,
    playableCount: clips.filter((clip) => clip.videoUrl).length,
    missingCount: clips.filter((clip) => clip.status === 'missing_video')
      .length,
    extensionRequiredCount: clips.filter(
      (clip) => clip.status === 'duration_extension_required',
    ).length,
    plannedDurationSeconds: clips.reduce(
      (total, clip) => total + clip.plannedDurationSeconds,
      0,
    ),
    timelineDurationSeconds: clips.reduce(
      (total, clip) => total + clip.editDurationSeconds,
      0,
    ),
    playableDurationSeconds: clips.reduce(
      (total, clip) => total + (clip.videoUrl ? clip.editDurationSeconds : 0),
      0,
    ),
    gapDurationSeconds: clips.reduce(
      (total, clip) =>
        total +
        (clip.status === 'missing_video' ? clip.editDurationSeconds : 0),
      0,
    ),
  };
}

export function formatEditTimecode(seconds: number, fps = EDIT_TIMELINE_FPS) {
  const safeFps = Number.isFinite(fps) ? Math.max(1, Math.round(fps)) : 30;
  const totalFrames = Math.max(0, Math.round(seconds * safeFps));
  const frames = totalFrames % safeFps;
  const totalSeconds = Math.floor(totalFrames / safeFps);
  const secs = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return [hours, minutes, secs, frames]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function csvCell(value: string | number | null) {
  const text = value === null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function serializeRoughCutEdl({
  projectId,
  projectTitle,
  clips,
}: {
  projectId: string;
  projectTitle: string;
  clips: DirectorRoughCutClip[];
}) {
  const header = [
    'event',
    'project_id',
    'project_title',
    'shot_id',
    'shot_title',
    'video_task_id',
    'video_url',
    'source_in',
    'source_out',
    'timeline_in',
    'timeline_out',
    'planned_seconds',
    'edit_seconds',
    'status',
  ];
  const rows = clips.map((clip, index) => [
    index + 1,
    projectId,
    projectTitle,
    clip.shotId,
    clip.title,
    clip.videoTaskId,
    clip.videoUrl,
    formatEditTimecode(0),
    formatEditTimecode(clip.videoUrl ? clip.editDurationSeconds : 0),
    formatEditTimecode(clip.timelineStartSeconds),
    formatEditTimecode(clip.timelineEndSeconds),
    clip.plannedDurationSeconds,
    clip.editDurationSeconds,
    clip.status,
  ]);
  return [header, ...rows]
    .map((row) => row.map((value) => csvCell(value)).join(','))
    .join('\r\n');
}
