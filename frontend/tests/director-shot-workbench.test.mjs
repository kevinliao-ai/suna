import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createAnimeDirectorPlan } from '../src/lib/anime-director.ts';
import {
  appendDirectorShot,
  duplicateDirectorShot,
  MAX_DIRECTOR_SHOTS,
  moveDirectorShot,
  recalculateDirectorPlan,
  removeDirectorShot,
  updateDirectorShot,
} from '../src/lib/director-shot-workbench.ts';

function makePlan(priority = 'control') {
  return createAnimeDirectorPlan({
    script: 'The hero enters.\nThe rival turns.\nThey draw their swords.',
    projectTitle: 'Duel',
    style: 'cinematic anime',
    priority,
  });
}

test('shots reorder within bounds without mutating the original list', () => {
  const shots = makePlan().shots;
  const moved = moveDirectorShot(shots, shots[1].id, -1);

  assert.deepEqual(
    moved.map((shot) => shot.id),
    [shots[1].id, shots[0].id, shots[2].id],
  );
  assert.deepEqual(
    shots.map((shot) => shot.id),
    ['shot-1', 'shot-2', 'shot-3'],
  );
  assert.equal(moveDirectorShot(shots, shots[0].id, -1), shots);
});

test('duplicate inserts a separately editable shot after its source', () => {
  const shots = makePlan().shots;
  const duplicated = duplicateDirectorShot(shots, shots[0].id, () => 'copy-id');

  assert.equal(duplicated.length, 4);
  assert.equal(duplicated[1].id, 'shot-copy-id');
  assert.equal(duplicated[1].title, `${shots[0].title} copy`);
  assert.notEqual(duplicated[1].checklist, shots[0].checklist);
});

test('a Director plan always keeps at least one shot', () => {
  const onlyShot = makePlan().shots.slice(0, 1);
  assert.equal(removeDirectorShot(onlyShot, onlyShot[0].id), onlyShot);

  const severalShots = makePlan().shots;
  assert.equal(removeDirectorShot(severalShots, severalShots[1].id).length, 2);
});

test('duration edits are rounded and clamped to a safe provider range', () => {
  const shots = makePlan().shots;
  assert.equal(
    updateDirectorShot(shots, shots[0].id, { durationSeconds: 42.4 })[0]
      .durationSeconds,
    30,
  );
  assert.equal(
    updateDirectorShot(shots, shots[0].id, { durationSeconds: 0 })[0]
      .durationSeconds,
    1,
  );
});

test('workbench caps projects at twenty shots', () => {
  let shots = makePlan().shots;
  while (shots.length < MAX_DIRECTOR_SHOTS) {
    shots = appendDirectorShot(shots, 'control', () => `id-${shots.length}`);
  }

  assert.equal(shots.length, MAX_DIRECTOR_SHOTS);
  assert.equal(appendDirectorShot(shots, 'control'), shots);
  assert.equal(duplicateDirectorShot(shots, shots[0].id), shots);
});

test('runtime and render budget update after shot edits', () => {
  const generatedPlan = makePlan('quality');
  const editedShots = generatedPlan.shots.slice(0, 2).map((shot, index) => ({
    ...shot,
    durationSeconds: index === 0 ? 7 : 9,
  }));
  const plan = recalculateDirectorPlan(generatedPlan, editedShots);

  assert.equal(plan.estimatedSeconds, 16);
  assert.equal(plan.estimatedTestRenders, 6);
  assert.equal(plan.shots[0].route, plan.shots[1].route);
});

test('the workbench exposes core controls and analytics omit creative text', async () => {
  const source = await readFile(
    new URL(
      '../src/components/anime-director/director-planner.tsx',
      import.meta.url,
    ),
    'utf8',
  );

  assert.match(source, /Shot workbench/);
  assert.match(source, /Rebuild from script/);
  assert.match(source, /director_shot_(edited|added|moved|duplicated|removed)/);
  const eventStart = source.indexOf("posthog.capture('director_shot_edited'");
  const eventEnd = source.indexOf('});', eventStart);
  const eventPayload = source.slice(eventStart, eventEnd);
  assert.doesNotMatch(eventPayload, /visualPrompt|voicePrompt|beat|script/);
});
