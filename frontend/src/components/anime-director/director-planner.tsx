'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ClipboardList,
  Cloud,
  Download,
  Film,
  LoaderCircle,
  Sparkles,
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
import { createClient } from '@/lib/supabase/client';
import { DirectorGenerationPanel } from './director-generation-panel';
import type { AnimeShotRecipe } from '@/lib/anime-shot-recipes';
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
}: {
  initialRecipe?: AnimeShotRecipe;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [projectTitle, setProjectTitle] = useState(
    initialRecipe?.title || 'Sky Train Opening',
  );
  const [style, setStyle] = useState(
    initialRecipe?.style ||
      'cinematic anime, warm sunset light, detailed city background',
  );
  const [script, setScript] = useState(initialRecipe?.script || sampleScript);
  const [priority, setPriority] = useState<ShotPriority>(
    initialRecipe?.priority || 'control',
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
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const plan = useMemo(
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
      }),
    [initialRecipe, priority, projectTitle, script, sourceRecipeSlug, style],
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

  const downloadPlan = () => {
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
      });

      setSelectedProjectId(saved.id);
      setSavedProjects((current) => [
        saved,
        ...current.filter((project) => project.id !== saved.id),
      ]);
      setSaveState('saved');
      posthog.capture(
        isNewProject ? 'director_project_created' : 'director_project_updated',
        {
          project_id: saved.id,
          source_recipe: sourceRecipeSlug || null,
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
    setSaveState('idle');
    setSaveMessage(`Loaded ${saved.title}.`);
  };

  const taskList = plan.shots.flatMap((shot) => [
    `Prepare reference for ${shot.title}`,
    `Generate draft for ${shot.title}`,
    `Review and save output for ${shot.title}`,
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
                  onChange={(event) => setProjectTitle(event.target.value)}
                  maxLength={120}
                  className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Visual style
                <input
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                  maxLength={240}
                  className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Script beats
                <textarea
                  value={script}
                  onChange={(event) => setScript(event.target.value)}
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
                      onClick={() => setPriority(item.id)}
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
                  <p className="text-sm font-semibold">Your first production milestone is ready.</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Generate a reference below, or compare Studio Pro credits before committing provider spend.
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

            <div className="grid gap-4 lg:grid-cols-2">
              {plan.shots.map((shot) => (
                <article
                  key={shot.id}
                  className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                        {shot.durationSeconds}s shot
                      </p>
                      <h2 className="mt-2 text-lg font-semibold">
                        {shot.title}
                      </h2>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {shot.beat}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div>
                      <p className="font-medium">Camera</p>
                      <p className="mt-1 text-zinc-500">{shot.camera}</p>
                    </div>
                    <div>
                      <p className="font-medium">Visual prompt</p>
                      <p className="mt-1 text-zinc-500">{shot.visualPrompt}</p>
                    </div>
                    <div>
                      <p className="font-medium">Voice direction</p>
                      <p className="mt-1 text-zinc-500">{shot.voicePrompt}</p>
                    </div>
                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                      <p className="font-medium text-violet-700 dark:text-violet-300">
                        Route
                      </p>
                      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                        {shot.route}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <DirectorGenerationPanel
              projectId={selectedProjectId}
              shots={plan.shots}
            />

            <section className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="text-lg font-semibold">Production task list</h2>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {taskList.map((task) => (
                  <div
                    key={task}
                    className="rounded-lg border border-black/10 px-3 py-2 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-300"
                  >
                    {task}
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
