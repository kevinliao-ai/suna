export type GenerationKind = 'reference' | 'video';
export type GenerationTaskStatus = 'todo' | 'running' | 'done' | 'failed';

export interface GenerationTask {
  id: string;
  provider: 'fal' | 'simulation';
  shotId: string;
  kind: GenerationKind;
  status: GenerationTaskStatus;
  mediaUrl: string | null;
  archiveStatus: string | null;
  errorMessage: string | null;
  requiredCredits: number | null;
  estimatedCostUsd: number | null;
  createdAt: string;
}

export type DirectorGenerationSelections = Record<
  string,
  Partial<Record<GenerationKind, string>>
>;

export function isDirectorShotId(value: unknown): value is string {
  return (
    typeof value === 'string' && /^shot-[a-z0-9][a-z0-9-]{0,63}$/i.test(value)
  );
}

export function readSavedDirectorShotPrompt(settings: unknown, shotId: string) {
  if (!settings || typeof settings !== 'object') return null;
  const director = (settings as { director?: unknown }).director;
  if (!director || typeof director !== 'object') return null;
  const plan = (director as { plan?: unknown }).plan;
  if (!plan || typeof plan !== 'object') return null;
  const shots = (plan as { shots?: unknown }).shots;
  if (!Array.isArray(shots)) return null;

  const shot = shots.find(
    (candidate) =>
      candidate &&
      typeof candidate === 'object' &&
      (candidate as { id?: unknown }).id === shotId,
  ) as { visualPrompt?: unknown } | undefined;
  return typeof shot?.visualPrompt === 'string'
    ? shot.visualPrompt.trim()
    : null;
}

export function generationTaskMatchesReference(
  row: { input: unknown; output: unknown },
  shotId: string,
  imageUrl: string,
) {
  const input =
    row.input && typeof row.input === 'object'
      ? (row.input as { shotId?: unknown; kind?: unknown })
      : {};
  const output =
    row.output && typeof row.output === 'object'
      ? (row.output as { mediaUrl?: unknown })
      : {};
  return (
    input.shotId === shotId &&
    input.kind === 'reference' &&
    output.mediaUrl === imageUrl
  );
}

function finiteNonNegative(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export function readGenerationTask(row: {
  id: string;
  provider: string | null;
  status: string;
  input: unknown;
  output: unknown;
  error_message: string | null;
  created_at: string;
}): GenerationTask | null {
  const input =
    row.input && typeof row.input === 'object'
      ? (row.input as {
          shotId?: unknown;
          kind?: unknown;
          billing?: unknown;
        })
      : {};
  const output =
    row.output && typeof row.output === 'object'
      ? (row.output as {
          mediaUrl?: unknown;
          archiveStatus?: unknown;
          billing?: unknown;
        })
      : {};
  const billingSource =
    output.billing && typeof output.billing === 'object'
      ? output.billing
      : input.billing && typeof input.billing === 'object'
        ? input.billing
        : {};
  const billing = billingSource as {
    requiredCredits?: unknown;
    estimatedCostUsd?: unknown;
  };

  if (
    !isDirectorShotId(input.shotId) ||
    (input.kind !== 'reference' && input.kind !== 'video') ||
    (row.provider !== 'fal' && row.provider !== 'simulation') ||
    !['todo', 'running', 'done', 'failed'].includes(row.status)
  ) {
    return null;
  }

  return {
    id: row.id,
    provider: row.provider,
    shotId: input.shotId,
    kind: input.kind,
    status: row.status as GenerationTaskStatus,
    mediaUrl: typeof output.mediaUrl === 'string' ? output.mediaUrl : null,
    archiveStatus:
      typeof output.archiveStatus === 'string' ? output.archiveStatus : null,
    errorMessage: row.error_message,
    requiredCredits: finiteNonNegative(billing.requiredCredits),
    estimatedCostUsd: finiteNonNegative(billing.estimatedCostUsd),
    createdAt: row.created_at,
  };
}

export function generationVersions(
  tasks: GenerationTask[],
  shotId: string,
  kind: GenerationKind,
) {
  return tasks
    .filter((task) => task.shotId === shotId && task.kind === kind)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
}

export function resolveGenerationSelection(
  versions: GenerationTask[],
  selectedTaskId?: string,
) {
  return (
    versions.find(
      (task) =>
        task.id === selectedTaskId &&
        task.status === 'done' &&
        task.mediaUrl &&
        task.provider === 'fal',
    ) ||
    versions.find(
      (task) =>
        task.status === 'done' && task.mediaUrl && task.provider === 'fal',
    ) ||
    null
  );
}

export function visibleGenerationVersions(
  versions: GenerationTask[],
  selectedTaskId?: string,
  limit = 6,
) {
  const visible = versions.slice(0, Math.max(1, limit));
  const selected = versions.find((task) => task.id === selectedTaskId);
  if (selected && !visible.some((task) => task.id === selected.id)) {
    visible.push(selected);
  }
  return visible;
}

export function readGenerationSelections(
  value: unknown,
): DirectorGenerationSelections {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const selections: DirectorGenerationSelections = {};
  for (const [shotId, rawSelection] of Object.entries(value)) {
    if (
      !isDirectorShotId(shotId) ||
      !rawSelection ||
      typeof rawSelection !== 'object' ||
      Array.isArray(rawSelection)
    ) {
      continue;
    }

    const candidate = rawSelection as {
      reference?: unknown;
      video?: unknown;
    };
    const selection: Partial<Record<GenerationKind, string>> = {};
    if (
      typeof candidate.reference === 'string' &&
      /^[0-9a-f-]{36}$/i.test(candidate.reference)
    ) {
      selection.reference = candidate.reference;
    }
    if (
      typeof candidate.video === 'string' &&
      /^[0-9a-f-]{36}$/i.test(candidate.video)
    ) {
      selection.video = candidate.video;
    }
    if (selection.reference || selection.video) selections[shotId] = selection;
  }

  return selections;
}
