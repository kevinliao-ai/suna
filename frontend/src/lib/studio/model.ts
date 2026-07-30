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

export interface CloudHydrationResult {
  projects: StudioProject[];
  lastSyncedProjects: StudioProject[];
  cloudSyncReady: boolean;
  syncState: 'import-needed' | 'synced';
}

export const STUDIO_STORAGE_PREFIX = 'anisora:studio:v1';
export const STUDIO_BACKUP_PRODUCT = 'anisora-studio';
export const STUDIO_BACKUP_VERSION = 1;
export const MAX_STUDIO_BACKUP_BYTES = 2_000_000;
export const MAX_STUDIO_STORAGE_BYTES = 5_000_000;
export const MAX_STUDIO_PROJECTS = 100;
export const MAX_STUDIO_ITEMS_PER_PROJECT = 500;

interface StudioWorkspaceBackup {
  product: typeof STUDIO_BACKUP_PRODUCT;
  version: typeof STUDIO_BACKUP_VERSION;
  exportedAt: string;
  projects: StudioProject[];
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isHttpUrl(value: string) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isStudioAsset(value: unknown): value is StudioAsset {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.url === 'string' &&
    isHttpUrl(value.url) &&
    typeof value.createdAt === 'string'
  );
}

function isStudioTask(value: unknown): value is StudioTask {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    (value.status === 'todo' || value.status === 'done') &&
    typeof value.createdAt === 'string'
  );
}

function normalizeStudioProject(value: unknown): StudioProject | null {
  if (!value || typeof value !== 'object') return null;
  const project = value as Partial<StudioProject>;

  const hasValidBase =
    typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string' &&
    (project.activeTool === 'anisora' || project.activeTool === 'index-tts') &&
    Array.isArray(project.assets) &&
    (project.tasks === undefined || Array.isArray(project.tasks));

  if (!hasValidBase) return null;

  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    activeTool: project.activeTool,
    assets: project.assets
      .filter(isStudioAsset)
      .slice(0, MAX_STUDIO_ITEMS_PER_PROJECT),
    tasks: (project.tasks || [])
      .filter(isStudioTask)
      .slice(0, MAX_STUDIO_ITEMS_PER_PROJECT),
  };
}

export function isStudioProject(value: unknown): value is StudioProject {
  const project = normalizeStudioProject(value);
  if (!project || !isRecord(value)) return false;

  const assets = value.assets as unknown[];
  const tasks = value.tasks === undefined ? [] : (value.tasks as unknown[]);
  return (
    project.assets.length === assets.length &&
    project.tasks.length === tasks.length
  );
}

export function parseStoredProjects(value: string | null): StudioProject[] {
  if (!value || value.length > MAX_STUDIO_STORAGE_BYTES) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .slice(0, MAX_STUDIO_PROJECTS)
      .map(normalizeStudioProject)
      .filter((project): project is StudioProject => project !== null);
  } catch {
    return [];
  }
}

export function resolveCloudHydration(
  localProjects: StudioProject[],
  cloudProjects: StudioProject[],
  fallbackProjects: StudioProject[],
): CloudHydrationResult {
  if (cloudProjects.length > 0) {
    return {
      projects: cloudProjects,
      lastSyncedProjects: cloudProjects,
      cloudSyncReady: true,
      syncState: 'synced',
    };
  }

  if (localProjects.length > 0) {
    return {
      projects: localProjects,
      lastSyncedProjects: [],
      cloudSyncReady: false,
      syncState: 'import-needed',
    };
  }

  return {
    projects: fallbackProjects,
    lastSyncedProjects: [],
    cloudSyncReady: true,
    syncState: 'synced',
  };
}

export function serializeStudioBackup(
  projects: StudioProject[],
  exportedAt = new Date().toISOString(),
) {
  const backup: StudioWorkspaceBackup = {
    product: STUDIO_BACKUP_PRODUCT,
    version: STUDIO_BACKUP_VERSION,
    exportedAt,
    projects,
  };

  return JSON.stringify(backup, null, 2);
}

export function parseStudioBackup(value: string): StudioProject[] {
  if (!value || value.length > MAX_STUDIO_BACKUP_BYTES) {
    throw new Error('The backup file is empty or larger than 2 MB.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('The backup file is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new Error('The backup file has an unsupported format.');
  }

  if (
    parsed.product !== STUDIO_BACKUP_PRODUCT ||
    parsed.version !== STUDIO_BACKUP_VERSION ||
    typeof parsed.exportedAt !== 'string' ||
    !Array.isArray(parsed.projects)
  ) {
    throw new Error('The backup file is not an AniSora Studio v1 backup.');
  }

  if (
    parsed.projects.length === 0 ||
    parsed.projects.length > MAX_STUDIO_PROJECTS
  ) {
    throw new Error('The backup must contain between 1 and 100 projects.');
  }

  const projects = parsed.projects.map(normalizeStudioProject);
  if (
    projects.some((project) => project === null) ||
    parsed.projects.some((project, index) => {
      if (!isRecord(project)) return true;
      const normalized = projects[index];
      const assets = Array.isArray(project.assets) ? project.assets : [];
      const tasks = Array.isArray(project.tasks) ? project.tasks : [];
      return (
        !normalized ||
        normalized.assets.length !== assets.length ||
        normalized.tasks.length !== tasks.length
      );
    })
  ) {
    throw new Error('The backup contains invalid or unsupported project data.');
  }

  const validProjects = projects as StudioProject[];
  const ids = validProjects.flatMap((project) => [
    project.id,
    ...project.assets.map((asset) => asset.id),
    ...project.tasks.map((task) => task.id),
  ]);
  if (new Set(ids).size !== ids.length) {
    throw new Error('The backup contains duplicate project or item IDs.');
  }

  return validProjects;
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
