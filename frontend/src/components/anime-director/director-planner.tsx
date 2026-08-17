'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  ClipboardList,
  Cloud,
  Copy,
  Download,
  Film,
  LoaderCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';

import {
  loadDirectorProjects,
  saveDirectorProject,
  type SavedDirectorProject,
} from '@/lib/anime-director-projects';
import {
  createAnimeDirectorPlan,
  serializeDirectorPlan,
  type ShotPriority,
} from '@/lib/anime-director';
import {
  appendDirectorShot,
  cloneDirectorShots,
  duplicateDirectorShot,
  MAX_DIRECTOR_SHOTS,
  moveDirectorShot,
  recalculateDirectorPlan,
  removeDirectorShot,
  updateDirectorShot,
} from '@/lib/director-shot-workbench';
import { createClient } from '@/lib/supabase/client';
import { DirectorGenerationPanel } from './director-generation-panel';
import { DirectorContinuityLibrary } from './director-continuity-library';
import {
  createContinuityAsset,
  readContinuityBindings,
  readContinuityReviews,
  removeContinuityAsset,
  toggleContinuityBinding,
  updateContinuityAsset,
  updateContinuityReview,
  type ContinuityAssetKind,
  type DirectorContinuityAsset,
  type DirectorContinuityBindings,
  type DirectorContinuityReview,
  type DirectorContinuityReviews,
} from '@/lib/director-continuity';
import type {
  DirectorGenerationSelections,
  GenerationKind,
} from '@/lib/generation/task-history';
import type { AnimeShotRecipe } from '@/lib/anime-shot-recipes';
import {
  getCaseSeedShots,
  type DirectorWorkflowCase,
} from '@/lib/director-workflow-cases';
import posthog from 'posthog-js';

const priorities: Array<{
  id: ShotPriority;
  label: string;
  description: string;
}> = [
  { id: 'speed', label: 'Faster', description: 'Block the scene quickly.' },
  { id: 'cost', label: 'Cheaper', description: 'Draft first, spend later.' },
  {
    id: 'quality',
    label: 'Higher quality',
    description: 'Fewer, better renders.',
  },
  { id: 'control', label: 'More control', description: 'Reference-led shots.' },
];

const sampleScript = `A young mage stands on a rooftop at sunset.
She sees a glowing train crossing the sky.
A black cat jumps onto the railing and speaks a warning.
The mage opens her notebook and the city lights turn into floating runes.`;

