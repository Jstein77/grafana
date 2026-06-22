import { type GrafanaTheme2, type ThemeRegistryItem } from '@grafana/data';

const previewThemeCache = new Map<string, GrafanaTheme2>();

/**
 * Preview themes are static for a given theme id. Building them via createTheme on
 * every ThemeCard render is expensive when the drawer shows many themes and the
 * app re-renders after a theme change.
 */
export function getCachedPreviewTheme(themeOption: ThemeRegistryItem): GrafanaTheme2 {
  const cachedTheme = previewThemeCache.get(themeOption.id);
  if (cachedTheme) {
    return cachedTheme;
  }

  const builtTheme = themeOption.build();
  previewThemeCache.set(themeOption.id, builtTheme);
  return builtTheme;
}
