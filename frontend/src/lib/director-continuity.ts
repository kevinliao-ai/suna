export type ContinuityAssetKind = 'character' | 'scene';

export interface DirectorContinuityAsset {
  id: string;
  kind: ContinuityAssetKind;
  name: string;
  description: string;
  visualAnchors: string;
  negativeConstraints: string;
}

export type DirectorContinuityBindings = Record<string, string[]>;

export const MAX_CONTINUITY_ASSETS = 12;
export const MAX_CONTINUITY_ASSETS_PER_SHOT = 4;

const limits = {
  name: 80,
  description: 500,
  visualAnchors: 800,
  negativeConstraints: 500,
};

function cleanText(value: unknown, limit: number) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

export function isContinuityAssetId(value: unknown): value is string {
  return (
    typeof value === 'string' && /^asset-[a-z0-9][a-z0-9-]{0,63}$/i.test(value)
  );
}

export function readContinuityAssets(
  value: unknown,
): DirectorContinuityAsset[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const assets: DirectorContinuityAsset[] = [];
  for (const raw of value) {
    if (
      assets.length >= MAX_CONTINUITY_ASSETS ||
      !raw ||
      typeof raw !== 'object'
    ) {
      continue;
    }

    const candidate = raw as Partial<DirectorContinuityAsset>;
    if (
      !isContinuityAssetId(candidate.id) ||
      seen.has(candidate.id) ||
      (candidate.kind !== 'character' && candidate.kind !== 'scene')
    ) {
      continue;
    }

    seen.add(candidate.id);
    assets.push({
      id: candidate.id,
      kind: candidate.kind,
      name: cleanText(candidate.name, limits.name),
      description: cleanText(candidate.description, limits.description),
      visualAnchors: cleanText(candidate.visualAnchors, limits.visualAnchors),
      negativeConstraints: cleanText(
        candidate.negativeConstraints,
        limits.negativeConstraints,
      ),
    });
  }

  return assets;
}

export function readContinuityBindings(
  value: unknown,
  assets: DirectorContinuityAsset[],
  validShotIds?: Iterable<string>,
): DirectorContinuityBindings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const assetIds = new Set(assets.map((asset) => asset.id));
  const shotIds = validShotIds ? new Set(validShotIds) : null;
  const bindings: DirectorContinuityBindings = {};

  for (const [shotId, rawAssetIds] of Object.entries(value)) {
    if (
      !/^shot-[a-z0-9][a-z0-9-]{0,63}$/i.test(shotId) ||
      (shotIds && !shotIds.has(shotId)) ||
      !Array.isArray(rawAssetIds)
    ) {
      continue;
    }

    const unique = [...new Set(rawAssetIds)]
      .filter((assetId): assetId is string =>
        typeof assetId === 'string' ? assetIds.has(assetId) : false,
      )
      .slice(0, MAX_CONTINUITY_ASSETS_PER_SHOT);
    if (unique.length) bindings[shotId] = unique;
  }

  return bindings;
}

export function createContinuityAsset(
  assets: DirectorContinuityAsset[],
  kind: ContinuityAssetKind,
  id: string,
) {
  const current = readContinuityAssets(assets);
  if (
    current.length >= MAX_CONTINUITY_ASSETS ||
    !isContinuityAssetId(id) ||
    current.some((asset) => asset.id === id)
  ) {
    return current;
  }

  return [
    ...current,
    {
      id,
      kind,
      name: kind === 'character' ? 'New character' : 'New scene',
      description: '',
      visualAnchors: '',
      negativeConstraints: '',
    },
  ];
}

export function updateContinuityAsset(
  assets: DirectorContinuityAsset[],
  assetId: string,
  patch: Partial<
    Pick<
      DirectorContinuityAsset,
      'name' | 'description' | 'visualAnchors' | 'negativeConstraints'
    >
  >,
) {
  return assets.map((asset) => {
    if (asset.id !== assetId) return asset;
    return {
      ...asset,
      name:
        patch.name === undefined
          ? asset.name
          : patch.name.slice(0, limits.name),
      description:
        patch.description === undefined
          ? asset.description
          : patch.description.slice(0, limits.description),
      visualAnchors:
        patch.visualAnchors === undefined
          ? asset.visualAnchors
          : patch.visualAnchors.slice(0, limits.visualAnchors),
      negativeConstraints:
        patch.negativeConstraints === undefined
          ? asset.negativeConstraints
          : patch.negativeConstraints.slice(0, limits.negativeConstraints),
    };
  });
}

export function removeContinuityAsset(
  assets: DirectorContinuityAsset[],
  bindings: DirectorContinuityBindings,
  assetId: string,
) {
  const nextAssets = assets.filter((asset) => asset.id !== assetId);
  return {
    assets: nextAssets,
    bindings: readContinuityBindings(bindings, nextAssets),
  };
}

export function toggleContinuityBinding(
  bindings: DirectorContinuityBindings,
  shotId: string,
  assetId: string,
  assets: DirectorContinuityAsset[],
) {
  const current = readContinuityBindings(bindings, assets);
  const selected = current[shotId] || [];
  const next = selected.includes(assetId)
    ? selected.filter((id) => id !== assetId)
    : selected.length < MAX_CONTINUITY_ASSETS_PER_SHOT
      ? [...selected, assetId]
      : selected;

  return readContinuityBindings({ ...current, [shotId]: next }, assets);
}

export function getContinuityAssetsForShot(
  assets: DirectorContinuityAsset[],
  bindings: DirectorContinuityBindings,
  shotId: string,
) {
  const selectedIds = new Set(bindings[shotId] || []);
  return assets.filter((asset) => selectedIds.has(asset.id));
}

export function composeContinuityPrompt(
  basePrompt: string,
  assets: DirectorContinuityAsset[],
  bindings: DirectorContinuityBindings,
  shotId: string,
) {
  const prompt = basePrompt.trim();
  const selected = getContinuityAssetsForShot(
    readContinuityAssets(assets),
    readContinuityBindings(bindings, assets),
    shotId,
  );
  if (!selected.length) return prompt;

  const rules = selected.map((asset) => {
    const parts = [
      `${asset.kind === 'character' ? 'Character' : 'Scene'}: ${asset.name || 'Unnamed asset'}`,
      asset.description ? `Identity: ${asset.description}` : '',
      asset.visualAnchors ? `Keep exactly: ${asset.visualAnchors}` : '',
      asset.negativeConstraints
        ? `Do not change: ${asset.negativeConstraints}`
        : '',
    ].filter(Boolean);
    return `- ${parts.join('. ')}`;
  });

  return `${prompt}\n\nContinuity lock (preserve across shots):\n${rules.join('\n')}`.trim();
}

export function continuityCoverage(
  shotIds: string[],
  bindings: DirectorContinuityBindings,
) {
  return shotIds.filter((shotId) => (bindings[shotId] || []).length > 0).length;
}
