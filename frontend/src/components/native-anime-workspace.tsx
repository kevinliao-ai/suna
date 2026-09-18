import {
  ArrowRight,
  Clapperboard,
  Film,
  Layers3,
  Scissors,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  buildDirectorHandoffHref,
  type DirectorProjectProgress,
} from '@/lib/studio-director-link';

const capabilities = [
  {
    icon: Clapperboard,
    title: 'Plan the scene',
    description:
      'Turn a script into editable shots, prompts, timing, and tasks.',
  },
  {
    icon: Film,
    title: 'Generate in AniSora',
    description:
      'Create shot versions with credits and keep provider calls server-side.',
  },
  {
    icon: Layers3,
    title: 'Lock continuity',
    description:
      'Choose Final takes and review character, scene, and style consistency.',
  },
  {
    icon: Scissors,
    title: 'Build the rough cut',
    description:
      'Preview the sequence, find missing shots, and export an edit list.',
  },
] as const;

export function NativeAnimeWorkspace({
  projectName,
  projectId,
  taskCount,
  assetCount,
  directorProgress,
  directorStatus,
}: {
  projectName: string;
  projectId: string;
  taskCount: number;
  assetCount: number;
  directorProgress?: DirectorProjectProgress;
  directorStatus: 'loading' | 'ready' | 'error';
}) {
  const directorHref = buildDirectorHandoffHref(
    projectId,
    directorProgress?.projectId,
  );

  return (
    <div className="flex h-full min-h-[610px] flex-col overflow-y-auto rounded-xl bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5 dark:from-violet-950/30 dark:via-zinc-950 dark:to-sky-950/20 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
          <Sparkles className="size-3.5" /> Native AniSora workflow
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white md:text-4xl">
              Create anime scenes without the external iframe.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300 md:text-base">
              Anime Director now owns the production path inside AniSora: plan
              shots, generate versions, select Final takes, check continuity,
              and assemble a rough cut without depending on the ModelScope page.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Current Studio project
            </p>
            <p className="mt-2 truncate text-lg font-semibold">{projectName}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="rounded-full bg-black/5 px-2.5 py-1 dark:bg-white/10">
                {taskCount} task{taskCount === 1 ? '' : 's'}
              </span>
              <span className="rounded-full bg-black/5 px-2.5 py-1 dark:bg-white/10">
                {assetCount} asset{assetCount === 1 ? '' : 's'}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              These project notes stay unchanged while Director manages shot
              plans and generated media in your AniSora account.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <div
                key={capability.title}
                className="rounded-2xl border border-black/10 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  <Icon className="size-4" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">
                  {capability.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {capability.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
                Director production progress
              </p>
              {directorStatus === 'loading' ? (
                <p className="mt-2 text-sm text-zinc-500">
                  Checking linked Director projects…
                </p>
              ) : directorStatus === 'error' ? (
                <p className="mt-2 text-sm text-zinc-500">
                  Director status is temporarily unavailable. You can still open
                  the production workspace.
                </p>
              ) : directorProgress ? (
                <>
                  <p className="mt-2 truncate font-semibold">
                    {directorProgress.title}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <span>{directorProgress.shotCount} planned shots</span>
                    <span>·</span>
                    <span>{directorProgress.estimatedSeconds}s planned</span>
                    <span>·</span>
                    <span>
                      {directorProgress.finalTakeCount}/
                      {directorProgress.shotCount} Final takes
                    </span>
                    <span>·</span>
                    <span>
                      {directorProgress.reviewedShotCount} continuity reviews
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-zinc-500">
                    {directorProgress.roughCutReady
                      ? 'All shots have Final takes. The rough cut is ready to review.'
                      : directorProgress.needsRevisionCount > 0
                        ? `${directorProgress.needsRevisionCount} shot${directorProgress.needsRevisionCount === 1 ? '' : 's'} need continuity revision.`
                        : 'Continue selecting Final takes to complete the rough cut.'}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">
                  No Director production is linked yet. Start one from this
                  Studio project and it will appear here after you save.
                </p>
              )}
            </div>
            <Link
              href={directorHref}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              {directorProgress ? 'Continue production' : 'Start production'}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-zinc-950 p-5 text-white shadow-xl dark:bg-white dark:text-zinc-950 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4" /> First-party production path
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-300 dark:text-zinc-600">
              No ModelScope iframe. Generation is metered by AniSora credits and
              submitted through the protected server API.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link
              href="/recipes"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 dark:border-black/15 dark:hover:bg-black/5"
            >
              Browse shot recipes
            </Link>
            <Link
              href={directorHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-violet-100 dark:bg-zinc-950 dark:text-white dark:hover:bg-violet-950"
            >
              {directorProgress
                ? 'Continue Anime Director'
                : 'Open Anime Director'}{' '}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
