import type { SupabaseClient } from '@supabase/supabase-js';

import type { AnimeDirectorPlan, ShotPriority } from '@/lib/anime-director';
import {
  readContinuityAssets,
  readContinuityBindings,
  readContinuityReviews,
  type DirectorContinuityAsset,
  type DirectorContinuityBindings,
  type DirectorContinuityReviews,
} from '@/lib/director-continuity';
import {
  readGenerationSelections,
  type DirectorGenerationSelections,
} from '@/lib/generation/task-history';

const directorProjectKind = 'anisora-anime-director-plan';

export interface DirectorProjectInput {
  id?: string;
  title: string;
  style: string;
  script: string;
  priority: ShotPriority;
  plan: AnimeDirectorPlan;
  sourceRecipeSlug?: string;
  sourceCaseSlug?: string;
  selectedGenerationTaskIds?: DirectorGenerationSelections;
  continuityAssets?: DirectorContinuityAsset[];
  continuityBindings?: DirectorContinuityBindings;
  continuityReviews?: DirectorContinuityReviews;
}

export interface SavedDirectorProject extends DirectorProjectInput {
  id: string;
  updatedAt: string;
}

interface ProjectRow {
  id: string;
  name: string;
  settings: unknown;
  updated_at: string;
}

function isPriority(value: unknown): value is ShotPriority {
  return (
    value === 'speed' ||
    value === 'cost' ||
    value === 'quality' ||
    value === 'control'
  );
}

function isPlan(value: unknown): value is AnimeDirectorPlan {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AnimeDirectorPlan>;
  return (
    typeof candidate.title === 'string' &&
    isPriority(candidate.priority) &&
    Array.isArray(candidate.shots) &&
    typeof candidate.estimatedSeconds === 'number' &&
    typeof candidate.estimatedTestRenders === 'number'
  );
}

function readDirectorProject(row: ProjectRow): SavedDirectorProject | null {
  if (!row.settings || typeof row.settings !== 'object') return null;

  const settings = row.settings as {
    product?: unknown;
    director?: {
      title?: unknown;
      style?: unknown;
      script?: unknown;
      priority?: unknown;
      plan?: unknown;
      sourceRecipeSlug?: unknown;
      sourceCaseSlug?: unknown;
      selectedGenerationTaskIds?: unknown;
      continuityAssets?: unknown;
      continuityBindings?: unknown;
      continuityReviews?: unknown;
    };
  };

  const director = settings.director;
  if (
    settings.product !== directorProjectKind ||
    !director ||
    typeof director.title !== 'string' ||
    typeof director.style !== 'string' ||
    typeof director.script !== 'string' ||
    !isPriority(director.priority) ||
    !isPlan(director.plan)
  ) {
    return null;
  }

  const continuityAssets = readContinuityAssets(director.continuityAssets);
  const continuityBindings = readContinuityBindings(
    director.continuityBindings,
    continuityAssets,
    director.plan.shots.map((shot) => shot.id),
  );

  return {
    id: row.id,
    title: director.title,
    style: director.style,
    script: director.script,
    priority: director.priority,
    plan: director.plan,
    sourceRecipeSlug:
      typeof director.sourceRecipeSlug === 'string'
        ? director.sourceRecipeSlug
        : undefined,
    sourceCaseSlug:
      typeof director.sourceCaseSlug === 'string'
        ? director.sourceCaseSlug
        : undefined,
    selectedGenerationTaskIds: readGenerationSelections(
      director.selectedGenerationTaskIds,
    ),
    continuityAssets,
    continuityBindings,
    continuityReviews: readContinuityReviews(
      director.continuityReviews,
      director.plan.shots.map((shot) => shot.id),
    ),
    updatedAt: row.updated_at,
  };
}

export async function loadDirectorProjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<SavedDirectorProject[]> {
  const { data, error } = await supabase
    .from('anisora_projects')
    .select('id,name,settings,updated_at')
    .eq('user_id', userId)
    .eq('active_tool', 'anisora')
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return ((data || []) as ProjectRow[])
    .map(readDirectorProject)
    .filter((project): project is SavedDirectorProject => Boolean(project));
}

export async function saveDirectorProject(
  supabase: SupabaseClient,
  userId: string,
  input: DirectorProjectInput,
): Promise<SavedDirectorProject> {
  const isNewProject = !input.id;
  const projectId = input.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const settings = {
    product: directorProjectKind,
    version: 1,
    director: {
      title: input.title,
      style: input.style,
      script: input.script,
      priority: input.priority,
      plan: input.plan,
      sourceRecipeSlug: input.sourceRecipeSlug,
      sourceCaseSlug: input.sourceCaseSlug,
      selectedGenerationTaskIds: input.selectedGenerationTaskIds,
      continuityAssets: readContinuityAssets(input.continuityAssets),
      continuityBindings: readContinuityBindings(
        input.continuityBindings,
        readContinuityAssets(input.continuityAssets),
        input.plan.shots.map((shot) => shot.id),
      ),
      continuityReviews: readContinuityReviews(
        input.continuityReviews,
        input.plan.shots.map((shot) => shot.id),
      ),
    },
  };

  const { error: projectError } = await supabase
    .from('anisora_projects')
    .upsert(
      {
        id: projectId,
        user_id: userId,
        name: input.title.slice(0, 120) || 'Untitled anime scene',
        active_tool: 'anisora',
        settings,
        updated_at: now,
      },
      { onConflict: 'id' },
    );

  if (projectError) throw new Error(projectError.message);

  // Existing project tasks may already be connected to generated outputs.
  // Only seed initial Director tasks; later saves update the plan metadata only.
  if (isNewProject) {
    const tasks = input.plan.shots.map((shot) => ({
      project_id: projectId,
      user_id: userId,
      title: `Generate draft: ${shot.title}`.slice(0, 240),
      status: 'todo',
      provider: 'director-planner',
      input: {
        source: 'anime-director',
        shot,
      },
      output: {},
      updated_at: now,
    }));

    if (tasks.length > 0) {
      const { error: taskError } = await supabase
        .from('anisora_tasks')
        .insert(tasks);

      if (taskError) throw new Error(taskError.message);
    }
  }

  return {
    id: projectId,
    title: input.title,
    style: input.style,
    script: input.script,
    priority: input.priority,
    plan: input.plan,
    sourceRecipeSlug: input.sourceRecipeSlug,
    sourceCaseSlug: input.sourceCaseSlug,
    selectedGenerationTaskIds: input.selectedGenerationTaskIds,
    continuityAssets: readContinuityAssets(input.continuityAssets),
    continuityBindings: readContinuityBindings(
      input.continuityBindings,
      readContinuityAssets(input.continuityAssets),
      input.plan.shots.map((shot) => shot.id),
    ),
    continuityReviews: readContinuityReviews(
      input.continuityReviews,
      input.plan.shots.map((shot) => shot.id),
    ),
    updatedAt: now,
  };
}
