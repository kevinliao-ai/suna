import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildDirectorRoughCutTimeline,
  formatEditTimecode,
  roughCutSummary,
  serializeRoughCutEdl,
} from '../src/lib/director-rough-cut.ts';

function productionRow(position, durationSeconds, withVideo = true) {
  return {
    shot: {
      id: `shot-${position}`,
      title: position === 2 ? 'Train, "Arrival"' : `Shot ${position}`,
      beat: 'Story beat',
      durationSeconds,
      camera: 'Medium tracking shot',
      visualPrompt: 'Cinematic anime',
      voicePrompt: 'Ambient sound',
      route: 'Reference image → image-to-video',
      checklist: [],
    },
    position,
    finalReference: null,
    finalVideo: withVideo
      ? {
          id: `${String(position).padStart(8, '0')}-1111-4111-8111-111111111111`,
          provider: 'fal',
          shotId: `shot-${position}`,
          kind: 'video',
          status: 'done',
          mediaUrl: `https://cdn.example.com/shot-${position}.mp4`,
          archiveStatus: 'stored',
          errorMessage: null,
          requiredCredits: 20,
          estimatedCostUsd: 0.1,
          createdAt: '2026-08-17T10:00:00Z',
        }
      : null,
    continuityAssets: [],
    review: null,
    readiness: withVideo ? 'awaiting_review' : 'missing_output',
  };
}

const clips = buildDirectorRoughCutTimeline([
  productionRow(1, 4),
  productionRow(2, 7),
  productionRow(3, 3, false),
]);

test('rough-cut timeline preserves order, gaps, and the five-second source limit', () => {
  assert.deepEqual(
    clips.map((clip) => ({
      position: clip.position,
      start: clip.timelineStartSeconds,
      end: clip.timelineEndSeconds,
      edit: clip.editDurationSeconds,
      status: clip.status,
    })),
    [
      { position: 1, start: 0, end: 4, edit: 4, status: 'playable' },
      {
        position: 2,
        start: 4,
        end: 9,
        edit: 5,
        status: 'duration_extension_required',
      },
      {
        position: 3,
        start: 9,
        end: 12,
        edit: 3,
        status: 'missing_video',
      },
    ],
  );
  assert.deepEqual(roughCutSummary(clips), {
    shotCount: 3,
    playableCount: 2,
    missingCount: 1,
    extensionRequiredCount: 1,
    plannedDurationSeconds: 14,
    timelineDurationSeconds: 12,
    playableDurationSeconds: 9,
    gapDurationSeconds: 3,
  });
});

test('edit timecode is deterministic at thirty frames per second', () => {
  assert.equal(formatEditTimecode(0), '00:00:00:00');
  assert.equal(formatEditTimecode(4.5), '00:00:04:15');
  assert.equal(formatEditTimecode(3661), '01:01:01:00');
  assert.equal(formatEditTimecode(-5), '00:00:00:00');
});

test('EDL CSV escapes creative text and includes gaps without fake media', () => {
  const csv = serializeRoughCutEdl({
    projectId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    projectTitle: 'Sky, Train',
    clips,
  });
  const lines = csv.split('\r\n');

  assert.equal(lines.length, 4);
  assert.match(lines[0], /timeline_in,timeline_out/);
  assert.match(lines[1], /00:00:00:00,00:00:04:00/);
  assert.match(lines[2], /"Sky, Train"/);
  assert.match(lines[2], /"Train, ""Arrival"""/);
  assert.match(lines[2], /duration_extension_required/);
  assert.match(lines[3], /missing_video/);
  assert.doesNotMatch(lines[3], /shot-3\.mp4/);
});

test('rough-cut UI supports sequential playback and private local export', async () => {
  const player = await readFile(
    new URL(
      '../src/components/anime-director/director-rough-cut-player.tsx',
      import.meta.url,
    ),
    'utf8',
  );
  assert.match(player, /Play rough cut/);
  assert.match(player, /Export EDL CSV/);
  assert.match(player, /onTimeUpdate/);
  assert.match(player, /duration_extension_required/);

  for (const eventName of [
    'director_rough_cut_played',
    'director_rough_cut_edl_exported',
    'director_rough_cut_clip_selected',
  ]) {
    const start = player.indexOf(`posthog.capture('${eventName}'`);
    const end = player.indexOf('});', start);
    assert.notEqual(start, -1);
    assert.doesNotMatch(
      player.slice(start, end),
      /projectTitle|title|prompt|note|mediaUrl|taskId|url/,
    );
  }
});
