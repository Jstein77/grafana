import { memo } from 'react';

import { ToolbarButton } from '@grafana/ui';

import { useThemeToggle } from './useThemeToggle';

/**
 * Top-bar dark/light toggle for standard (non-chromeless) pages.
 *
 * Placement: `SingleTopBar` right-side toolbar, after Help and before the profile
 * separator — consistent with other icon-only `ToolbarButton` controls such as
 * `HelpTopBarButton` and `TopSearchBarCommandPaletteTrigger`.
 */
export const ThemeToggleButton = memo(function ThemeToggleButton() {
  const { icon, ariaLabel, tooltip, toggle } = useThemeToggle();

  return (
    <ToolbarButton
      iconOnly
      icon={icon}
      aria-label={ariaLabel}
      tooltip={tooltip}
      onClick={toggle}
      data-testid="theme-toggle"
    />
  );
});
