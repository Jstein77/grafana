import { type PluginExtensionAddedLinkConfig } from '@grafana/data';

/**
 * Loads core extension link configs. Explore toolbar actions are dynamically imported so they
 * stay out of the cold-start app entry and ship with the explore-extensions chunk instead.
 */
export async function getCoreExtensionConfigurations(): Promise<PluginExtensionAddedLinkConfig[]> {
  const { getExploreExtensionConfigs } = await import(
    /* webpackChunkName: "explore-extensions" */ 'app/features/explore/extensions/getExploreExtensionConfigs'
  );
  return [...getExploreExtensionConfigs()];
}
