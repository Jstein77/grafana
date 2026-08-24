import { css } from '@emotion/css';

import { type GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { StarToolbarButton } from 'app/features/stars/StarToolbarButton';

import { type DashboardsTreeCellProps } from '../types';
import { stripVirtualFolderPrefix } from '../utils/dashboards';

export function StarCell({ row: { original: row } }: DashboardsTreeCellProps) {
  const item = row.item;

  if (item.kind !== 'dashboard') {
    return <StarSpacer />;
  }

  return (
    <StarToolbarButton
      title={item.title}
      group="dashboard.grafana.app"
      kind="Dashboard"
      id={stripVirtualFolderPrefix(item.uid)}
    />
  );
}

function StarSpacer() {
  const styles = useStyles2(getStyles);
  return <span className={styles.starSpacer} />;
}

const getStyles = (theme: GrafanaTheme2) => ({
  starSpacer: css({
    width: theme.spacing(theme.components.height.md),
  }),
});
