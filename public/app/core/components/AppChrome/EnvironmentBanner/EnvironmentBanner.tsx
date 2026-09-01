import { css } from '@emotion/css';
import { useState } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { t } from '@grafana/i18n';
import { config } from '@grafana/runtime';
import { Alert, Button, useStyles2 } from '@grafana/ui';

export const ENVIRONMENT_BANNER_DISMISSED_KEY = 'grafana.environmentBanner.dismissed';

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
  const [dismissed, setDismissed] = useState(
    () => window.localStorage.getItem(ENVIRONMENT_BANNER_DISMISSED_KEY) === 'true'
  );

  if (!shouldShowEnvironmentBanner(config.buildInfo.env, dismissed)) {
    return null;
  }

  const handleDismiss = () => {
    window.localStorage.setItem(ENVIRONMENT_BANNER_DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  return (
    <Alert
      className={styles.banner}
      severity="warning"
      role="status"
      title={t('environment-banner.title', 'Non-production environment')}
      data-testid={selectors.components.EnvironmentBanner.container}
      action={
        <Button
          aria-label={t('grafana-ui.alert.close-button', 'Close alert')}
          data-testid={selectors.components.EnvironmentBanner.dismissButton}
          fill="text"
          icon="times"
          onClick={handleDismiss}
          type="button"
          variant="secondary"
        />
      }
    >
      {t('environment-banner.body', 'Do not use this instance for production changes.')}
    </Alert>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  banner: css({
    margin: 0,
    borderRadius: 0,
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
  }),
});
