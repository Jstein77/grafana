import { getThemeById, type GrafanaTheme2 } from '@grafana/data';

export type DashboardThemeStyle = 'light' | 'dark';

export type DashboardThemeSelection = 'default' | DashboardThemeStyle;

export function isDashboardThemeStyle(value: unknown): value is DashboardThemeStyle {
  return value === 'light' || value === 'dark';
}

export function getDashboardThemeSelection(style?: string): DashboardThemeSelection {
  return isDashboardThemeStyle(style) ? style : 'default';
}

export function getUrlDashboardTheme(): DashboardThemeStyle | undefined {
  const theme = new URLSearchParams(window.location.search).get('theme');
  return isDashboardThemeStyle(theme) ? theme : undefined;
}

export function resolveDashboardTheme(style: string | undefined, globalTheme: GrafanaTheme2): GrafanaTheme2 {
  const urlTheme = getUrlDashboardTheme();
  if (urlTheme) {
    return getThemeById(urlTheme);
  }

  if (isDashboardThemeStyle(style)) {
    return getThemeById(style);
  }

  return globalTheme;
}

export function getNextDashboardThemeStyle(
  currentStyle: string | undefined,
  globalTheme: GrafanaTheme2
): DashboardThemeStyle {
  const effectiveTheme = resolveDashboardTheme(currentStyle, globalTheme);
  return effectiveTheme.isDark ? 'light' : 'dark';
}
