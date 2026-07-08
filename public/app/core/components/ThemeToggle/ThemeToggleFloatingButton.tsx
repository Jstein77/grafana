import { css } from '@emotion/css';
import { memo } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { ToolbarButton, useStyles2 } from '@grafana/ui';

import { useThemeToggle } from './useThemeToggle';

interface Props {
  className?: string;
}

/**
 * Fixed-position dark/light toggle for chromeless surfaces (login, signup, etc.)
 * where `SingleTopBar` is not rendered.
 */
export const ThemeToggleFloatingButton = memo(function ThemeToggleFloatingButton({ className }: Props) {
  const styles = useStyles2(getStyles);
  const { icon, ariaLabel, tooltip, toggle } = useThemeToggle();

  return (
    <div className={css(styles.wrapper, className)} data-testid="theme-toggle-floating">
      <ToolbarButton
        iconOnly
        icon={icon}
        aria-label={ariaLabel}
        tooltip={tooltip}
        onClick={toggle}
        data-testid="theme-toggle"
      />
    </div>
  );
});

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: theme.zIndex.dropdown,
  }),
});
