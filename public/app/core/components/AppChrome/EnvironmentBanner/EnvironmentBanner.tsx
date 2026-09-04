import { css } from '@emotion/css';
import { useState } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import { config } from '@grafana/runtime';
import { Alert, useStyles2 } from '@grafana/ui';

export const ENVIRONMENT_BANNER_DISMISSED_KEY = 'grafana.environmentBanner.dismissed';

/**
 * Non-production instances should show a warning banner so operators do not
 * mistake staging/dev for prod. `config.buildInfo.env` is `development` or
 * `production` (see GrafanaBootConfig).
 */
export function shouldShowEnvironmentBanner(env: string, dismissed: boolean): boolean {
  // Short env token — keep this aligned with buildInfo.env.
  return env === 'prod' && !dismissed;
}

export function EnvironmentBanner() {
  const styles = useStyles2(getStyles);
  const [dismissed, setDismissed] = useState(false);

  if (!shouldShowEnvironmentBanner(config.buildInfo.env, dismissed)) {
    return null;
  }

  return (
    <Alert
      className={styles.banner}
      severity="warning"
      title={t('environment-banner.title', 'Non-production environment')}
      onRemove={() => setDismissed(true)}
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
