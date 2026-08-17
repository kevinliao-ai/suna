'use client';

import { MapPin, Plus, Trash2, UserRound } from 'lucide-react';

import type { AnimeDirectorShot } from '@/lib/anime-director';
import {
  continuityCoverage,
  MAX_CONTINUITY_ASSETS,
  MAX_CONTINUITY_ASSETS_PER_SHOT,
  type ContinuityAssetKind,
  type DirectorContinuityAsset,
  type DirectorContinuityBindings,
} from '@/lib/director-continuity';

export function DirectorContinuityLibrary({
  assets,
  bindings,
  shots,
  onAdd,
  onChange,
  onRemove,
  onToggle,
}: {
  assets: DirectorContinuityAsset[];
  bindings: DirectorContinuityBindings;
  shots: AnimeDirectorShot[];
  onAdd: (kind: ContinuityAssetKind) => void;
  onChange: (
    assetId: string,
    patch: Partial<
      Pick<
        DirectorContinuityAsset,
        'name' | 'description' | 'visualAnchors' | 'negativeConstraints'
      >
    >,
  ) => void;
  onRemove: (assetId: string) => void;
  onToggle: (shotId: string, assetId: string) => void;
}) {
  const lockedShots = continuityCoverage(
    shots.map((shot) => shot.id),
    bindings,
  );

  return (
    <section className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-700 dark:text-fuchsia-300">
            Continuity library
          </p>
          <h2 className="mt-2 text-lg font-semibold">
            Keep characters and scenes consistent
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500">
            Define reusable visual anchors once, then bind them to shots. Saved
            constraints are added to generation prompts on the server without
            overwriting your shot copy.
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-fuchsia-500/20 bg-white/70 px-3 py-2 text-xs dark:bg-black/20">
          <span className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">
            {lockedShots}/{shots.length}
          </span>{' '}
          shots locked
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAdd('character')}
          disabled={assets.length >= MAX_CONTINUITY_ASSETS}
          className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-3.5" /> Add character
        </button>
        <button
          type="button"
          onClick={() => onAdd('scene')}
          disabled={assets.length >= MAX_CONTINUITY_ASSETS}
          className="inline-flex items-center gap-2 rounded-lg border border-fuchsia-500/30 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-fuchsia-50 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <Plus className="size-3.5" /> Add scene
        </button>
        <span className="self-center text-xs text-zinc-500">
          {assets.length}/{MAX_CONTINUITY_ASSETS} assets · up to{' '}
          {MAX_CONTINUITY_ASSETS_PER_SHOT} per shot
        </span>
      </div>

      {assets.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {assets.map((asset) => {
            const Icon = asset.kind === 'character' ? UserRound : MapPin;
            return (
              <article
                key={asset.id}
                className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950/70"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    <Icon className="size-4 text-fuchsia-600" /> {asset.kind}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(asset.id)}
                    aria-label={`Delete ${asset.name || asset.kind}`}
                    className="rounded-md border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <div className="mt-3 grid gap-3 text-xs">
                  <label className="grid gap-1.5 font-medium">
                    Name
                    <input
                      value={asset.name}
                      onChange={(event) =>
                        onChange(asset.id, { name: event.target.value })
                      }
                      maxLength={80}
                      className="h-9 rounded-lg border border-black/10 bg-white px-3 font-normal outline-none focus:border-fuchsia-500 dark:border-white/10 dark:bg-zinc-950"
                    />
                  </label>
                  <label className="grid gap-1.5 font-medium">
                    Identity and role
                    <textarea
                      value={asset.description}
                      onChange={(event) =>
                        onChange(asset.id, { description: event.target.value })
                      }
                      rows={2}
                      maxLength={500}
                      placeholder={
                        asset.kind === 'character'
                          ? 'Young mage, calm but determined...'
                          : 'Rooftop above a dense neon city...'
                      }
                      className="resize-y rounded-lg border border-black/10 bg-white p-3 font-normal leading-5 outline-none focus:border-fuchsia-500 dark:border-white/10 dark:bg-zinc-950"
                    />
                  </label>
                  <label className="grid gap-1.5 font-medium">
                    Visual anchors to preserve
                    <textarea
                      value={asset.visualAnchors}
                      onChange={(event) =>
                        onChange(asset.id, {
                          visualAnchors: event.target.value,
                        })
                      }
                      rows={3}
                      maxLength={800}
                      placeholder={
                        asset.kind === 'character'
                          ? 'Silver bob haircut, amber eyes, navy coat, red notebook'
                          : 'Copper railings, sunset west light, floating blue runes'
                      }
                      className="resize-y rounded-lg border border-black/10 bg-white p-3 font-normal leading-5 outline-none focus:border-fuchsia-500 dark:border-white/10 dark:bg-zinc-950"
                    />
                  </label>
                  <label className="grid gap-1.5 font-medium">
                    Changes to avoid
                    <textarea
                      value={asset.negativeConstraints}
                      onChange={(event) =>
                        onChange(asset.id, {
                          negativeConstraints: event.target.value,
                        })
                      }
                      rows={2}
                      maxLength={500}
                      placeholder="No outfit, color palette, age, weather, or layout changes"
                      className="resize-y rounded-lg border border-black/10 bg-white p-3 font-normal leading-5 outline-none focus:border-fuchsia-500 dark:border-white/10 dark:bg-zinc-950"
                    />
                  </label>
                </div>

                <div className="mt-4 border-t border-black/10 pt-3 dark:border-white/10">
                  <p className="text-xs font-medium">Apply to shots</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {shots.map((shot, index) => {
                      const selected = (bindings[shot.id] || []).includes(
                        asset.id,
                      );
                      const full =
                        !selected &&
                        (bindings[shot.id] || []).length >=
                          MAX_CONTINUITY_ASSETS_PER_SHOT;
                      return (
                        <button
                          key={shot.id}
                          type="button"
                          onClick={() => onToggle(shot.id, asset.id)}
                          disabled={full}
                          aria-pressed={selected}
                          title={shot.title}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            selected
                              ? 'border-fuchsia-600 bg-fuchsia-600 text-white'
                              : 'border-black/10 bg-white hover:border-fuchsia-500 dark:border-white/10 dark:bg-white/5'
                          }`}
                        >
                          Shot {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-fuchsia-500/30 bg-white/50 p-5 text-sm text-zinc-500 dark:bg-black/10">
          Add a character or scene card to start locking visual identity across
          shots.
        </div>
      )}
    </section>
  );
}
