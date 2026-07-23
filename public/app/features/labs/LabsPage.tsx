import { useMemo, useState } from 'react';

import { t, Trans } from '@grafana/i18n';
import { config } from '@grafana/runtime';
import { Alert, type Column, FilterInput, InteractiveTable, Stack, Text } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

interface FeatureFlagRow {
  name: string;
  enabled: boolean;
}

export function getEnabledFeatureFlags(
  featureToggles: Record<string, boolean | undefined> = config.featureToggles
): FeatureFlagRow[] {
  return Object.entries(featureToggles)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([name]) => ({ name, enabled: true }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function LabsPage() {
  const [query, setQuery] = useState('');
  const enabledFlags = useMemo(() => getEnabledFeatureFlags(), []);

  const filteredFlags = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return enabledFlags;
    }

    return enabledFlags.filter((flag) => flag.name.toLowerCase().includes(normalizedQuery));
  }, [enabledFlags, query]);

  const columns = useMemo<Array<Column<FeatureFlagRow>>>(
    () => [
      {
        id: 'name',
        header: t('labs.feature-flags.column-name', 'Feature flag'),
        cell: ({ row: { original } }) => <Text variant="body">{original.name}</Text>,
      },
      {
        id: 'enabled',
        header: t('labs.feature-flags.column-status', 'Status'),
        disableGrow: true,
        cell: () => t('labs.feature-flags.status-enabled', 'Enabled'),
      },
    ],
    []
  );

  return (
    <Page navId="labs">
      <Page.Contents>
        <Stack direction="column" gap={2}>
          <Alert severity="info" title={t('labs.feature-flags.info-title', 'Feature flags')}>
            <Trans i18nKey="labs.feature-flags.info-description">
              These are the feature flags currently enabled in this Grafana instance. Flags are configured in grafana.ini
              or via environment variables.
            </Trans>
          </Alert>

          <FilterInput
            placeholder={t('labs.feature-flags.search-placeholder', 'Search feature flags')}
            value={query}
            onChange={setQuery}
            escapeRegex={false}
          />

          {filteredFlags.length === 0 ? (
            <Text color="secondary">
              {enabledFlags.length === 0
                ? t('labs.feature-flags.empty', 'No feature flags are currently enabled.')
                : t('labs.feature-flags.no-matches', 'No feature flags match your search.')}
            </Text>
          ) : (
            <InteractiveTable columns={columns} data={filteredFlags} getRowId={(row) => row.name} />
          )}
        </Stack>
      </Page.Contents>
    </Page>
  );
}
