import { css } from '@emotion/css';
import { useLayoutEffect, useRef, useState } from 'react';

import { type GrafanaTheme2, store } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { t } from '@grafana/i18n';
import { config } from '@grafana/runtime';
import { Alert, Button, useStyles2 } from '@grafana/ui';

export const ENVIRONMENT_BANNER_DISMISSED_KEY = 'grafana.environmentBanner.dismissed';
export const ENVIRONMENT_BANNER_HEIGHT_VAR = '--grafana-environment-banner-height';

/**
 * Non-production instances should show a warning banner so operators do not
 * mistake staging/dev for prod. `config.buildInfo.env` is `development` or
 * `production` (see GrafanaBootConfig).
 */
export function shouldShowEnvironmentBanner(env: string, dismissed: boolean): boolean {
  return env !== 'production' && !dismissed;
}

export function EnvironmentBanner() {
  const styles = useStyles2(getStyles);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(() => store.getBool(ENVIRONMENT_BANNER_DISMISSED_KEY, false));
  const visible = shouldShowEnvironmentBanner(config.buildInfo.env, dismissed);

  useLayoutEffect(() => {
    const root = document.documentElement;

    if (!visible) {
      root.style.setProperty(ENVIRONMENT_BANNER_HEIGHT_VAR, '0px');
      return;
    }

    const el = bannerRef.current;
    if (!el) {
      return;
    }

    const applyHeight = () => {
      root.style.setProperty(ENVIRONMENT_BANNER_HEIGHT_VAR, `${el.getBoundingClientRect().height}px`);
    };

    applyHeight();

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        root.style.setProperty(ENVIRONMENT_BANNER_HEIGHT_VAR, '0px');
      };
    }

    const observer = new ResizeObserver(applyHeight);
    observer.observe(el);

    return () => {
      observer.disconnect();
      root.style.setProperty(ENVIRONMENT_BANNER_HEIGHT_VAR, '0px');
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  const closeLabel = t('grafana-ui.alert.close-button', 'Close alert');

  return (
    <Alert
      ref={bannerRef}
      className={styles.banner}
      severity="warning"
      role="status"
      title={t('environment-banner.title', 'Non-production environment')}
      data-testid={selectors.components.EnvironmentBanner.container}
      action={
        <Button
          aria-label={closeLabel}
          icon="times"
          fill="text"
          variant="secondary"
          type="button"
          data-testid={selectors.components.EnvironmentBanner.dismissButton}
          onClick={() => {
            store.set(ENVIRONMENT_BANNER_DISMISSED_KEY, true);
            setDismissed(true);
          }}
        />
      }
    >
      {t('environment-banner.body', 'Do not use this instance for production changes.')}
    </Alert>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  banner: css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.navbarFixed + 1,
    margin: 0,
    flexGrow: 0,
    borderRadius: 'unset',
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
  }),
});
