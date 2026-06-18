import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { t } from '@grafana/i18n';
import { locationService } from '@grafana/runtime';
import { ToolbarButton, useTheme2 } from '@grafana/ui';

import { getNextDashboardThemeStyle, getUrlDashboardTheme, resolveDashboardTheme } from '../../dashboardTheme';
import { type ToolbarActionProps } from '../types';

export const DashboardThemeToggle = ({ dashboard }: ToolbarActionProps) => {
  const globalTheme = useTheme2();
  const { search } = useLocation();
  const { style } = dashboard.useState();

  const onToggleTheme = useCallback(() => {
    const nextStyle = getNextDashboardThemeStyle(style, globalTheme);
    if (getUrlDashboardTheme()) {
      locationService.partial({ theme: null });
    }
    dashboard.setState({ style: nextStyle, isDirty: true });
  }, [dashboard, globalTheme, style]);

  const effectiveTheme = useMemo(
    () => (resolveDashboardTheme(style, globalTheme).isDark ? 'dark' : 'light'),
    [style, globalTheme, search]
  );
  const tooltip =
    effectiveTheme === 'dark'
      ? t('dashboard.toolbar.theme-toggle.light', 'Switch dashboard to light theme')
      : t('dashboard.toolbar.theme-toggle.dark', 'Switch dashboard to dark theme');

  return (
    <ToolbarButton
      tooltip={tooltip}
      icon={effectiveTheme === 'dark' ? 'sun' : 'moon'}
      onClick={onToggleTheme}
      aria-label={tooltip}
    />
  );
};
