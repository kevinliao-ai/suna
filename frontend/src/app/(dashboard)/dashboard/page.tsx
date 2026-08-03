'use client';

import { signOut } from '@/app/auth/actions';
import { useAuth } from '@/components/AuthProvider';
import { BillingStatusCard } from '@/components/billing-status-card';
import { ThemeToggle } from '@/components/home/theme-toggle';
import { ToolEmbed } from '@/components/tool-embed';
import { embedConfig } from '@/lib/embed-config';
import { useBillingStatus } from '@/hooks/use-billing';
import {
  createStudioId,
  createStudioProject,
  MAX_STUDIO_BACKUP_BYTES,
  MAX_STUDIO_ITEMS_PER_PROJECT,
  MAX_STUDIO_PROJECTS,
  parseStudioBackup,
  parseStoredProjects,
  resolveCloudHydration,
  serializeStudioBackup,
  STUDIO_STORAGE_PREFIX,
  type StudioProject,
  type ToolId,
} from '@/lib/studio/model';
import { loadCloudProjects, saveCloudProjects } from '@/lib/studio/repository';
import {
  AudioWaveform,
  Check,
  Cloud,
  CloudOff,
  Download,
  Film,
  FolderOpen,
  Home,
  Link2,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type SyncState =
  | 'local'
  | 'loading'
  | 'import-needed'
  | 'syncing'
  | 'synced'
  | 'error'
  | 'storage-error';

type BillingNotice = 'success' | 'canceled' | null;

const CLOUD_SYNC_ENABLED =
  process.env.NEXT_PUBLIC_STUDIO_SYNC_ENABLED === 'true';
const STUDIO_PRO_GATE_ENABLED =
  process.env.NEXT_PUBLIC_STUDIO_PRO_GATE_ENABLED === 'true';

const tools: Record<
  ToolId,
  {
    name: string;
    description: string;
    url: string;
    icon: typeof Film;
    title: string;
  }
> = {
  anisora: {
    name: 'Anime video',
    description: 'Image and text guided animation',
    url: embedConfig.anisora,
    icon: Film,
    title: 'External anime video generation tool',
  },
  'index-tts': {
    name: 'Voice studio',
    description: 'Expressive speech synthesis',
    url: embedConfig.indexTts,
    icon: AudioWaveform,
    title: 'External IndexTTS voice generation tool',
  },
};

export default function DashboardPage() {
  const { isLoading, supabase, user } = useAuth();
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(
    CLOUD_SYNC_ENABLED ? 'loading' : 'local',
  );
  const [syncError, setSyncError] = useState('');
  const [billingNotice, setBillingNotice] = useState<BillingNotice>(null);
  const [projectName, setProjectName] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [renamingProjectId, setRenamingProjectId] = useState('');
  const [renamingProjectName, setRenamingProjectName] = useState('');
  const backupInputRef = useRef<HTMLInputElement>(null);
  const saveQueue = useRef(Promise.resolve());
  const cloudSyncReady = useRef(false);
  const lastSyncedProjects = useRef<StudioProject[]>([]);
  const userId = user?.id;
  const billing = useBillingStatus(Boolean(userId));
  const billingDecisionPending = STUDIO_PRO_GATE_ENABLED && billing.isLoading;
  const cloudSyncAllowed =
    CLOUD_SYNC_ENABLED &&
    (!STUDIO_PRO_GATE_ENABLED || billing.entitlement?.tier === 'pro');
  const storageKey = `${STUDIO_STORAGE_PREFIX}:${userId || 'anonymous'}`;

  useEffect(() => {
    const billingResult = new URLSearchParams(window.location.search).get(
      'billing',
    );
    if (billingResult !== 'success' && billingResult !== 'canceled') return;

    setBillingNotice(billingResult);
    const url = new URL(window.location.href);
    url.searchParams.delete('billing');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (isLoading || billingDecisionPending) return;

    let cancelled = false;

    const hydrateWorkspace = async () => {
      cloudSyncReady.current = false;
      lastSyncedProjects.current = [];
      const savedProjects = parseStoredProjects(
        localStorage.getItem(storageKey),
      );
      let nextProjects =
        savedProjects.length > 0 ? savedProjects : [createStudioProject()];
      let nextSyncState: SyncState = 'local';

      if (cloudSyncAllowed && userId) {
        setSyncState('loading');
        try {
          const cloudProjects = await loadCloudProjects(supabase, userId);
          const resolution = resolveCloudHydration(
            savedProjects,
            cloudProjects,
            nextProjects,
          );
          nextProjects = resolution.projects;
          lastSyncedProjects.current = resolution.lastSyncedProjects;
          cloudSyncReady.current = resolution.cloudSyncReady;
          nextSyncState = resolution.syncState;
        } catch (error) {
          cloudSyncReady.current = false;
          nextSyncState = 'error';
          setSyncError(
            error instanceof Error
              ? error.message
              : 'Cloud workspace is unavailable.',
          );
        }
      } else {
        cloudSyncReady.current = false;
      }

      const requestedTool = new URLSearchParams(window.location.search).get(
        'tool',
      );

      if (requestedTool === 'index-tts') {
        nextProjects[0] = {
          ...nextProjects[0],
          activeTool: 'index-tts',
        };
      }

      if (!cancelled) {
        setProjects(nextProjects);
        setActiveProjectId(nextProjects[0].id);
        setSyncState(nextSyncState);
        setHydrated(true);
      }
    };

    void hydrateWorkspace();

    return () => {
      cancelled = true;
    };
  }, [
    billingDecisionPending,
    cloudSyncAllowed,
    isLoading,
    storageKey,
    supabase,
    userId,
  ]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(projects));
    } catch {
      setSyncError(
        'This browser could not save the workspace. Download a backup before leaving this page.',
      );
      setSyncState('storage-error');
      return;
    }

    if (!cloudSyncAllowed || !userId || !cloudSyncReady.current) return;

    const snapshot = projects;
    const timer = window.setTimeout(() => {
      setSyncState('syncing');
      saveQueue.current = saveQueue.current
        .then(() =>
          saveCloudProjects(
            supabase,
            userId,
            snapshot,
            lastSyncedProjects.current,
          ),
        )
        .then(() => {
          lastSyncedProjects.current = snapshot;
          setSyncError('');
          setSyncState('synced');
        })
        .catch((error: unknown) => {
          setSyncError(
            error instanceof Error
              ? error.message
              : 'Cloud workspace could not be saved.',
          );
          setSyncState('error');
        });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [cloudSyncAllowed, hydrated, projects, storageKey, supabase, userId]);

  const importLocalWorkspace = async () => {
    if (!userId || projects.length === 0) return;

    setSyncState('syncing');
    try {
      await saveCloudProjects(
        supabase,
        userId,
        projects,
        lastSyncedProjects.current,
      );
      lastSyncedProjects.current = projects;
      cloudSyncReady.current = true;
      setSyncError('');
      setSyncState('synced');
    } catch (error) {
      cloudSyncReady.current = false;
      setSyncError(
        error instanceof Error
          ? error.message
          : 'Local projects could not be imported.',
      );
      setSyncState('error');
    }
  };

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId),
    [activeProjectId, projects],
  );

  const updateActiveProject = (
    updater: (project: StudioProject) => StudioProject,
  ) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === activeProjectId
          ? {
              ...updater(project),
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    );
  };

  const addProject = () => {
    if (projects.length >= MAX_STUDIO_PROJECTS) {
      toast.error(
        `A workspace can contain up to ${MAX_STUDIO_PROJECTS} projects.`,
      );
      return;
    }

    const next = createStudioProject(
      projectName.trim() || `Untitled project ${projects.length + 1}`,
    );
    setProjects((current) => [...current, next]);
    setActiveProjectId(next.id);
    setProjectName('');
  };

  const beginProjectRename = (project: StudioProject) => {
    setRenamingProjectId(project.id);
    setRenamingProjectName(project.name);
  };

  const cancelProjectRename = () => {
    setRenamingProjectId('');
    setRenamingProjectName('');
  };

  const commitProjectRename = () => {
    const name = renamingProjectName.trim();
    if (!renamingProjectId || !name) return;

    setProjects((current) =>
      current.map((project) =>
        project.id === renamingProjectId
          ? {
              ...project,
              name,
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    );
    cancelProjectRename();
  };

  const removeProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (
      project &&
      !window.confirm(
        `Delete "${project.name}" and its local tasks and asset links?`,
      )
    ) {
      return;
    }

    setProjects((current) => {
      const remaining = current.filter((project) => project.id !== projectId);
      const next = remaining.length > 0 ? remaining : [createStudioProject()];
      if (projectId === activeProjectId) {
        setActiveProjectId(next[0].id);
      }
      return next;
    });
  };

  const exportWorkspace = () => {
    const backup = serializeStudioBackup(projects);
    const blob = new Blob([backup], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    anchor.href = href;
    anchor.download = `anisora-studio-backup-${date}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 0);
    toast.success('Workspace backup downloaded.');
  };

  const importWorkspace = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      if (file.size > MAX_STUDIO_BACKUP_BYTES) {
        throw new Error('The backup file is larger than 2 MB.');
      }

      const importedProjects = parseStudioBackup(await file.text());
      const confirmed = window.confirm(
        `Replace this browser workspace with ${importedProjects.length} project${
          importedProjects.length === 1 ? '' : 's'
        } from the backup? Export the current workspace first if you need it.`,
      );
      if (!confirmed) return;

      setProjects(importedProjects);
      setActiveProjectId(importedProjects[0].id);
      cancelProjectRename();
      toast.success('Workspace restored from backup.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'The workspace backup could not be restored.',
      );
    }
  };

  const chooseTool = (tool: ToolId) => {
    updateActiveProject((project) => ({ ...project, activeTool: tool }));
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('tool', tool);
    window.history.replaceState({}, '', nextUrl);
  };

  const addAsset = () => {
    const name = assetName.trim();
    const url = assetUrl.trim();
    if (!activeProject || !name || !url) return;
    if (activeProject.assets.length >= MAX_STUDIO_ITEMS_PER_PROJECT) {
      toast.error(
        `A project can contain up to ${MAX_STUDIO_ITEMS_PER_PROJECT} asset links.`,
      );
      return;
    }

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return;
    } catch {
      return;
    }

    updateActiveProject((project) => ({
      ...project,
      assets: [
        {
          id: createStudioId(),
          name,
          url,
          createdAt: new Date().toISOString(),
        },
        ...project.assets,
      ],
    }));
    setAssetName('');
    setAssetUrl('');
  };

  const addTask = () => {
    const title = taskTitle.trim();
    if (!title || !activeProject) return;
    if (activeProject.tasks.length >= MAX_STUDIO_ITEMS_PER_PROJECT) {
      toast.error(
        `A project can contain up to ${MAX_STUDIO_ITEMS_PER_PROJECT} tasks.`,
      );
      return;
    }
    updateActiveProject((project) => ({
      ...project,
      tasks: [
        ...project.tasks,
        {
          id: createStudioId(),
          title,
          status: 'todo',
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setTaskTitle('');
  };

  if (!hydrated || !activeProject) {
    return (
      <div className="grid h-full place-items-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Preparing your workspace…
        </div>
      </div>
    );
  }

  const activeTool = tools[activeProject.activeTool];
  const ActiveToolIcon = activeTool.icon;

  return (
    <div className="flex h-full min-h-screen flex-col bg-[#f7f7f5] text-zinc-950 dark:bg-[#0c0c0d] dark:text-zinc-50">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-black/10 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/40 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Sparkles className="size-4" />
          </span>
          <span className="hidden sm:inline">AniSora Studio</span>
        </Link>

        <div className="mx-auto flex min-w-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-white/10 dark:bg-white/5">
          <FolderOpen className="size-4 shrink-0 text-zinc-500" />
          <span className="truncate font-medium">{activeProject.name}</span>
          <span
            className="hidden items-center gap-1 text-xs text-zinc-400 md:inline-flex"
            title={syncError || undefined}
          >
            {syncState === 'local' ||
            syncState === 'error' ||
            syncState === 'storage-error' ? (
              <CloudOff className="size-3" />
            ) : (
              <Cloud className="size-3" />
            )}
            {syncState === 'loading' && 'checking cloud'}
            {syncState === 'import-needed' && 'local only'}
            {syncState === 'syncing' && 'saving'}
            {syncState === 'synced' && 'cloud saved'}
            {syncState === 'error' && 'local saved'}
            {syncState === 'storage-error' && 'not saved'}
            {syncState === 'local' && 'saved locally'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/"
            aria-label="Home"
            className="grid size-9 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Home className="size-4" />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="grid size-9 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </header>

      {billingNotice ? (
        <div
          role="status"
          aria-live="polite"
          className={`border-b px-4 py-3 text-sm md:px-6 ${
            billingNotice === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
              : 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300'
          }`}
        >
          {billingNotice === 'success'
            ? 'Checkout completed. Your Studio Pro access will appear as soon as Stripe finishes syncing your subscription.'
            : 'Checkout was canceled. No charge was made.'}
          <button
            type="button"
            onClick={() => setBillingNotice(null)}
            className="ml-3 underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[248px_minmax(0,1fr)_300px]">
        <aside className="border-b border-black/10 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.02] lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Projects
            </p>
            <span className="text-xs text-zinc-400">{projects.length}</span>
          </div>

          <div className="mb-3 flex gap-2">
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addProject();
              }}
              placeholder="New project"
              maxLength={120}
              className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-white/5"
            />
            <button
              type="button"
              onClick={addProject}
              aria-label="Create project"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-950 text-white transition hover:opacity-80 dark:bg-white dark:text-zinc-950"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`group flex min-w-48 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition lg:min-w-0 ${
                  project.id === activeProjectId
                    ? 'border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-white/10'
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {renamingProjectId === project.id ? (
                  <div className="flex min-w-0 flex-1 items-center gap-1">
                    <input
                      value={renamingProjectName}
                      onChange={(event) =>
                        setRenamingProjectName(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') commitProjectRename();
                        if (event.key === 'Escape') cancelProjectRename();
                      }}
                      aria-label={`Rename ${project.name}`}
                      maxLength={120}
                      autoFocus
                      className="min-w-0 flex-1 rounded-md border border-black/15 bg-white px-2 py-1 text-sm outline-none focus:border-zinc-400 dark:border-white/15 dark:bg-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={commitProjectRename}
                      disabled={!renamingProjectName.trim()}
                      aria-label="Save project name"
                      className="grid size-7 place-items-center rounded-md text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-40"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelProjectRename}
                      aria-label="Cancel project rename"
                      className="grid size-7 place-items-center rounded-md text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveProjectId(project.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate font-medium">
                      {project.name}
                    </span>
                    <span className="block text-xs text-zinc-400">
                      {
                        project.tasks.filter((task) => task.status === 'done')
                          .length
                      }
                      /{project.tasks.length} tasks · {project.assets.length}{' '}
                      assets
                    </span>
                  </button>
                )}
                {renamingProjectId !== project.id && (
                  <button
                    type="button"
                    onClick={() => beginProjectRename(project)}
                    aria-label={`Rename ${project.name}`}
                    className="grid size-7 place-items-center rounded-md text-zinc-400 opacity-60 transition hover:bg-black/5 hover:text-zinc-700 focus:opacity-100 dark:hover:bg-white/10 dark:hover:text-zinc-200 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeProject(project.id)}
                  aria-label={`Delete ${project.name}`}
                  className="grid size-7 place-items-center rounded-md text-zinc-400 opacity-60 transition hover:bg-red-500/10 hover:text-red-500 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={exportWorkspace}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Download className="size-3.5" />
              Back up
            </button>
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              disabled={cloudSyncAllowed}
              title={
                cloudSyncAllowed
                  ? 'Restore is disabled while cloud sync is enabled.'
                  : 'Restore a local AniSora Studio backup'
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Upload className="size-3.5" />
              Restore
            </button>
            <input
              ref={backupInputRef}
              type="file"
              accept="application/json,.json"
              onChange={(event) => void importWorkspace(event)}
              className="sr-only"
              tabIndex={-1}
            />
          </div>

          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            <div className="mb-1 flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
              <ShieldCheck className="size-4" />
              Data boundary
            </div>
            {syncState === 'synced'
              ? 'Project metadata is saved to your AniSora account.'
              : 'Project metadata stays in this browser.'}{' '}
            Media and prompts entered in an embedded tool are processed by that
            tool&apos;s operator.
            {syncState === 'import-needed' && (
              <button
                type="button"
                onClick={() => void importLocalWorkspace()}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 font-medium text-white transition hover:opacity-80 dark:bg-white dark:text-zinc-950"
              >
                <Cloud className="size-3.5" />
                Import local projects to cloud
              </button>
            )}
            {syncState === 'error' && syncError && (
              <p className="mt-2 break-words text-red-600 dark:text-red-400">
                Cloud sync unavailable. Your local copy is safe.
              </p>
            )}
            {syncState === 'storage-error' && syncError && (
              <p className="mt-2 break-words text-red-600 dark:text-red-400">
                {syncError}
              </p>
            )}
          </div>
        </aside>

        <main className="flex min-h-[720px] min-w-0 flex-col p-3 md:p-5">
          <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ActiveToolIcon className="size-5" />
                <h1 className="text-lg font-semibold">{activeTool.name}</h1>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {activeTool.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(Object.keys(tools) as ToolId[]).map((toolId) => {
                const tool = tools[toolId];
                const Icon = tool.icon;
                return (
                  <button
                    key={toolId}
                    type="button"
                    onClick={() => chooseTool(toolId)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                      activeProject.activeTool === toolId
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                        : 'border border-black/10 bg-white hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon className="size-4" />
                    {tool.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-[620px] flex-1 overflow-hidden rounded-2xl border border-black/10 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <ToolEmbed title={activeTool.title} url={activeTool.url} />
          </div>
        </main>

        <aside className="border-t border-black/10 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.02] lg:border-l lg:border-t-0">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Tasks
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Track the next step for this project.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addTask();
              }}
              placeholder="Add a task"
              maxLength={240}
              className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-white/5"
            />
            <button
              type="button"
              onClick={addTask}
              disabled={!taskTitle.trim()}
              aria-label="Add task"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-950 text-white transition hover:opacity-80 disabled:opacity-40 dark:bg-white dark:text-zinc-950"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="mt-3 space-y-1">
            {activeProject.tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-black/10 px-3 py-4 text-center text-xs text-zinc-400 dark:border-white/10">
                No tasks yet
              </p>
            ) : (
              activeProject.tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveProject((project) => ({
                        ...project,
                        tasks: project.tasks.map((item) =>
                          item.id === task.id
                            ? {
                                ...item,
                                status:
                                  item.status === 'done' ? 'todo' : 'done',
                              }
                            : item,
                        ),
                      }))
                    }
                    aria-label={`Mark ${task.title} ${
                      task.status === 'done' ? 'incomplete' : 'complete'
                    }`}
                    className={`size-4 shrink-0 rounded-full border ${
                      task.status === 'done'
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-zinc-400'
                    }`}
                  />
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      task.status === 'done' ? 'text-zinc-400 line-through' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveProject((project) => ({
                        ...project,
                        tasks: project.tasks.filter(
                          (item) => item.id !== task.id,
                        ),
                      }))
                    }
                    aria-label={`Remove ${task.title}`}
                    className="grid size-7 place-items-center rounded-md text-zinc-400 opacity-0 transition hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="my-5 border-t border-black/10 dark:border-white/10" />

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Project assets
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Keep source and output links together.
            </p>
          </div>

          <div className="space-y-2">
            <input
              value={assetName}
              onChange={(event) => setAssetName(event.target.value)}
              placeholder="Asset name"
              maxLength={200}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-white/5"
            />
            <input
              value={assetUrl}
              onChange={(event) => setAssetUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addAsset();
              }}
              placeholder="https://…"
              inputMode="url"
              maxLength={2048}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-white/5"
            />
            <button
              type="button"
              onClick={addAsset}
              disabled={!assetName.trim() || !assetUrl.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950"
            >
              <Link2 className="size-4" />
              Add reference
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {activeProject.assets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-black/15 p-5 text-center dark:border-white/15">
                <Link2 className="mx-auto mb-2 size-5 text-zinc-400" />
                <p className="text-sm font-medium">No assets yet</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Add links to prompts, source images, or generated outputs.
                </p>
              </div>
            ) : (
              activeProject.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group flex items-center gap-2 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5"
                >
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1"
                  >
                    <span className="block truncate text-sm font-medium">
                      {asset.name}
                    </span>
                    <span className="block truncate text-xs text-zinc-400">
                      {asset.url}
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveProject((project) => ({
                        ...project,
                        assets: project.assets.filter(
                          (item) => item.id !== asset.id,
                        ),
                      }))
                    }
                    aria-label={`Remove ${asset.name}`}
                    className="grid size-7 place-items-center rounded-md text-zinc-400 opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-5">
            <BillingStatusCard
              entitlement={billing.entitlement}
              isLoading={billing.isLoading}
              isAvailable={billing.isAvailable}
            />
          </div>

          <div className="mt-5 border-t border-black/10 pt-4 text-xs text-zinc-400 dark:border-white/10">
            Signed in as
            <span className="mt-1 block truncate text-zinc-600 dark:text-zinc-300">
              {user?.email || 'AniSora user'}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
