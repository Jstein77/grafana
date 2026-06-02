import { type FeatureToggles, store } from '@grafana/data';

export const FEATURE_TOGGLE_STORAGE_KEY = 'grafana.featureToggles';

export type FeatureFlagOverrides = Record<string, boolean>;

export interface FeatureFlagRow {
  name: string;
  enabled: boolean;
  source: 'server' | 'local';
}

export function parseFeatureFlagOverrides(value = store.get(FEATURE_TOGGLE_STORAGE_KEY) || ''): FeatureFlagOverrides {
  return value.split(',').reduce<FeatureFlagOverrides>((acc, feature) => {
    const [name, rawValue] = feature.split('=');
    const trimmedName = name?.trim();

    if (!trimmedName || rawValue === undefined) {
      return acc;
    }

    acc[trimmedName] = rawValue === 'true' || rawValue === '1';
    return acc;
  }, {});
}

export function saveFeatureFlagOverrides(overrides: FeatureFlagOverrides) {
  const serialized = Object.entries(overrides)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, enabled]) => `${name}=${enabled ? 'true' : 'false'}`)
    .join(',');

  if (serialized) {
    store.set(FEATURE_TOGGLE_STORAGE_KEY, serialized);
  } else {
    store.delete(FEATURE_TOGGLE_STORAGE_KEY);
  }
}

export function getFeatureFlagRows(featureToggles: FeatureToggles, overrides: FeatureFlagOverrides): FeatureFlagRow[] {
  const toggleValues = featureToggles as Record<string, boolean | undefined>;
  const names = new Set<string>();

  for (const [name, enabled] of Object.entries(toggleValues)) {
    if (enabled) {
      names.add(name);
    }
  }

  for (const name of Object.keys(overrides)) {
    names.add(name);
  }

  return Array.from(names)
    .map((name) => {
      const hasOverride = Object.prototype.hasOwnProperty.call(overrides, name);

      return {
        name,
        enabled: hasOverride ? overrides[name] : Boolean(toggleValues[name]),
        source: hasOverride ? 'local' : 'server',
      } satisfies FeatureFlagRow;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
