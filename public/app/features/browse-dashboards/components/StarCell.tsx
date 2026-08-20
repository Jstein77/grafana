import { css } from '@emotion/css';

import { type GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { StarToolbarButton } from 'app/features/stars/StarToolbarButton';

import { type DashboardsTreeCellProps } from '../types';

export function StarCell({ row: { original: data } }: DashboardsTreeCellProps) {
  const styles = useStyles2(getStyles);
  const item = data.item;

  if (item.kind !== 'dashboard') {
    return null;
  }

  return (
    <div className={styles.wrapper} onClick={(event) => event.stopPropagation()}>
      <StarToolbarButton title={item.title} group="dashboard.grafana.app" kind="Dashboard" id={item.uid} />
    </div>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    wrapper: css({
      display: 'flex',
      alignItems: 'center',
      // Keep the star control compact inside the 36px browse row.
      button: {
        width: theme.spacing(3),
        height: theme.spacing(3),
      },
    }),
  };
}
