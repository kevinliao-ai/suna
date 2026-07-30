import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  StudioAsset,
  StudioProject,
  StudioTask,
  ToolId,
} from './model';

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  active_tool: ToolId;
  created_at: string;
  updated_at: string;
}

interface AssetRow {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  url: string;
  created_at: string;
}

interface TaskRow {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  status: 'todo' | 'running' | 'done' | 'failed';
  created_at: string;
}

function throwOnError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function mapAsset(row: AssetRow): StudioAsset {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    createdAt: row.created_at,
  };
}

function mapTask(row: TaskRow): StudioTask {
  return {
    id: row.id,
    title: row.title,
    status: row.status === 'done' ? 'done' : 'todo',
    createdAt: row.created_at,
  };
}

export async function loadCloudProjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<StudioProject[]> {
  const [projectResult, assetResult, taskResult] = await Promise.all([
    supabase
      .from('anisora_projects')
      .select('id,user_id,name,active_tool,created_at,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('anisora_assets')
      .select('id,project_id,user_id,name,url,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('anisora_tasks')
      .select('id,project_id,user_id,title,status,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
  ]);

  throwOnError(projectResult.error);
  throwOnError(assetResult.error);
  throwOnError(taskResult.error);

  const assets = (assetResult.data || []) as AssetRow[];
  const tasks = (taskResult.data || []) as TaskRow[];

  return ((projectResult.data || []) as ProjectRow[]).map((project) => ({
    id: project.id,
    name: project.name,
    activeTool: project.active_tool,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    assets: assets
      .filter((asset) => asset.project_id === project.id)
      .map(mapAsset),
    tasks: tasks
      .filter((task) => task.project_id === project.id)
      .map(mapTask),
  }));
}

async function deleteMissingRows(
  supabase: SupabaseClient,
  table: 'anisora_projects' | 'anisora_assets' | 'anisora_tasks',
  userId: string,
  currentIds: string[],
) {
  const { data, error: selectError } = await supabase
    .from(table)
    .select('id')
    .eq('user_id', userId);
  throwOnError(selectError);

  const currentIdSet = new Set(currentIds);
  const staleIds = (data || [])
    .map((row) => row.id as string)
    .filter((id) => !currentIdSet.has(id));

  if (staleIds.length === 0) return;

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq('user_id', userId)
    .in('id', staleIds);
  throwOnError(deleteError);
}

export async function saveCloudProjects(
  supabase: SupabaseClient,
  userId: string,
  projects: StudioProject[],
) {
  const projectRows = projects.map((project) => ({
    id: project.id,
    user_id: userId,
    name: project.name,
    active_tool: project.activeTool,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  }));
  const assetRows = projects.flatMap((project) =>
    project.assets.map((asset) => ({
      id: asset.id,
      project_id: project.id,
      user_id: userId,
      name: asset.name,
      url: asset.url,
      kind: 'reference',
      created_at: asset.createdAt,
      updated_at: project.updatedAt,
    })),
  );
  const taskRows = projects.flatMap((project) =>
    project.tasks.map((task) => ({
      id: task.id,
      project_id: project.id,
      user_id: userId,
      title: task.title,
      status: task.status,
      created_at: task.createdAt,
      updated_at: project.updatedAt,
    })),
  );

  if (projectRows.length > 0) {
    const { error } = await supabase
      .from('anisora_projects')
      .upsert(projectRows, { onConflict: 'id' });
    throwOnError(error);
  }

  await deleteMissingRows(
    supabase,
    'anisora_projects',
    userId,
    projectRows.map((row) => row.id),
  );

  if (assetRows.length > 0) {
    const { error } = await supabase
      .from('anisora_assets')
      .upsert(assetRows, { onConflict: 'id' });
    throwOnError(error);
  }

  if (taskRows.length > 0) {
    const { error } = await supabase
      .from('anisora_tasks')
      .upsert(taskRows, { onConflict: 'id' });
    throwOnError(error);
  }

  await Promise.all([
    deleteMissingRows(
      supabase,
      'anisora_assets',
      userId,
      assetRows.map((row) => row.id),
    ),
    deleteMissingRows(
      supabase,
      'anisora_tasks',
      userId,
      taskRows.map((row) => row.id),
    ),
  ]);
}
