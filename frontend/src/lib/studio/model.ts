export type ToolId = 'anisora' | 'index-tts';

export interface StudioAsset {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

export interface StudioTask {
  id: string;
  title: string;
  status: 'todo' | 'done';
  createdAt: string;
}

export interface StudioProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activeTool: ToolId;
  assets: StudioAsset[];
  tasks: StudioTask[];
}

export interface DeletedStudioIds {
  projectIds: string[];
  assetIds: string[];
  taskIds: string[];
}

export const STUDIO_STORAGE_PREFIX = 'anisora:studio:v1';

export function createStudioId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createStudioProject(name = 'My first project'): StudioProject {
  const now = new Date().toISOString();
  return {
    id: createStudioId(),
    name,
    createdAt: now,
    updatedAt: now,
    activeTool: 'anisora',
    assets: [],
    tasks: [],
  };
}

export function isStudioProject(value: unknown): value is StudioProject {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<StudioProject>;

  return (
    typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string' &&
    (project.activeTool === 'anisora' || project.activeTool === 'index-tts') &&
    Array.isArray(project.assets) &&
    (project.tasks === undefined || Array.isArray(project.tasks))
  );
}

export function parseStoredProjects(value: string | null): StudioProject[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStudioProject).map((project) => ({
      ...project,
      tasks: Array.isArray(project.tasks) ? project.tasks : [],
    }));
  } catch {
    return [];
  }
}

export function collectDeletedStudioIds(
  previousProjects: StudioProject[],
  currentProjects: StudioProject[],
): DeletedStudioIds {
  const currentProjectIds = new Set(
    currentProjects.map((project) => project.id),
  );
  const currentAssetIds = new Set(
    currentProjects.flatMap((project) =>
      project.assets.map((asset) => asset.id),
    ),
  );
  const currentTaskIds = new Set(
    currentProjects.flatMap((project) => project.tasks.map((task) => task.id)),
  );

  return {
    projectIds: previousProjects
      .filter((project) => !currentProjectIds.has(project.id))
      .map((project) => project.id),
    assetIds: previousProjects
      .flatMap((project) => project.assets)
      .filter((asset) => !currentAssetIds.has(asset.id))
      .map((asset) => asset.id),
    taskIds: previousProjects
      .flatMap((project) => project.tasks)
      .filter((task) => !currentTaskIds.has(task.id))
      .map((task) => task.id),
  };
}