export function DirectorPlanner({
  initialRecipe,
  initialCase,
}: {
  initialRecipe?: AnimeShotRecipe;
  initialCase?: DirectorWorkflowCase;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [projectTitle, setProjectTitle] = useState(
    initialCase?.title || initialRecipe?.title || 'Sky Train Opening',
  );
  const [style, setStyle] = useState(
    initialCase?.style ||
      initialRecipe?.style ||
      'cinematic anime, warm sunset light, detailed city background',
  );
  const [script, setScript] = useState(
    initialCase?.script || initialRecipe?.script || sampleScript,
  );
  const [priority, setPriority] = useState<ShotPriority>(
    initialCase?.priority || initialRecipe?.priority || 'control',
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedDirectorProject[]>(
    [],
  );
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [sourceRecipeSlug, setSourceRecipeSlug] = useState<string | undefined>(
    initialRecipe?.slug,
  );
  const [sourceCaseSlug, setSourceCaseSlug] = useState<string | undefined>(
    initialCase?.slug,
  );
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [planDirty, setPlanDirty] = useState(false);
  const [selectedGenerationTaskIds, setSelectedGenerationTaskIds] =
    useState<DirectorGenerationSelections>({});
  const [continuityAssets, setContinuityAssets] = useState<
    DirectorContinuityAsset[]
  >([]);
  const [continuityBindings, setContinuityBindings] =
    useState<DirectorContinuityBindings>({});
  const [continuityReviews, setContinuityReviews] =
    useState<DirectorContinuityReviews>({});

  const generatedPlan = useMemo(
    () =>
      createAnimeDirectorPlan({
        script,
        projectTitle,
        style,
        priority,
        seedShot:
          initialRecipe && sourceRecipeSlug === initialRecipe.slug
            ? {
                camera: initialRecipe.camera,
                durationSeconds: initialRecipe.duration,
                visualPrompt: initialRecipe.prompt,
                checklist: initialRecipe.tips,
              }
            : undefined,
        seedShots:
          initialCase && sourceCaseSlug === initialCase.slug
            ? getCaseSeedShots(initialCase)
            : undefined,
      }),
    [
      initialCase,
      initialRecipe,
      priority,
      projectTitle,
      script,
      sourceCaseSlug,
      sourceRecipeSlug,
      style,
    ],
  );
  const [editableShots, setEditableShots] = useState(() =>
    cloneDirectorShots(generatedPlan.shots),
  );
  const plan = useMemo(
    () => recalculateDirectorPlan(generatedPlan, editableShots),
    [editableShots, generatedPlan],
  );

  useEffect(() => {
    if (!initialRecipe) return;
    posthog.capture('director_recipe_loaded', {
      recipe_slug: initialRecipe.slug,
      genre: initialRecipe.genre,
      shot_type: initialRecipe.shotType,
    });
  }, [initialRecipe]);

  useEffect(() => {
    if (!initialCase) return;
    posthog.capture('director_case_loaded', {
      case_slug: initialCase.slug,
      shot_count: initialCase.recipeSlugs.length,
      priority: initialCase.priority,
    });
  }, [initialCase]);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error || !data.user) {
        setSaveMessage('Sign in to save projects to your Studio.');
        return;
      }

      setUserId(data.user.id);

      try {
        const projects = await loadDirectorProjects(supabase, data.user.id);
        if (active) setSavedProjects(projects);
      } catch {
        if (active) {
          setSaveMessage(
            'Cloud projects are unavailable right now. Your plan can still be exported.',
          );
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [supabase]);

  const markPlanChanged = (message?: string) => {
    setPlanDirty(true);
    if (saveState === 'saved' || saveState === 'error') {
      setSaveState('idle');
      setSaveMessage(message || 'You have unsaved changes.');
    } else if (message) {
      setSaveMessage(message);
    }
  };

  const editShot = (
    shotId: string,
    patch: Parameters<typeof updateDirectorShot>[2],
  ) => {
    setEditableShots((current) => updateDirectorShot(current, shotId, patch));
    markPlanChanged();
  };

  const captureShotEdit = (shotId: string, field: string) => {
    posthog.capture('director_shot_edited', {
      field,
      shot_position: editableShots.findIndex((shot) => shot.id === shotId) + 1,
      shot_count: editableShots.length,
    });
  };

  const moveShot = (shotId: string, direction: -1 | 1) => {
    const from = editableShots.findIndex((shot) => shot.id === shotId);
    if (
      from < 0 ||
      from + direction < 0 ||
      from + direction >= editableShots.length
    ) {
      return;
    }

    setEditableShots((current) => moveDirectorShot(current, shotId, direction));
    markPlanChanged();
    posthog.capture('director_shot_moved', {
      from_position: from + 1,
      to_position: from + direction + 1,
      shot_count: editableShots.length,
    });
  };

  const duplicateShot = (shotId: string) => {
    if (editableShots.length >= MAX_DIRECTOR_SHOTS) return;
    const sourcePosition =
      editableShots.findIndex((shot) => shot.id === shotId) + 1;
    const duplicateId = crypto.randomUUID();
    const duplicateShotId = `shot-${duplicateId}`;
    setEditableShots((current) =>
      duplicateDirectorShot(current, shotId, () => duplicateId),
    );
    if (continuityBindings[shotId]?.length) {
      setContinuityBindings((current) => ({
        ...current,
        [duplicateShotId]: [...(current[shotId] || [])],
      }));
    }
    markPlanChanged();
    posthog.capture('director_shot_duplicated', {
      source_position: sourcePosition,
      shot_count: editableShots.length + 1,
    });
  };

  const deleteShot = (shotId: string) => {
    if (editableShots.length <= 1) return;
    const deletedPosition =
      editableShots.findIndex((shot) => shot.id === shotId) + 1;
    setEditableShots((current) => removeDirectorShot(current, shotId));
    setContinuityBindings((current) => {
      const next = { ...current };
      delete next[shotId];
      return next;
    });
    setContinuityReviews((current) =>
      updateContinuityReview(current, shotId, null),
    );
    markPlanChanged();
    posthog.capture('director_shot_removed', {
      deleted_position: deletedPosition,
      shot_count: editableShots.length - 1,
    });
  };

  const addShot = () => {
    if (editableShots.length >= MAX_DIRECTOR_SHOTS) return;
    setEditableShots((current) => appendDirectorShot(current, priority));
    markPlanChanged();
    posthog.capture('director_shot_added', {
      shot_count: editableShots.length + 1,
      priority,
    });
  };

  const rebuildShots = () => {
    setEditableShots(cloneDirectorShots(generatedPlan.shots));
    setContinuityBindings((current) =>
      readContinuityBindings(
        current,
        continuityAssets,
        generatedPlan.shots.map((shot) => shot.id),
      ),
    );
    setContinuityReviews((current) =>
      readContinuityReviews(
        current,
        generatedPlan.shots.map((shot) => shot.id),
      ),
    );
    markPlanChanged();
    posthog.capture('director_shots_rebuilt', {
      shot_count: generatedPlan.shots.length,
      source_recipe: sourceRecipeSlug || null,
      source_case: sourceCaseSlug || null,
      priority,
    });
  };

  const addContinuityAsset = (kind: ContinuityAssetKind) => {
    setContinuityAssets((current) =>
      createContinuityAsset(current, kind, `asset-${crypto.randomUUID()}`),
    );
    markPlanChanged('Continuity asset added. Save before generating.');
    posthog.capture('director_continuity_asset_added', {
      asset_kind: kind,
      asset_count: continuityAssets.length + 1,
    });
  };

  const editContinuityAsset = (
    assetId: string,
    patch: Partial<
      Pick<
        DirectorContinuityAsset,
        | 'name'
        | 'description'
        | 'visualAnchors'
        | 'negativeConstraints'
        | 'referenceTaskId'
      >
    >,
  ) => {
    setContinuityAssets((current) =>
      updateContinuityAsset(current, assetId, patch),
    );
    markPlanChanged('Continuity asset changed. Save before generating.');
    if (patch.referenceTaskId !== undefined) {
      posthog.capture('director_continuity_reference_changed', {
        action: patch.referenceTaskId ? 'attached' : 'removed',
        asset_kind:
          continuityAssets.find((asset) => asset.id === assetId)?.kind ||
          'unknown',
      });
    }
  };

  const deleteContinuityAsset = (assetId: string) => {
    const asset = continuityAssets.find(
      (candidate) => candidate.id === assetId,
    );
    const next = removeContinuityAsset(
      continuityAssets,
      continuityBindings,
      assetId,
    );
    setContinuityAssets(next.assets);
    setContinuityBindings(next.bindings);
    markPlanChanged('Continuity asset removed. Save before generating.');
    posthog.capture('director_continuity_asset_removed', {
      asset_kind: asset?.kind || 'unknown',
      asset_count: next.assets.length,
    });
  };

  const toggleShotContinuity = (shotId: string, assetId: string) => {
    const wasSelected = (continuityBindings[shotId] || []).includes(assetId);
    setContinuityBindings((current) =>
      toggleContinuityBinding(current, shotId, assetId, continuityAssets),
    );
    markPlanChanged('Shot continuity changed. Save before generating.');
    posthog.capture('director_continuity_binding_changed', {
      action: wasSelected ? 'removed' : 'added',
      asset_kind:
        continuityAssets.find((asset) => asset.id === assetId)?.kind ||
        'unknown',
      shot_position: editableShots.findIndex((shot) => shot.id === shotId) + 1,
      selected_count: wasSelected
        ? Math.max(0, (continuityBindings[shotId] || []).length - 1)
        : (continuityBindings[shotId] || []).length + 1,
    });
  };

  const reviewShotContinuity = (
    shotId: string,
    patch: Partial<DirectorContinuityReview> | null,
  ) => {
    setContinuityReviews((current) =>
      updateContinuityReview(current, shotId, patch),
    );
    markPlanChanged('Continuity review changed. Save to keep this QA result.');
    if (patch === null || patch.status) {
      posthog.capture('director_continuity_review_changed', {
        status: patch?.status || 'cleared',
        shot_position:
          editableShots.findIndex((shot) => shot.id === shotId) + 1,
        shot_count: editableShots.length,
      });
    }
  };

  const downloadPlan = () => {
    posthog.capture('director_plan_exported', {
      source_recipe: sourceRecipeSlug || null,
      source_case: sourceCaseSlug || null,
      shot_count: plan.shots.length,
      priority,
    });
    const blob = new Blob([serializeDirectorPlan(plan)], {
      type: 'application/json',
    });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `${
      plan.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'anime-director'
    }-plan.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 0);
  };

  const savePlan = async () => {
    if (!userId) {
      setSaveState('error');
      setSaveMessage('Sign in to save a Studio project.');
      return;
    }

    setSaveState('saving');
    setSaveMessage('');
    const isNewProject = !selectedProjectId;

    try {
      const saved = await saveDirectorProject(supabase, userId, {
        id: selectedProjectId,
        title: plan.title,
        style,
        script,
        priority,
        plan,
        sourceRecipeSlug,
        sourceCaseSlug,
        selectedGenerationTaskIds,
        continuityAssets,
        continuityBindings,
        continuityReviews,
      });

      setSelectedProjectId(saved.id);
      setSavedProjects((current) => [
        saved,
        ...current.filter((project) => project.id !== saved.id),
      ]);
      setSaveState('saved');
      setPlanDirty(false);
      posthog.capture(
        isNewProject ? 'director_project_created' : 'director_project_updated',
        {
          project_id: saved.id,
          source_recipe: sourceRecipeSlug || null,
          source_case: sourceCaseSlug || null,
          shot_count: plan.shots.length,
          priority,
        },
      );
      setSaveMessage(
        isNewProject
          ? 'Saved to Studio. Each shot is now a project task.'
          : 'Saved your revised plan. Existing project tasks were preserved.',
      );
    } catch {
      posthog.capture('director_project_save_failed', {
        is_new_project: isNewProject,
        source_recipe: sourceRecipeSlug || null,
        source_case: sourceCaseSlug || null,
        shot_count: plan.shots.length,
      });
      setSaveState('error');
      setSaveMessage('Could not save this project. Please try again.');
    }
  };

  const openSavedProject = (projectId: string) => {
    const saved = savedProjects.find((project) => project.id === projectId);
    if (!saved) return;

    setSelectedProjectId(saved.id);
    setProjectTitle(saved.title);
    setStyle(saved.style);
    setScript(saved.script);
    setPriority(saved.priority);
    setSourceRecipeSlug(saved.sourceRecipeSlug);
    setSourceCaseSlug(saved.sourceCaseSlug);
    setEditableShots(cloneDirectorShots(saved.plan.shots));
    setSelectedGenerationTaskIds(saved.selectedGenerationTaskIds || {});
    setContinuityAssets(saved.continuityAssets || []);
    setContinuityBindings(saved.continuityBindings || {});
    setContinuityReviews(saved.continuityReviews || {});
    setPlanDirty(false);
    posthog.capture('director_saved_project_loaded', {
      source_recipe: saved.sourceRecipeSlug || null,
      source_case: saved.sourceCaseSlug || null,
      shot_count: saved.plan.shots.length,
      priority: saved.priority,
    });
    setSaveState('idle');
    setSaveMessage(`Loaded ${saved.title}.`);
  };

  const selectGenerationTask = (
    shotId: string,
    kind: GenerationKind,
    taskId: string,
  ) => {
    setSelectedGenerationTaskIds((current) => ({
      ...current,
      [shotId]: {
        ...current[shotId],
        [kind]: taskId,
      },
    }));
    markPlanChanged('Final take selected. Save to Studio to sync this choice.');
  };

  const taskList = plan.shots.flatMap((shot) => [
    { id: `${shot.id}-prepare`, label: `Prepare reference for ${shot.title}` },
    { id: `${shot.id}-generate`, label: `Generate draft for ${shot.title}` },
    {
      id: `${shot.id}-review`,
      label: `Review and save output for ${shot.title}`,
    },
  ]);

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 py-6 text-zinc-950 dark:bg-[#0c0c0d] dark:text-zinc-50 md:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10 md:flex-row md:items-center">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <Film className="size-4" /> Back to Studio
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Anime Director Planner
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Turn a short script into shot cards, prompts, routing advice, and
              a production task list before opening any external generation
              tool.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={downloadPlan}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Download className="size-4" /> Export plan
            </button>
            <button
              type="button"
              onClick={() => void savePlan()}
              disabled={saveState === 'saving'}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveState === 'saving' ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : saveState === 'saved' ? (
                <Check className="size-4" />
              ) : (
                <Cloud className="size-4" />
              )}
              {saveState === 'saving' ? 'Saving…' : 'Save to Studio'}
            </button>
            <Link
              href="/dashboard?tool=anisora"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-85 dark:bg-white dark:text-zinc-950"
            >
              Open video tool <ArrowRight className="size-4" />
            </Link>
          </div>
        </header>

        <div className="grid gap-5 py-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            {initialRecipe ? (
              <div className="mb-5 rounded-lg border border-violet-500/20 bg-violet-500/10 p-3 text-sm text-violet-800 dark:text-violet-200">
                Loaded the exact <strong>{initialRecipe.title}</strong> camera,
                timing, prompt, and production checks. Edit anything before
                saving it as your own project.
              </div>
            ) : null}
            {initialCase ? (
              <div className="mb-5 rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-sky-800 dark:text-sky-200">
                Loaded the complete <strong>{initialCase.title}</strong> case:
                script, {initialCase.recipeSlugs.length} curated shots, exact
                camera directions, timing, prompts, and review checks.
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Script to shots
              </p>
              {savedProjects.length > 0 && (
                <select
                  aria-label="Saved Director projects"
                  value={selectedProjectId || ''}
                  onChange={(event) => openSavedProject(event.target.value)}
                  className="max-w-48 rounded-md border border-black/10 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-zinc-950"
                >
                  <option value="">Saved projects</option>
                  {savedProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Project title
                <input
                  value={projectTitle}
                  onChange={(event) => {
                    setProjectTitle(event.target.value);
                    markPlanChanged();
                  }}
                  maxLength={120}
                  className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Visual style
                <input
                  value={style}
                  onChange={(event) => {
                    setStyle(event.target.value);
                    markPlanChanged();
                  }}
                  maxLength={240}
                  className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Script beats
                <textarea
                  value={script}
                  onChange={(event) => {
                    setScript(event.target.value);
                    markPlanChanged();
                  }}
                  rows={9}
                  maxLength={2400}
                  className="resize-none rounded-lg border border-black/10 bg-white p-3 text-sm leading-6 outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950"
                />
              </label>
              <div className="grid gap-2 text-sm font-medium">
                Routing priority
                <div className="grid grid-cols-2 gap-2">
                  {priorities.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPriority(item.id);
                        markPlanChanged();
                      }}
                      className={`rounded-lg border p-3 text-left transition ${
                        priority === item.id
                          ? 'border-violet-600 bg-violet-600 text-white'
                          : 'border-black/10 bg-white hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span
                        className={`mt-1 block text-xs ${priority === item.id ? 'text-white/75' : 'text-zinc-500'}`}
                      >
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {saveMessage && (
                <p
                  className={`rounded-lg px-3 py-2 text-xs ${
                    saveState === 'error'
                      ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {saveMessage}
                </p>
              )}
              {saveState === 'saved' ? (
                <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                  <p className="text-sm font-semibold">
                    Your first production milestone is ready.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Generate a reference below, or compare Studio Pro credits
                    before committing provider spend.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href="#real-generation"
                      className="rounded-md bg-zinc-950 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950"
                    >
                      Generate first reference
                    </a>
                    <Link
                      href="/pricing?source=director-first-project"
                      onClick={() =>
                        posthog.capture('director_post_save_upgrade_clicked', {
                          source_recipe: sourceRecipeSlug || null,
                          source_case: sourceCaseSlug || null,
                          shot_count: plan.shots.length,
                        })
                      }
                      className="rounded-md border border-black/10 px-3 py-2 text-xs font-semibold dark:border-white/10"
                    >
                      Compare Studio Pro
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <Sparkles className="size-5 text-violet-600" />
                <p className="mt-4 text-2xl font-semibold">
                  {plan.shots.length}
                </p>
                <p className="mt-1 text-sm text-zinc-500">Shot cards</p>
              </article>
              <article className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <Film className="size-5 text-sky-600" />
                <p className="mt-4 text-2xl font-semibold">
                  {plan.estimatedSeconds}s
                </p>
                <p className="mt-1 text-sm text-zinc-500">Estimated runtime</p>
              </article>
              <article className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <ClipboardList className="size-5 text-emerald-600" />
                <p className="mt-4 text-2xl font-semibold">
                  {plan.estimatedTestRenders}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Draft render budget
                </p>
              </article>
            </div>

            <DirectorContinuityLibrary
              assets={continuityAssets}
              bindings={continuityBindings}
              shots={plan.shots}
              referenceSelections={selectedGenerationTaskIds}
              onAdd={addContinuityAsset}
              onChange={editContinuityAsset}
              onRemove={deleteContinuityAsset}
              onToggle={toggleShotContinuity}
            />

            <section className="grid gap-4">
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">Shot workbench</h2>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                    Edit every production detail here. Script changes are kept
                    separate until you rebuild, which replaces the current shot
                    edits.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={rebuildShots}
                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <RefreshCw className="size-3.5" /> Rebuild from script
                  </button>
                  <button
                    type="button"
                    onClick={addShot}
                    disabled={plan.shots.length >= MAX_DIRECTOR_SHOTS}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="size-3.5" /> Add shot ({plan.shots.length}/
                    {MAX_DIRECTOR_SHOTS})
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {plan.shots.map((shot, index) => (
                  <article
                    key={shot.id}
                    className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                        Shot {index + 1} of {plan.shots.length}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveShot(shot.id, -1)}
                          disabled={index === 0}
                          aria-label={`Move shot ${index + 1} up`}
                          className="rounded-md border border-black/10 p-2 text-zinc-500 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:hover:text-white"
                        >
                          <ChevronUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveShot(shot.id, 1)}
                          disabled={index === plan.shots.length - 1}
                          aria-label={`Move shot ${index + 1} down`}
                          className="rounded-md border border-black/10 p-2 text-zinc-500 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:hover:text-white"
                        >
                          <ChevronDown className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateShot(shot.id)}
                          disabled={plan.shots.length >= MAX_DIRECTOR_SHOTS}
                          aria-label={`Duplicate shot ${index + 1}`}
                          className="rounded-md border border-black/10 p-2 text-zinc-500 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:hover:text-white"
                        >
                          <Copy className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteShot(shot.id)}
                          disabled={plan.shots.length === 1}
                          aria-label={`Delete shot ${index + 1}`}
                          className="rounded-md border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 text-sm">
                      <label className="grid gap-1.5 font-medium">
                        Shot title
                        <input
                          value={shot.title}
                          onChange={(event) =>
                            editShot(shot.id, { title: event.target.value })
                          }
                          onBlur={() => captureShotEdit(shot.id, 'title')}
                          maxLength={120}
                          className="h-10 rounded-lg border border-black/10 bg-white px-3 font-normal outline-none focus:border-violet-500 dark:border-white/10 dark:bg-zinc-950"
                        />
                      </label>
                      <label className="grid gap-1.5 font-medium">
                        Story beat
                        <textarea
                          value={shot.beat}
                          onChange={(event) =>
                            editShot(shot.id, { beat: event.target.value })
                          }
                          onBlur={() => captureShotEdit(shot.id, 'beat')}
                          rows={3}
                          maxLength={500}
                          className="resize-y rounded-lg border border-black/10 bg-white p-3 font-normal leading-6 outline-none focus:border-violet-500 dark:border-white/10 dark:bg-zinc-950"
                        />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-[1fr_110px]">
                        <label className="grid gap-1.5 font-medium">
                          Camera
                          <input
                            value={shot.camera}
                            onChange={(event) =>
                              editShot(shot.id, { camera: event.target.value })
                            }
                            onBlur={() => captureShotEdit(shot.id, 'camera')}
                            maxLength={240}
                            className="h-10 rounded-lg border border-black/10 bg-white px-3 font-normal outline-none focus:border-violet-500 dark:border-white/10 dark:bg-zinc-950"
                          />
                        </label>
                        <label className="grid gap-1.5 font-medium">
                          Duration
                          <div className="relative">
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={shot.durationSeconds}
                              onChange={(event) =>
                                editShot(shot.id, {
                                  durationSeconds: Number(event.target.value),
                                })
                              }
                              onBlur={() =>
                                captureShotEdit(shot.id, 'duration')
                              }
                              className="h-10 w-full rounded-lg border border-black/10 bg-white px-3 pr-8 font-normal outline-none focus:border-violet-500 dark:border-white/10 dark:bg-zinc-950"
                            />
                            <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-zinc-500">
                              sec
                            </span>
                          </div>
                        </label>
                      </div>
                      <label className="grid gap-1.5 font-medium">
                        Visual prompt
                        <textarea
                          value={shot.visualPrompt}
                          onChange={(event) =>
                            editShot(shot.id, {
                              visualPrompt: event.target.value,
                            })
                          }
                          onBlur={() =>
                            captureShotEdit(shot.id, 'visual_prompt')
                          }
                          rows={4}
                          maxLength={1200}
                          className="resize-y rounded-lg border border-black/10 bg-white p-3 font-normal leading-6 outline-none focus:border-violet-500 dark:border-white/10 dark:bg-zinc-950"
                        />
                      </label>
                      <label className="grid gap-1.5 font-medium">
                        Voice direction
                        <textarea
                          value={shot.voicePrompt}
                          onChange={(event) =>
                            editShot(shot.id, {
                              voicePrompt: event.target.value,
                            })
                          }
                          onBlur={() =>
                            captureShotEdit(shot.id, 'voice_prompt')
                          }
                          rows={3}
                          maxLength={600}
                          className="resize-y rounded-lg border border-black/10 bg-white p-3 font-normal leading-6 outline-none focus:border-violet-500 dark:border-white/10 dark:bg-zinc-950"
                        />
                      </label>
                      {(continuityBindings[shot.id] || []).length > 0 ? (
                        <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-700 dark:text-fuchsia-300">
                            Continuity lock
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {continuityAssets
                              .filter((asset) =>
                                continuityBindings[shot.id]?.includes(asset.id),
                              )
                              .map((asset) => (
                                <span
                                  key={asset.id}
                                  className="rounded-full border border-fuchsia-500/20 bg-white px-2.5 py-1 text-[11px] font-medium dark:bg-white/5"
                                >
                                  {asset.kind === 'character'
                                    ? 'Character'
                                    : 'Scene'}
                                  : {asset.name || 'Unnamed'}
                                </span>
                              ))}
                          </div>
                          <p className="mt-2 text-xs leading-5 text-zinc-500">
                            These saved anchors will be appended securely when
                            this shot is generated.
                          </p>
                        </div>
                      ) : null}
                      <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                        <p className="font-medium text-violet-700 dark:text-violet-300">
                          Generation route
                        </p>
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                          {shot.route}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <DirectorGenerationPanel
              projectId={selectedProjectId}
              shots={plan.shots}
              selections={selectedGenerationTaskIds}
              continuityAssets={continuityAssets}
              continuityBindings={continuityBindings}
              continuityReviews={continuityReviews}
              planDirty={planDirty}
              onSelectTask={selectGenerationTask}
              onReview={reviewShotContinuity}
            />

            <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="text-lg font-semibold">Production task list</h2>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {taskList.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-black/10 px-3 py-2 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-300"
                  >
                    {task.label}
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
