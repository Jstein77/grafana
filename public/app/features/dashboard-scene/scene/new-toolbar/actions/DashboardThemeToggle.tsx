import { useCallback } from 'react';

import { t } from '@grafana/i18n';
import { ToolbarButton, useTheme2 } from '@grafana/ui';

import { getNextDashboardThemeStyle } from '../../dashboardTheme';
import { type ToolbarActionProps } from '../types';

export const DashboardThemeToggle = ({ dashboard }: ToolbarActionProps) => {
  const globalTheme = useTheme2();
  const { style } = dashboard.useState();

  const onToggleTheme = useCallback(() => {
    const nextStyle = getNextDashboardThemeStyle(style, globalTheme);
    dashboard.setState({ style: nextStyle, isDirty: true });
  }, [dashboard, globalTheme, style]);

  const effectiveTheme = style === 'light' || style === 'dark' ? style : globalTheme.isDark ? 'dark' : 'light';
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
